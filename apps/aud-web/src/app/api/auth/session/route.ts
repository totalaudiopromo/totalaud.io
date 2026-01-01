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
import { requireAuth } from '@/lib/api/auth'

const log = logger.scope('AuthSessionAPI')

export async function GET() {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) {
      if (auth.status === 401) {
        log.info('Unauthenticated session request')
      }
      return auth
    }

    const { session } = auth

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
