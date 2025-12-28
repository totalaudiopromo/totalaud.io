/**
 * API Middleware
 *
 * Centralised authentication and authorisation middleware for API routes.
 * Reduces code duplication and ensures consistent auth handling.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import type { Session, User } from '@supabase/supabase-js'

const log = logger.scope('APIMiddleware')

// Types
export interface AuthenticatedContext {
  user: User
  session: Session
}

export interface AuthenticatedRequest extends NextRequest {
  auth: AuthenticatedContext
}

type AuthenticatedHandler<T = unknown> = (
  request: AuthenticatedRequest,
  context?: T
) => Promise<NextResponse>

export type RouteHandler<T = unknown> = (request: NextRequest, context?: T) => Promise<NextResponse>

/**
 * Authentication middleware wrapper
 *
 * Wraps an API route handler to require authentication.
 * Returns 401 if not authenticated, otherwise passes user context.
 *
 * @example
 * ```ts
 * export const GET = withAuth(async (request) => {
 *   const { user } = request.auth
 *   // user is guaranteed to be authenticated here
 *   return NextResponse.json({ userId: user.id })
 * })
 * ```
 */
export function withAuth<T = unknown>(handler: AuthenticatedHandler<T>): RouteHandler<T> {
  return async (request: NextRequest, context?: T): Promise<NextResponse> => {
    try {
      const supabase = await createRouteSupabaseClient()
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        log.error('Session verification failed', sessionError)
        return NextResponse.json({ error: 'Failed to verify authentication' }, { status: 500 })
      }

      if (!session) {
        return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
      }

      // Attach auth context to request
      const authenticatedRequest = request as AuthenticatedRequest
      authenticatedRequest.auth = {
        user: session.user,
        session,
      }

      return handler(authenticatedRequest, context)
    } catch (error) {
      log.error('Auth middleware error', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}

/**
 * Rate limiting configuration
 */
interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
}

// In-memory rate limit store (for production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Rate limiting middleware wrapper
 *
 * Limits requests per IP address within a time window.
 *
 * @example
 * ```ts
 * export const POST = withRateLimit(
 *   { windowMs: 60000, maxRequests: 10 },
 *   async (request) => {
 *     // Max 10 requests per minute
 *     return NextResponse.json({ success: true })
 *   }
 * )
 * ```
 */
export function withRateLimit<T = unknown>(
  config: RateLimitConfig,
  handler: RouteHandler<T>
): RouteHandler<T> {
  return async (request: NextRequest, context?: T): Promise<NextResponse> => {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous'
    const now = Date.now()
    const key = `${ip}:${request.nextUrl.pathname}`

    // Get or create rate limit entry
    let entry = rateLimitStore.get(key)

    if (!entry || entry.resetTime < now) {
      entry = { count: 0, resetTime: now + config.windowMs }
      rateLimitStore.set(key, entry)
    }

    entry.count++

    if (entry.count > config.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
      log.warn('Rate limit exceeded', { ip, path: request.nextUrl.pathname })

      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetTime.toString(),
          },
        }
      )
    }

    // Add rate limit headers
    const response = await handler(request, context)
    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', (config.maxRequests - entry.count).toString())
    response.headers.set('X-RateLimit-Reset', entry.resetTime.toString())

    return response
  }
}

/**
 * Combine multiple middleware wrappers
 *
 * @example
 * ```ts
 * export const POST = compose(
 *   withAuth,
 *   (handler) => withRateLimit({ windowMs: 60000, maxRequests: 10 }, handler)
 * )(async (request) => {
 *   // Authenticated and rate limited
 *   return NextResponse.json({ success: true })
 * })
 * ```
 */
export function compose<T = unknown>(
  ...middlewares: Array<(handler: RouteHandler<T>) => RouteHandler<T>>
): (handler: RouteHandler<T>) => RouteHandler<T> {
  return (handler: RouteHandler<T>) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler)
  }
}

/**
 * Error handling wrapper
 *
 * Catches unhandled errors and returns appropriate responses.
 */
export function withErrorHandling<T = unknown>(handler: RouteHandler<T>): RouteHandler<T> {
  return async (request: NextRequest, context?: T): Promise<NextResponse> => {
    try {
      return await handler(request, context)
    } catch (error) {
      log.error('Unhandled API error', error)

      // Don't expose internal errors in production
      const message =
        process.env.NODE_ENV === 'development'
          ? error instanceof Error
            ? error.message
            : 'Unknown error'
          : 'Internal server error'

      return NextResponse.json({ error: message }, { status: 500 })
    }
  }
}
