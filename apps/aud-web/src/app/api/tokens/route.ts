/**
 * Personal access tokens (Phase 6 — bring your own assistant).
 *
 * GET  — list the signed-in artist's tokens (metadata only)
 * POST — create a token; the full token appears once in this response
 *        and is never retrievable again
 */

import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import { requireAuth } from '@/lib/api/requireAuth'
import { validateRequestBody, validationErrorResponse } from '@/lib/api-validation'
import { generateToken, hashToken } from '@/lib/api/tokens'
import { getSupabaseServiceRoleClient } from '@/lib/supabase/serviceRole'
import { logger } from '@/lib/logger'

const log = logger.scope('TokensRoute')

const MAX_ACTIVE_TOKENS = 5

const createSchema = z.object({
  label: z.string().min(1, 'Give the token a name').max(60),
})

export async function GET(): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  const { data, error } = await auth.supabase
    .from('user_api_tokens')
    .select('id, label, token_last4, created_at, last_used_at, revoked_at')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false })

  if (error) {
    log.error('Token list failed', error)
    return NextResponse.json({ error: 'Could not load tokens' }, { status: 500 })
  }

  return NextResponse.json({ tokens: data ?? [] })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  let body: z.infer<typeof createSchema>
  try {
    body = await validateRequestBody(request, createSchema)
  } catch (error) {
    if (error instanceof ZodError) return validationErrorResponse(error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const admin = getSupabaseServiceRoleClient()

  const { count } = await admin
    .from('user_api_tokens')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', auth.user.id)
    .is('revoked_at', null)

  if ((count ?? 0) >= MAX_ACTIVE_TOKENS) {
    return NextResponse.json(
      { error: `You can hold ${MAX_ACTIVE_TOKENS} active tokens — revoke one first` },
      { status: 409 }
    )
  }

  const token = generateToken()
  const { data, error } = await admin
    .from('user_api_tokens')
    .insert({
      user_id: auth.user.id,
      label: body.label.trim(),
      token_hash: hashToken(token),
      token_last4: token.slice(-4),
    })
    .select('id, label, token_last4, created_at')
    .single()

  if (error || !data) {
    log.error('Token creation failed', error ?? undefined)
    return NextResponse.json({ error: 'Could not create the token' }, { status: 500 })
  }

  log.info('Token created', { userId: auth.user.id, tokenId: data.id })

  // The only time the full token is ever returned
  return NextResponse.json({ token, ...data }, { status: 201 })
}
