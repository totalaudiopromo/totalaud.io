/**
 * Latest Operator Context API Route
 * Phase 14.4: Get most recent campaign context for current user
 *
 * GET /api/operator/context/latest
 * Returns latest context: { artist, genre, goal, horizon, followers, imageUrl }
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@total-audio/core-logger'

const log = logger.scope('API:LatestContext')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      log.debug('No authenticated user for latest context lookup')
      return NextResponse.json({
        artist: null,
        genre: null,
        goal: null,
        horizon: null,
        followers: null,
        imageUrl: null,
      })
    }

    // Get most recent campaign context
    const { data, error } = await supabase
      .from('campaign_context')
      .select('artist, genre, goal, horizon_days, followers')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      log.error('Failed to fetch latest context', error)
      return NextResponse.json({
        artist: null,
        genre: null,
        goal: null,
        horizon: null,
        followers: null,
        imageUrl: null,
      })
    }

    if (!data) {
      log.debug('No campaign context found', { userId: user.id })
      return NextResponse.json({
        artist: null,
        genre: null,
        goal: null,
        horizon: null,
        followers: null,
        imageUrl: null,
      })
    }

    // Return DTO
    return NextResponse.json({
      artist: data.artist,
      genre: data.genre,
      goal: data.goal,
      horizon: data.horizon_days,
      followers: data.followers,
      imageUrl: null, // TODO: Fetch from Spotify if needed
    })
  } catch (error) {
    log.error('Latest context API error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
