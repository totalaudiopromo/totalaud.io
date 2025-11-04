/**
 * EPK Track API
 * Phase 15.5: EPK Analytics Tracking
 *
 * POST /api/epk/track
 * Logs asset views, downloads, and shares with telemetry
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseClient'
import { logger } from '@/lib/logger'

const log = logger.scope('EPKTrackAPI')

interface TrackEventRequest {
  epkId: string
  assetId?: string
  eventType: 'view' | 'download' | 'share'
  region?: string
  device?: string
  metadata?: Record<string, unknown>
}

export async function POST(req: NextRequest) {
  try {
    const body: TrackEventRequest = await req.json()

    // Validate request
    if (!body.epkId || !body.eventType) {
      return NextResponse.json(
        { error: 'epkId and eventType are required' },
        { status: 400 },
      )
    }

    if (!['view', 'download', 'share'].includes(body.eventType)) {
      return NextResponse.json(
        { error: 'eventType must be view, download, or share' },
        { status: 400 },
      )
    }

    const supabase = createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      log.warn('Unauthenticated request to EPK track')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Detect region and device from headers if not provided
    const region = body.region || req.headers.get('cf-ipcountry') || 'unknown'
    const userAgent = req.headers.get('user-agent') || ''
    const device =
      body.device ||
      (userAgent.includes('Mobile') ? 'mobile' : userAgent.includes('Tablet') ? 'tablet' : 'desktop')

    // Insert analytics event
    const { data: analyticsEvent, error: insertError } = await supabase
      .from('epk_analytics')
      .insert({
        epk_id: body.epkId,
        asset_id: body.assetId || null,
        user_id: user.id,
        event_type: body.eventType,
        views: body.eventType === 'view' ? 1 : 0,
        downloads: body.eventType === 'download' ? 1 : 0,
        region,
        device,
        metadata: body.metadata || {},
      })
      .select()
      .single()

    if (insertError) {
      log.error('Failed to insert EPK analytics event', insertError)
      return NextResponse.json({ error: 'Failed to track event' }, { status: 500 })
    }

    // Also log to flow_telemetry for general analytics
    const { error: telemetryError } = await supabase.from('flow_telemetry').insert({
      user_id: user.id,
      event_type: `epk_${body.eventType}`,
      event_data: {
        epk_id: body.epkId,
        asset_id: body.assetId,
        region,
        device,
      },
    })

    if (telemetryError) {
      log.warn('Failed to log telemetry event', telemetryError)
      // Don't fail the request if telemetry fails
    }

    log.info('EPK event tracked', {
      epkId: body.epkId,
      eventType: body.eventType,
      region,
      device,
    })

    return NextResponse.json(
      {
        success: true,
        event: analyticsEvent,
      },
      { status: 200 },
    )
  } catch (error) {
    log.error('Unexpected error in EPK track API', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
