/**
 * API Middleware Tests
 *
 * Tests for authentication, rate limiting, and error handling middleware.
 *
 * @vitest-environment node
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { withAuth, withRateLimit, withErrorHandling, compose } from '../middleware'
import type { RouteHandler } from '../middleware'

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createRouteSupabaseClient: vi.fn(),
}))

// Import after mock
import { createRouteSupabaseClient } from '@/lib/supabase/server'

// Helper to create mock request
function createMockRequest(
  options: {
    method?: string
    url?: string
    headers?: Record<string, string>
  } = {}
): NextRequest {
  const { method = 'GET', url = 'http://localhost:3000/api/test', headers = {} } = options

  return new NextRequest(url, {
    method,
    headers: new Headers(headers),
  })
}

describe('API Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('withAuth', () => {
    it('returns 401 when no session exists', async () => {
      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: null },
            error: null,
          }),
        },
      }
      vi.mocked(createRouteSupabaseClient).mockResolvedValue(
        mockSupabase as unknown as Awaited<ReturnType<typeof createRouteSupabaseClient>>
      )

      const handler = vi.fn()
      const wrappedHandler = withAuth(handler)
      const request = createMockRequest()

      const response = await wrappedHandler(request)
      const json = await response.json()

      expect(response.status).toBe(401)
      expect(json.error).toBe('Unauthorised')
      expect(handler).not.toHaveBeenCalled()
    })

    it('returns 500 when session verification fails', async () => {
      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: null },
            error: new Error('Session error'),
          }),
        },
      }
      vi.mocked(createRouteSupabaseClient).mockResolvedValue(
        mockSupabase as unknown as Awaited<ReturnType<typeof createRouteSupabaseClient>>
      )

      const handler = vi.fn()
      const wrappedHandler = withAuth(handler)
      const request = createMockRequest()

      const response = await wrappedHandler(request)
      const json = await response.json()

      expect(response.status).toBe(500)
      expect(json.error).toBe('Failed to verify authentication')
      expect(handler).not.toHaveBeenCalled()
    })

    it('calls handler with auth context when authenticated', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        access_token: 'token-123',
      }
      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: mockSession },
            error: null,
          }),
        },
      }
      vi.mocked(createRouteSupabaseClient).mockResolvedValue(
        mockSupabase as unknown as Awaited<ReturnType<typeof createRouteSupabaseClient>>
      )

      const handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }))
      const wrappedHandler = withAuth(handler)
      const request = createMockRequest()

      const response = await wrappedHandler(request)
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json.success).toBe(true)
      expect(handler).toHaveBeenCalledTimes(1)

      // Check that auth context was attached
      const calledRequest = handler.mock.calls[0][0]
      expect(calledRequest.auth.user.id).toBe('user-123')
      expect(calledRequest.auth.session).toBe(mockSession)
    })
  })

  describe('withRateLimit', () => {
    it('allows requests within limit', async () => {
      const handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }))
      const config = { windowMs: 60000, maxRequests: 10 }
      const wrappedHandler = withRateLimit(config, handler)

      const request = createMockRequest({
        headers: { 'x-forwarded-for': '192.168.1.1' },
      })

      const response = await wrappedHandler(request)
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json.success).toBe(true)
      expect(response.headers.get('X-RateLimit-Limit')).toBe('10')
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('9')
    })

    it('returns 429 when rate limit exceeded', async () => {
      const handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }))
      const config = { windowMs: 60000, maxRequests: 2 }
      const wrappedHandler = withRateLimit(config, handler)

      // Use unique IP to avoid conflicts with other tests
      const request = createMockRequest({
        url: 'http://localhost:3000/api/rate-test',
        headers: { 'x-forwarded-for': '10.0.0.99' },
      })

      // Make requests up to limit
      await wrappedHandler(request)
      await wrappedHandler(request)

      // Third request should be rate limited
      const response = await wrappedHandler(request)
      const json = await response.json()

      expect(response.status).toBe(429)
      expect(json.error).toContain('Too many requests')
      expect(response.headers.get('Retry-After')).toBeTruthy()
    })

    it('resets counter after window expires', async () => {
      vi.useFakeTimers()

      const handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }))
      const config = { windowMs: 1000, maxRequests: 1 } // 1 second window
      const wrappedHandler = withRateLimit(config, handler)

      const request = createMockRequest({
        url: 'http://localhost:3000/api/reset-test',
        headers: { 'x-forwarded-for': '10.0.0.100' },
      })

      // First request succeeds
      const response1 = await wrappedHandler(request)
      expect(response1.status).toBe(200)

      // Second request is rate limited
      const response2 = await wrappedHandler(request)
      expect(response2.status).toBe(429)

      // Advance time past window
      vi.advanceTimersByTime(2000)

      // Third request succeeds (new window)
      const response3 = await wrappedHandler(request)
      expect(response3.status).toBe(200)

      vi.useRealTimers()
    })
  })

  describe('withErrorHandling', () => {
    it('passes through successful responses', async () => {
      const handler = vi.fn().mockResolvedValue(NextResponse.json({ data: 'test' }))
      const wrappedHandler = withErrorHandling(handler)
      const request = createMockRequest()

      const response = await wrappedHandler(request)
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json.data).toBe('test')
    })

    it('catches and handles errors', async () => {
      const handler = vi.fn().mockRejectedValue(new Error('Test error'))
      const wrappedHandler = withErrorHandling(handler)
      const request = createMockRequest()

      const response = await wrappedHandler(request)
      const json = await response.json()

      expect(response.status).toBe(500)
      expect(json.error).toBeTruthy()
    })

    it('exposes error message in development', async () => {
      // Use vi.stubEnv instead of directly assigning
      vi.stubEnv('NODE_ENV', 'development')

      const handler = vi.fn().mockRejectedValue(new Error('Detailed error message'))
      const wrappedHandler = withErrorHandling(handler)
      const request = createMockRequest()

      const response = await wrappedHandler(request)
      const json = await response.json()

      expect(json.error).toBe('Detailed error message')

      vi.unstubAllEnvs()
    })

    it('hides error message in production', async () => {
      vi.stubEnv('NODE_ENV', 'production')

      const handler = vi.fn().mockRejectedValue(new Error('Secret error'))
      const wrappedHandler = withErrorHandling(handler)
      const request = createMockRequest()

      const response = await wrappedHandler(request)
      const json = await response.json()

      expect(json.error).toBe('Internal server error')
      expect(json.error).not.toContain('Secret')

      vi.unstubAllEnvs()
    })
  })

  describe('compose', () => {
    it('composes multiple middleware in correct order', async () => {
      const callOrder: string[] = []

      const middleware1 = (handler: RouteHandler) => {
        return async (request: NextRequest) => {
          callOrder.push('middleware1-before')
          const response = await handler(request)
          callOrder.push('middleware1-after')
          return response
        }
      }

      const middleware2 = (handler: RouteHandler) => {
        return async (request: NextRequest) => {
          callOrder.push('middleware2-before')
          const response = await handler(request)
          callOrder.push('middleware2-after')
          return response
        }
      }

      const handler: RouteHandler = async () => {
        callOrder.push('handler')
        return NextResponse.json({ success: true })
      }

      const composed = compose(middleware1, middleware2)(handler)
      const request = createMockRequest()

      await composed(request)

      // Middleware should execute in order: m1 -> m2 -> handler -> m2 -> m1
      expect(callOrder).toEqual([
        'middleware1-before',
        'middleware2-before',
        'handler',
        'middleware2-after',
        'middleware1-after',
      ])
    })
  })
})
