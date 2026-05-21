/**
 * Waitlist signup endpoint — totalaud.io
 *
 * Accepts POST { email, source?, utm_medium?, utm_campaign? }
 * Inserts into totalaud_io_waitlist (Supabase, anon policy).
 * Idempotent on email — duplicate submissions return 200.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Supabase credentials not configured')
  }

  return createClient(url, key, { auth: { persistSession: false } })
}

export async function POST(req: NextRequest) {
  let body: Record<string, string>

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email, source, utm_medium, utm_campaign } = body

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const supabase = getSupabase()

  const { error } = await supabase.from('totalaud_io_waitlist').insert({
    email: email.toLowerCase().trim(),
    source: source || null,
    utm_medium: utm_medium || null,
    utm_campaign: utm_campaign || null,
  })

  if (error) {
    // Unique constraint — already on the list
    if (error.code === '23505') {
      return NextResponse.json({ ok: true, already: true })
    }
    console.error('[waitlist] insert error', error)
    return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
