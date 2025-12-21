/**
 * EPK Track API
 * Phase 15.5: EPK Analytics Tracking
 *
 * POST /api/epk/track
 * Logs asset views, downloads, and shares with telemetry
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createRouteSupabaseClient } from '@aud-web/lib/supabase/server'

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
      return NextResponse.json({ error: 'epkId and eventType are required' }, { status: 400 })
    }

    if (!['view', 'download', 'share'].includes(body.eventType)) {
      return NextResponse.json(
        { error: 'eventType must be view, download, or share' },
        { status: 400 }
      )
    }

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
      log.warn('Unauthenticated request to EPK track')
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    // Detect region and device from headers if not provided
    const region = body.region || req.headers.get('cf-ipcountry') || 'unknown'
    const userAgent = req.headers.get('user-agent') || ''
    const device =
      body.device ||
      (userAgent.includes('Mobile')
        ? 'mobile'
        : userAgent.includes('Tablet')
          ? 'tablet'
          : 'desktop')

    // Insert analytics event
    const { data: analyticsEvent, error: insertError } = await supabase
      .from('epk_analytics')
      .insert({
        epk_id: body.epkId,
        asset_id: body.assetId || null,
        user_id: session.user.id,
        event_type: body.eventType,
        views: body.eventType === 'view' ? 1 : 0,
        downloads: body.eventType === 'download' ? 1 : 0,
        region,
        device,
        metadata: (body.metadata || {}) as Record<string, string | number | boolean | null>,
      })
      .select()
      .single()

    if (insertError) {
      log.error('Failed to insert EPK analytics event', insertError)
      return NextResponse.json({ error: 'Failed to track event' }, { status: 500 })
    }

    // Note: flow_telemetry table is planned but not yet created in database
    // Log telemetry information for future implementation
    log.debug('Telemetry event recorded locally', {
      user_id: session.user.id,
      event_type: `epk_${body.eventType}`,
      event_data: {
        epk_id: body.epkId,
        asset_id: body.assetId,
        region,
        device,
      },
    })

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
      { status: 200 }
    )
  } catch (error) {
    log.error('Unexpected error in EPK track API', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
