import { NextResponse } from 'next/server'
import type { Session } from '@supabase/supabase-js'
import { createRouteSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

const log = logger.scope('ApiAuth')

export interface AuthContext {
  supabase: Awaited<ReturnType<typeof createRouteSupabaseClient>>
  session: Session
}

interface AuthFailureHandlers {
  onSessionError?: () => NextResponse
  onUnauthenticated?: () => NextResponse
}

export async function requireAuth(
  handlers: AuthFailureHandlers = {}
): Promise<AuthContext | NextResponse> {
  const supabase = await createRouteSupabaseClient()
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    log.error('Session verification failed', error)
    return (
      handlers.onSessionError?.() ||
      NextResponse.json({ error: 'Failed to verify authentication' }, { status: 500 })
    )
  }

  if (!session) {
    return (
      handlers.onUnauthenticated?.() ||
      NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    )
  }

  return { supabase, session }
}
