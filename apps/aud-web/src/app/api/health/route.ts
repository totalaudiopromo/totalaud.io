import { NextResponse } from 'next/server'

/**
 * Lightweight healthcheck endpoint for Railway
 *
 * PUBLIC ROUTE - No authentication required
 * Used by Silver Deployment system for health checks
 *
 * Returns:
 * - status: "ok" if service is responsive
 * - uptime: Process uptime in seconds
 * - version: Package version from package.json
 * - timestamp: Current ISO timestamp
 */
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const startTime = Date.now()

export async function GET() {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000)

  return NextResponse.json(
    {
      status: 'ok',
      uptime: uptimeSeconds,
      version: process.env.npm_package_version || '1.0.0',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  )
}
