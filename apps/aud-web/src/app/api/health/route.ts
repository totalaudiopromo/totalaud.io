import { NextResponse } from 'next/server'

/**
 * Lightweight healthcheck endpoint for Railway
 *
 * PUBLIC ROUTE - No authentication required
 * Keeps response small and dependency-free so it works even
 * when upstream services (Supabase, etc.) are unavailable.
 */
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  )
}
