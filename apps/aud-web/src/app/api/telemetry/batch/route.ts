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
 * - Rejects unauthenticated requests with 401
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { createRouteSupabaseClient } from '@aud-web/lib/supabase/server'
import { validateRequestBody, validationErrorResponse } from '@/lib/api-validation'

const log = logger.scope('TelemetryBatchAPI')

// Validation schemas
const telemetryEventSchema = z.object({
  event_type: z.enum([
    'save',
    'share',
    'agentRun',
    'tabChange',
    'idle',
    'sessionStart',
    'sessionEnd',
  ]),
  duration_ms: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.string().optional(),
})

const batchRequestSchema = z.object({
  campaignId: z.string().uuid().optional(),
  events: z
    .array(telemetryEventSchema)
    .min(1, 'Events array cannot be empty')
    .max(50, 'Maximum 50 events per batch'),
})

interface TelemetryEvent {
  event_type: 'save' | 'share' | 'agentRun' | 'tabChange' | 'idle' | 'sessionStart' | 'sessionEnd'
  duration_ms?: number
  metadata?: Record<string, unknown>
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
    // Validate request body
    const { campaignId, events } = await validateRequestBody(request, batchRequestSchema)

    const supabase = await createRouteSupabaseClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      log.error('Failed to verify session', sessionError)
      return NextResponse.json({ error: 'Failed to verify authentication' }, { status: 500 })
    }

    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const userId = session.user.id

    // Prepare events for insertion
    const eventsToInsert = events.map((event) => ({
      user_id: userId,
      campaign_id: campaignId || null,
      event_type: event.event_type,
      duration_ms: event.duration_ms || null,
      metadata: event.metadata || {},
      created_at: event.created_at || new Date().toISOString(),
    }))

    // Batch insert to Supabase
    // Note: flow_telemetry table is planned but not yet created in database

    const { data, error } = await (supabase as any)
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

    if (error instanceof z.ZodError) {
      log.warn('Validation error', { errors: error.errors, duration })
      return validationErrorResponse(error)
    }

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
