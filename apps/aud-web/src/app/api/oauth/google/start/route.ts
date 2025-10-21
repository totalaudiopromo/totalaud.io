/**
 * OAuth Start Endpoint
 *
 * POST /api/oauth/google/start
 * Body: { provider: "gmail" | "google_sheets" }
 *
 * Returns: { redirectUrl: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@aud-web/lib/supabase/server'
import { getGoogleAuthUrl, type IntegrationType } from '@aud-web/lib/oauth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { provider } = body as { provider: IntegrationType }

    if (!provider || !['gmail', 'google_sheets'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Must be "gmail" or "google_sheets"' },
        { status: 400 }
      )
    }

    // Get current user
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate OAuth URL with PKCE
    const { url } = await getGoogleAuthUrl(supabase as any, user.id, provider)

    return NextResponse.json({ redirectUrl: url })
  } catch (error) {
    console.error('[OAuth Start] Error:', error)
    const message = error instanceof Error ? error.message : 'Failed to start OAuth flow'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
