/**
 * Auth Session API Route
 * Phase 15.4: Production Wiring & Demo Surface
 *
 * Purpose:
 * - Check if user is authenticated
 * - Return user ID if authenticated
 * - Return demo mode if not authenticated
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createRouteSupabaseClient } from '@aud-web/lib/supabase/server'

const log = logger.scope('AuthSessionAPI')

export async function GET() {
  try {
    const supabase = await createRouteSupabaseClient()
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      log.error('Failed to retrieve session', error)
      return NextResponse.json({ error: 'Failed to verify authentication' }, { status: 500 })
    }

    if (!session) {
      log.info('Unauthenticated session request')
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        metadata: session.user.user_metadata,
      },
      expiresAt: session.expires_at,
    })
  } catch (error) {
    log.error('Session check failed', error)
    return NextResponse.json(
      {
        error: 'Session check failed',
      },
      { status: 500 }
    )
  }
}
