/**
 * Telemetry API
 * Phase 90+: Infrastructure Depth
 *
 * POST /api/telemetry
 * Records user interaction events for product analytics.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const log = logger.scope('TelemetryAPI')

const telemetrySchema = z.object({
  eventName: z.string().min(1),
  eventData: z.record(z.any()).default({}),
  sessionId: z.string().optional(),
  path: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = telemetrySchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid telemetry data' }, { status: 400 })
    }

    const { eventName, eventData, sessionId, path } = result.data
    const supabase = await createRouteSupabaseClient()

    // Get user if authenticated (telemetry can be anonymous)
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const userAgent = req.headers.get('user-agent') || 'unknown'
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'

    // Note: flow_telemetry table is required in Supabase
    // Using .insert() - if table doesn't exist, this will log an error but we gracefully handle it
    const { error } = await supabase.from('flow_telemetry').insert({
      user_id: session?.user.id || null,
      event_type: eventName,
      event_data: eventData,
      session_id: sessionId || null,
      url: path || req.nextUrl.pathname,
      user_agent: userAgent,
      ip_address: ip,
    })

    if (error) {
      // Don't fail the request if telemetry fails, just log it
      log.debug('Telemetry insert skipped (table may be missing)', { error: error.message })
    }

    log.debug('Event tracked', { eventName, userId: session?.user.id })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    log.error('Telemetry unexpected error', error)
    // Always return 200/success for telemetry to avoid breaking client-side flows
    return NextResponse.json({ success: true }, { status: 200 })
  }
}
