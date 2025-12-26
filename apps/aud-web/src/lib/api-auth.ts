/**
 * API Authentication Middleware
 *
 * Provides a withAuth() wrapper to eliminate duplicate session validation code
 * across API routes.
 *
 * Usage:
 * ```typescript
 * export const POST = withAuth(async ({ session, userId, supabase, req }) => {
 *   // Handler code with guaranteed authentication
 *   return NextResponse.json({ success: true })
 * })
 * ```
 */

import { NextRequest, NextResponse } from 'next/server'
import type { Session, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@total-audio/schemas-database'
import { createRouteSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

const log = logger.scope('APIAuth')

// ============================================================================
// Types
// ============================================================================

/**
 * Authenticated context passed to API handlers
 */
export interface AuthContext {
  /** Supabase session (guaranteed to exist) */
  session: Session
  /** Authenticated user ID (extracted from session) */
  userId: string
  /** Supabase client (configured for route handlers) */
  supabase: SupabaseClient<Database>
  /** Original Next.js request object */
  req: NextRequest
}

/**
 * Authenticated API handler function
 */
export type AuthenticatedHandler = (context: AuthContext) => Promise<NextResponse>

// ============================================================================
// Middleware
// ============================================================================

/**
 * Wraps an API handler with authentication validation
 *
 * Automatically:
 * - Creates Supabase client
 * - Validates session
 * - Returns 401 if unauthenticated
 * - Returns 500 if session validation fails
 * - Passes { session, userId, supabase, req } to handler
 *
 * @param handler - Authenticated API handler function
 * @returns Next.js route handler
 *
 * @example
 * ```typescript
 * export const POST = withAuth(async ({ session, userId, supabase, req }) => {
 *   const body = await req.json()
 *
 *   const { data, error } = await supabase
 *     .from('my_table')
 *     .select('*')
 *     .eq('user_id', userId)
 *
 *   return NextResponse.json({ success: true, data })
 * })
 * ```
 */
export function withAuth(
  handler: AuthenticatedHandler
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest) => {
    try {
      // Create authenticated Supabase client
      const supabase = await createRouteSupabaseClient()

      // Get session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      // Handle session validation errors
      if (sessionError) {
        log.error('Failed to verify session', sessionError, {
          path: req.nextUrl.pathname,
        })
        return NextResponse.json({ error: 'Failed to verify authentication' }, { status: 500 })
      }

      // Handle missing session (unauthenticated)
      if (!session) {
        log.warn('Unauthenticated request', {
          path: req.nextUrl.pathname,
        })
        return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
      }

      // Extract user ID from session
      const userId = session.user.id

      // Call handler with authenticated context
      return await handler({
        session,
        userId,
        supabase,
        req,
      })
    } catch (error) {
      log.error('Authentication middleware error', error, {
        path: req.nextUrl.pathname,
      })
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}
