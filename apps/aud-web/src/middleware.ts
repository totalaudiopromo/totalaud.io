/**
 * Next.js Middleware
 *
 * Handles:
 * - Coming Soon mode (preview access via secret URL)
 * - Rate limiting (in-memory, per IP)
 * - Security headers
 *
 * Rate limits by route pattern:
 * - /api/pitch/*: 10 req/min (AI-heavy)
 * - /api/tap/*: 20 req/min (external API calls)
 * - /api/scout: 30 req/min (database queries)
 * - /api/*: 60 req/min (default)
 */

import { NextRequest, NextResponse } from 'next/server'

// ============================================================================
// Coming Soon / Preview Access Configuration
// ============================================================================

const PREVIEW_KEY = process.env.PREVIEW_ACCESS_KEY || 'totalaud-preview-2025'
const PREVIEW_COOKIE = 'totalaud_preview_access'

// Routes that should redirect to coming soon (unless preview access)
const GATED_ROUTES = ['/workspace', '/login', '/signup', '/onboarding']

/**
 * Check if preview access should be granted or route should be gated
 * Returns: { shouldGate: boolean, setPreviewCookie: boolean }
 */
function checkPreviewAccess(request: NextRequest): {
  shouldGate: boolean
  setPreviewCookie: boolean
} {
  const { pathname, searchParams } = request.nextUrl

  // Check for preview key in URL
  const previewParam = searchParams.get('preview')
  if (previewParam === PREVIEW_KEY) {
    return { shouldGate: false, setPreviewCookie: true }
  }

  // Check for existing preview cookie
  const hasPreviewAccess = request.cookies.get(PREVIEW_COOKIE)?.value === 'true'
  if (hasPreviewAccess) {
    return { shouldGate: false, setPreviewCookie: false }
  }

  // Check if this is a gated route
  const isGatedRoute = GATED_ROUTES.some((route) => pathname.startsWith(route))
  return { shouldGate: isGatedRoute, setPreviewCookie: false }
}

// ============================================================================
// Rate Limiting Configuration
// ============================================================================

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store for rate limiting
// Note: This resets on deploy and doesn't work across multiple instances
// For production at scale, use Redis (e.g., @upstash/ratelimit)
const rateLimits = new Map<string, RateLimitEntry>()

// Clean up expired entries periodically (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanupExpiredEntries() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return

  lastCleanup = now
  for (const [key, entry] of rateLimits.entries()) {
    if (entry.resetTime < now) {
      rateLimits.delete(key)
    }
  }
}

// Rate limit configuration per route pattern
const RATE_LIMITS: { pattern: RegExp; limit: number; windowMs: number }[] = [
  { pattern: /^\/api\/pitch\//, limit: 10, windowMs: 60 * 1000 }, // 10/min for AI routes
  { pattern: /^\/api\/tap\//, limit: 20, windowMs: 60 * 1000 }, // 20/min for TAP routes
  { pattern: /^\/api\/scout/, limit: 30, windowMs: 60 * 1000 }, // 30/min for Scout
  { pattern: /^\/api\//, limit: 60, windowMs: 60 * 1000 }, // 60/min default
]

function getRateLimitConfig(pathname: string) {
  for (const config of RATE_LIMITS) {
    if (config.pattern.test(pathname)) {
      return config
    }
  }
  return null // No rate limiting for non-API routes
}

function checkRateLimit(
  ip: string,
  pathname: string
): { allowed: boolean; remaining: number; reset: number } {
  const config = getRateLimitConfig(pathname)
  if (!config) {
    return { allowed: true, remaining: -1, reset: 0 }
  }

  const now = Date.now()
  const key = `${ip}:${pathname.split('/').slice(0, 3).join('/')}` // Group by route prefix
  const current = rateLimits.get(key)

  // Clean up periodically
  cleanupExpiredEntries()

  if (!current || current.resetTime < now) {
    // First request or window expired
    rateLimits.set(key, { count: 1, resetTime: now + config.windowMs })
    return { allowed: true, remaining: config.limit - 1, reset: now + config.windowMs }
  }

  if (current.count >= config.limit) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, reset: current.resetTime }
  }

  // Increment count
  current.count++
  return { allowed: true, remaining: config.limit - current.count, reset: current.resetTime }
}

// ============================================================================
// Security Headers
// ============================================================================

const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

// ============================================================================
// Middleware
// ============================================================================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Skip files with extensions (images, etc.)
  ) {
    return NextResponse.next()
  }

  // ========================================
  // Coming Soon / Preview Access Check
  // ========================================
  const { shouldGate, setPreviewCookie } = checkPreviewAccess(request)

  // If preview key provided, set cookie and redirect to clean URL
  if (setPreviewCookie) {
    const cleanUrl = new URL(pathname, request.url)
    const response = NextResponse.redirect(cleanUrl)
    response.cookies.set(PREVIEW_COOKIE, 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
    return response
  }

  // If route is gated and no preview access, redirect to home
  if (shouldGate) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Get client IP (Railway/Cloudflare headers, fallback to x-forwarded-for)
  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'

  // Check rate limit for API routes
  if (pathname.startsWith('/api/')) {
    const { allowed, remaining, reset } = checkRateLimit(ip, pathname)

    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests. Please try again later.',
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(reset),
            ...securityHeaders,
          },
        }
      )
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next()

    // Add security headers
    for (const [key, value] of Object.entries(securityHeaders)) {
      response.headers.set(key, value)
    }

    // Add rate limit info headers
    if (remaining >= 0) {
      response.headers.set('X-RateLimit-Remaining', String(remaining))
      response.headers.set('X-RateLimit-Reset', String(reset))
    }

    return response
  }

  // For non-API routes, just add security headers
  const response = NextResponse.next()
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value)
  }

  return response
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
