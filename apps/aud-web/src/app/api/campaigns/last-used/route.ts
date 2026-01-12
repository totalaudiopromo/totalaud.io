/**
 * Campaigns Last-Used API Route
 * Phase 15.4: Production Wiring & Demo Surface
 *
 * Purpose:
 * - Load user's last-used campaign from database
 * - Create new campaign if none exists
 * - RLS-safe queries (only return campaigns owned by authenticated user)
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createRouteSupabaseClient } from '@aud-web/lib/supabase/server'

const log = logger.scope('CampaignsLastUsedAPI')

export async function POST(req: NextRequest) {
  try {
    const supabase = await createRouteSupabaseClient()

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()

    if (authError || !session?.user) {
      log.warn('Unauthenticated request to last-used campaign')
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userId = session.user.id

    // Load last-used campaign (RLS-safe query)
    const { data: campaigns, error: fetchError } = await (supabase as any)
      .from('campaign_context')
      .select('id, artist_name, created_at, last_accessed_at')
      .eq('user_id', userId)
      .order('last_accessed_at', { ascending: false })
      .limit(1)

    if (fetchError) {
      log.error('Failed to fetch last-used campaign', fetchError)
      return NextResponse.json({ error: 'Failed to load campaign' }, { status: 500 })
    }

    // If campaign exists, return it
    if (campaigns && campaigns.length > 0) {
      const campaign = campaigns[0]
      log.info('Last-used campaign found', { campaignId: campaign.id, userId })

      // Update last_accessed_at timestamp
      await (supabase as any)
        .from('campaign_context')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('id', campaign.id)
        .eq('user_id', userId)

      return NextResponse.json({
        campaignId: campaign.id,
        artistName: campaign.artist_name,
      })
    }

    // No campaign exists - create a new one
    log.info('No campaign found, creating new campaign', { userId })

    const newCampaign = {
      user_id: userId,
      artist_name: 'untitled campaign',
      genre: '',
      goals: '',
      created_at: new Date().toISOString(),
      last_accessed_at: new Date().toISOString(),
    }

    const { data: createdCampaign, error: createError } = await (supabase as any)
      .from('campaign_context')
      .insert([newCampaign])
      .select('id, artist_name')
      .single()

    if (createError || !createdCampaign) {
      log.error('Failed to create new campaign', createError)
      return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
    }

    log.info('New campaign created', { campaignId: createdCampaign.id, userId })

    return NextResponse.json({
      campaignId: createdCampaign.id,
      artistName: createdCampaign.artist_name,
      created: true,
    })
  } catch (error) {
    log.error('Campaigns last-used API error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
