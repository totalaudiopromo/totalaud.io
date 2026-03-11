/**
 * EPK Track API
 * Phase 15.5: EPK Analytics Tracking
 *
 * POST /api/epk/track
 * Logs asset views, downloads, and shares with telemetry
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createRouteSupabaseClient } from '@aud-web/lib/supabase/server'
import { createApiHandler, commonSchemas } from '@/lib/api-validation'

const log = logger.scope('EPKTrackAPI')

export const POST = createApiHandler({
  bodySchema: commonSchemas.epkTrack,
  handler: async ({ body, req }) => {
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

    return {
      success: true,
      event: analyticsEvent,
    }
  },
})
