/**
 * Telemetry Batch Submission API
 * Phase 15: Flow State Intelligence
 *
 * POST /api/telemetry/batch
 * Request: { campaignId?: string, events: TelemetryEvent[] }
 * Response: { success: boolean, inserted: number, duration: number }
 *
 * Purpose:
 * - Batch insert telemetry events from useFlowStateTelemetry hook
 * - Supports up to 50 events per request
 * - Auto-adds user_id from authenticated session
 * - Falls back to demo mode for unauthenticated users (no DB write)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@aud-web/lib/supabaseClient'
import { logger } from '@/lib/logger'

export const runtime = 'edge'

const log = logger.scope('TelemetryBatchAPI')

interface TelemetryEvent {
  event_type: 'save' | 'share' | 'agentRun' | 'tabChange' | 'idle' | 'sessionStart' | 'sessionEnd'
  duration_ms?: number
  metadata?: Record<string, any>
  created_at?: string // ISO timestamp
}

interface BatchRequest {
  campaignId?: string
  events: TelemetryEvent[]
}

interface BatchResponse {
  success: boolean
  inserted: number
  duration: number
  message?: string
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = (await request.json()) as BatchRequest
    const { campaignId, events } = body

    // Validation
    if (!events || !Array.isArray(events)) {
      return NextResponse.json({ error: 'Events array is required' }, { status: 400 })
    }

    if (events.length === 0) {
      return NextResponse.json({ error: 'Events array cannot be empty' }, { status: 400 })
    }

    if (events.length > 50) {
      return NextResponse.json({ error: 'Maximum 50 events per batch' }, { status: 400 })
    }

    // Validate event structure
    for (const event of events) {
      if (!event.event_type) {
        return NextResponse.json({ error: 'All events must have event_type' }, { status: 400 })
      }

      const validEventTypes = [
        'save',
        'share',
        'agentRun',
        'tabChange',
        'idle',
        'sessionStart',
        'sessionEnd',
      ]
      if (!validEventTypes.includes(event.event_type)) {
        return NextResponse.json(
          { error: `Invalid event_type: ${event.event_type}` },
          { status: 400 }
        )
      }
    }

    // Get Supabase client
    const supabase = getSupabaseClient()

    // Get authenticated user (optional - allow demo mode)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If no user, return success but don't write to DB (demo mode)
    if (!user) {
      const duration = Date.now() - startTime
      log.debug('Demo mode: telemetry batch accepted but not persisted', {
        eventCount: events.length,
      })

      const response: BatchResponse = {
        success: true,
        inserted: 0,
        duration,
        message: 'Demo mode: events not persisted',
      }

      return NextResponse.json(response)
    }

    // Prepare events for insertion
    const eventsToInsert = events.map((event) => ({
      user_id: user.id,
      campaign_id: campaignId || null,
      event_type: event.event_type,
      duration_ms: event.duration_ms || null,
      metadata: event.metadata || {},
      created_at: event.created_at || new Date().toISOString(),
    }))

    // Batch insert to Supabase
    const { data, error } = await supabase
      .from('flow_telemetry')
      .insert(eventsToInsert)
      .select('id')

    if (error) {
      log.error('Supabase insert failed', error, { eventCount: events.length })
      return NextResponse.json(
        {
          error: 'Database insert failed',
          details: error.message,
        },
        { status: 500 }
      )
    }

    const duration = Date.now() - startTime
    const insertedCount = data?.length || 0

    log.debug('Telemetry batch inserted', { inserted: insertedCount, duration })

    const response: BatchResponse = {
      success: true,
      inserted: insertedCount,
      duration,
    }

    return NextResponse.json(response)
  } catch (error) {
    const duration = Date.now() - startTime
    log.error('Telemetry batch API error', error, { duration })

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
