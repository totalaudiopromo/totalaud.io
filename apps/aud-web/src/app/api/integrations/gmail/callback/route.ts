/**
 * GET /api/integrations/gmail/callback
 *
 * Completes the Gmail OAuth flow: verifies the state cookie, exchanges the
 * code for tokens, stores them server-side (service role only) and sends
 * the artist back to the workspace. Errors land back in the workspace with
 * a query flag rather than a dead end.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createGmailClient } from '@total-audio/core-integrations'
import { requireAuth } from '@/lib/api/requireAuth'
import {
  exchangeGmailCode,
  GMAIL_STATE_COOKIE,
  isGmailConfigured,
  saveGmailConnection,
} from '@/lib/integrations/gmail'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'

const log = logger.scope('GmailCallbackRoute')

function workspaceRedirect(request: NextRequest, flag: 'connected' | 'error'): NextResponse {
  const base = env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin
  const response = NextResponse.redirect(`${base.replace(/\/$/, '')}/workspace?gmail=${flag}`)
  response.cookies.delete(GMAIL_STATE_COOKIE)
  return response
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  if (!isGmailConfigured()) {
    return workspaceRedirect(request, 'error')
  }

  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')
  const expectedState = request.cookies.get(GMAIL_STATE_COOKIE)?.value

  if (!code || !state || !expectedState || state !== expectedState) {
    log.warn('Gmail callback rejected', { hasCode: !!code, stateMatches: state === expectedState })
    return workspaceRedirect(request, 'error')
  }

  try {
    const tokens = await exchangeGmailCode(code)
    const profile = await createGmailClient(tokens.access_token).getUserProfile()
    await saveGmailConnection(auth.user.id, profile.email, tokens)
    return workspaceRedirect(request, 'connected')
  } catch (error) {
    log.error('Gmail connection failed', error instanceof Error ? error : undefined)
    return workspaceRedirect(request, 'error')
  }
}
