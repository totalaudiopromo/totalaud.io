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
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import { cookies } from 'next/headers'

const log = logger.scope('AuthSessionAPI')

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      log.warn('Supabase env vars missing, returning unauthenticated')
      return NextResponse.json({
        authenticated: false,
        userId: null,
      })
    }

    const cookieStore = await cookies()
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storageKey: 'supabase-auth-token',
      },
    })

    // Get session from Supabase
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      log.error('Failed to get session', error)
      return NextResponse.json({
        authenticated: false,
        userId: null,
      })
    }

    if (session?.user) {
      log.info('User authenticated', { userId: session.user.id })
      return NextResponse.json({
        authenticated: true,
        userId: session.user.id,
      })
    }

    return NextResponse.json({
      authenticated: false,
      userId: null,
    })
  } catch (error) {
    log.error('Session check failed', error)
    return NextResponse.json(
      {
        authenticated: false,
        userId: null,
        error: 'Session check failed',
      },
      { status: 500 }
    )
  }
}
