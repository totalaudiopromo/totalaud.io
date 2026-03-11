/**
 * TAP Tracker Sync API
 * Phase 90+: Feature Depth
 *
 * Syncs an opportunity from Scout mode to TAP Tracker as a new campaign.
 *
 * POST /api/tap/tracker/sync
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { createRouteSupabaseClient } from '@aud-web/lib/supabase/server'
import { tapClient, TotalAudioApiError } from '@/lib/tap-client'

const log = logger.scope('TAPTrackerSync')

const syncSchema = z.object({
  opportunityId: z.string().min(1),
  campaignName: z.string().min(1),
  platform: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createRouteSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await req.json()
    const result = syncSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid sync data' }, { status: 400 })
    }

    const { opportunityId, campaignName, platform } = result.data

    // Fetch opportunity details from local DB
    const { data: opportunity, error: fetchError } = await supabase
      .from('opportunities')
      .select('id, name, type, url, description, genres, audience_size, created_at, updated_at')
      .eq('id', opportunityId)
      .single()

    if (fetchError || !opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }

    // Call TAP Tracker API
    if (!tapClient.isConfigured('tracker')) {
      return NextResponse.json({ error: 'TAP Tracker is not configured' }, { status: 503 })
    }

    const campaign = await tapClient.tracker.createCampaign(
      {
        name: campaignName,
        artist_name: session.user.user_metadata?.display_name || 'Unknown Artist',
        status: 'planning',
        platform: platform || opportunity.type,
        genre: opportunity.genres?.[0],
        notes: `Synced from Scout: ${opportunity.description}`,
      },
      session.user.id
    )

    log.info('Opportunity synced to TAP Tracker', {
      opportunityId,
      campaignId: campaign.id,
      userId: session.user.id,
    })

    return NextResponse.json({ success: true, campaign }, { status: 201 })
  } catch (error) {
    if (error instanceof TotalAudioApiError) {
      log.error('TAP Tracker API error', undefined, { code: error.code, status: error.status })
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    log.error('Unexpected sync error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
