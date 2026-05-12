/**
 * Lead-magnet email capture for totalaud.io.
 *
 * POST { email, source, metadata? }
 *
 * Mirrors the newsjack + spotcheck capture endpoints so the three side-products
 * share one source-tag vocabulary. Currently fed by /pre-flight (47-item checklist).
 *
 * - Writes to public.lead_captures (idempotent on email+source)
 * - Sends a confirmation email via Resend if configured
 * - Returns 200 even on duplicate to avoid email-enumeration
 *
 * Graceful no-op: if SUPABASE_SERVICE_ROLE_KEY or the table is missing,
 * the route still returns ok:true so the UI never silently fails the user.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email'
import { env, isEmailConfigured } from '@/lib/env'

const SOURCE_TO_SUBJECT: Record<string, string> = {
  'totalaud-pre-flight': 'Your Pre-Flight checklist is saved',
}

const SOURCE_TO_INTRO: Record<string, string> = {
  'totalaud-pre-flight':
    'Your progress on the 47-item Pre-Flight checklist is tied to this email. ' +
    'If you switch devices or want to come back to it, just open the page again — ' +
    "we'll pick up where you left off.",
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254
}

function isValidSource(source: string): boolean {
  return /^[a-z0-9-]{1,80}$/.test(source)
}

export async function POST(req: NextRequest) {
  let body: { email?: string; source?: string; metadata?: Record<string, unknown> }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const email = (body.email ?? '').trim().toLowerCase()
  const source = (body.source ?? '').trim()
  const metadata = body.metadata ?? {}

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 })
  }
  if (!isValidSource(source)) {
    return NextResponse.json({ error: 'invalid source' }, { status: 400 })
  }

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
  if (supabaseUrl && serviceKey) {
    try {
      const supabase = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false },
      })
      await supabase
        .from('lead_captures')
        .upsert({ email, source, metadata }, { onConflict: 'email,source', ignoreDuplicates: true })
    } catch (err) {
      console.error('[lead-capture] Supabase write failed (continuing)', err)
    }
  } else {
    console.warn('[lead-capture] Supabase env missing — capture not persisted')
  }

  if (isEmailConfigured()) {
    const subject = SOURCE_TO_SUBJECT[source] ?? `Welcome to ${source}`
    const intro = SOURCE_TO_INTRO[source] ?? `You're on the list for ${source}.`
    const text =
      `Hi,\n\n${intro}\n\n` +
      `If you ever want off this list, reply with "remove" and you're out same-day.\n\n` +
      `Chris\ntotalaud.io`
    await sendEmail({
      to: email,
      subject,
      html: `<p>Hi,</p><p>${intro}</p><p>If you ever want off this list, reply with "remove" and you're out same-day.</p><p>Chris<br>totalaud.io</p>`,
      text,
      from: 'totalaud.io <info@totalaudiopromo.com>',
    }).catch((err) => {
      console.error('[lead-capture] Resend send failed (continuing)', err)
    })
  }

  return NextResponse.json({ ok: true })
}
