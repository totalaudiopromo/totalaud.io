/**
 * GET /api/integrations/gmail/connect
 *
 * Starts the Gmail OAuth flow (Phase 6, docs/ROADMAP_2026.md — pitches go
 * out from the artist's own inbox). Sets a short-lived state cookie for
 * CSRF protection and redirects to Google's consent screen.
 */

import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/requireAuth'
import { buildGmailAuthUrl, GMAIL_STATE_COOKIE, isGmailConfigured } from '@/lib/integrations/gmail'
import { isProduction } from '@/lib/env'
import { nanoid } from 'nanoid'

export async function GET(): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  if (!isGmailConfigured()) {
    return NextResponse.json(
      { error: 'Gmail is not configured on this deployment' },
      { status: 503 }
    )
  }

  const state = nanoid(32)
  const response = NextResponse.redirect(buildGmailAuthUrl(state))
  response.cookies.set(GMAIL_STATE_COOKIE, state, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    maxAge: 600,
    path: '/api/integrations/gmail',
  })
  return response
}
