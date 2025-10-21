/**
 * OAuth Callback Endpoint
 *
 * GET /api/oauth/google/callback?code=xxx&state=xxx
 *
 * Handles Google OAuth redirect, exchanges code for tokens,
 * saves to database, and redirects to dashboard.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@aud-web/lib/supabase/server'
import {
  verifyStateToken,
  exchangeCodeForTokens,
  saveIntegrationTokens,
  type IntegrationType,
} from '@aud-web/lib/oauth'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Handle OAuth errors (user denied access, etc.)
  if (error) {
    console.error('[OAuth Callback] OAuth error:', error)
    return NextResponse.redirect(`${appUrl}/dashboard?error=oauth_denied`)
  }

  // Validate required parameters
  if (!code || !state) {
    console.error('[OAuth Callback] Missing code or state')
    return NextResponse.redirect(`${appUrl}/dashboard?error=oauth_invalid`)
  }

  try {
    const supabase = createClient()

    // Verify state token (CSRF protection)
    // We need to try both gmail and google_sheets since state doesn't encode provider
    let verification = await verifyStateToken(supabase as any, state, 'gmail')
    let provider: IntegrationType = 'gmail'

    if (!verification.valid) {
      verification = await verifyStateToken(supabase as any, state, 'google_sheets')
      provider = 'google_sheets'
    }

    if (!verification.valid || !verification.userId || !verification.verifier) {
      console.error('[OAuth Callback] Invalid state token')
      return NextResponse.redirect(`${appUrl}/dashboard?error=oauth_invalid_state`)
    }

    // Exchange authorization code for tokens
    const tokens = await exchangeCodeForTokens(code, verification.verifier)

    // Save tokens to database
    await saveIntegrationTokens(supabase as any, verification.userId, provider, tokens)

    // Log successful connection
    await supabase.from('integration_sync_logs').insert({
      user_id: verification.userId,
      integration_type: provider,
      status: 'success',
      records_synced: 0,
      sync_duration_ms: 0,
    })

    // Redirect to dashboard with success message
    const providerName = provider === 'gmail' ? 'Gmail' : 'Google Sheets'
    return NextResponse.redirect(
      `${appUrl}/dashboard?integration=${provider}&connected=true&name=${encodeURIComponent(providerName)}`
    )
  } catch (error) {
    console.error('[OAuth Callback] Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'

    // Log failed connection attempt
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      await supabase.from('integration_sync_logs').insert({
        user_id: user.id,
        integration_type: 'gmail', // fallback
        status: 'error',
        records_synced: 0,
        sync_duration_ms: 0,
        error_message: message,
      })
    }

    return NextResponse.redirect(`${appUrl}/dashboard?error=oauth_failed&message=${encodeURIComponent(message)}`)
  }
}
