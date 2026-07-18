/**
 * POST /api/pitch/send
 *
 * Sends a pitch from the artist's own connected Gmail inbox (Phase 6,
 * docs/ROADMAP_2026.md). Only ever runs when the artist presses send —
 * nothing in the product auto-sends. The idempotency key makes a retried
 * request return the original send instead of emailing twice.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import { createGmailClient } from '@total-audio/core-integrations'
import { requireAuth } from '@/lib/api/requireAuth'
import { validateRequestBody, validationErrorResponse } from '@/lib/api-validation'
import {
  getFreshAccessToken,
  getGmailConnection,
  isGmailConfigured,
} from '@/lib/integrations/gmail'
import { getSupabaseServiceRoleClient } from '@/lib/supabase/serviceRole'
import { logger } from '@/lib/logger'

const log = logger.scope('PitchSendRoute')

const sendSchema = z.object({
  to: z.string().email().max(320),
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(10_000),
  idempotency_key: z.string().min(8).max(100).optional(),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  if (!isGmailConfigured()) {
    return NextResponse.json(
      { error: 'Gmail is not configured on this deployment' },
      { status: 503 }
    )
  }

  let body: z.infer<typeof sendSchema>
  try {
    body = await validateRequestBody(request, sendSchema)
  } catch (error) {
    if (error instanceof ZodError) return validationErrorResponse(error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const supabase = getSupabaseServiceRoleClient()

  // A retried request with the same key returns the original send
  if (body.idempotency_key) {
    const { data: existing } = await supabase
      .from('pitch_sends')
      .select('gmail_message_id, gmail_thread_id, sent_at')
      .eq('user_id', auth.user.id)
      .eq('idempotency_key', body.idempotency_key)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({
        sent: true,
        duplicate: true,
        message_id: existing.gmail_message_id,
        thread_id: existing.gmail_thread_id,
        sent_at: existing.sent_at,
      })
    }
  }

  const connection = await getGmailConnection(auth.user.id)
  if (!connection) {
    return NextResponse.json(
      { error: 'Connect your Gmail first — pitches go out from your own inbox.', connected: false },
      { status: 409 }
    )
  }

  const accessToken = await getFreshAccessToken(auth.user.id, connection)
  if (!accessToken) {
    return NextResponse.json(
      {
        error: 'Your Gmail connection has lapsed — reconnect and try again.',
        connected: false,
      },
      { status: 409 }
    )
  }

  try {
    const result = await createGmailClient(accessToken).sendEmail({
      to: body.to,
      subject: body.subject,
      body: body.body,
    })

    const { error: insertError } = await supabase.from('pitch_sends').insert({
      user_id: auth.user.id,
      idempotency_key: body.idempotency_key ?? null,
      to_email: body.to,
      subject: body.subject,
      gmail_message_id: result.messageId,
      gmail_thread_id: result.threadId,
    })
    if (insertError) {
      // The email is out; losing the record should not read as a failure
      log.warn('Could not record pitch send', { code: insertError.code })
    }

    return NextResponse.json({
      sent: true,
      message_id: result.messageId,
      thread_id: result.threadId,
    })
  } catch (error) {
    log.error('Pitch send failed', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { error: 'The send did not go through — Gmail may need reconnecting.' },
      { status: 502 }
    )
  }
}
