/**
 * Previous Artist API Route
 * Phase 14.3: Retrieve artist from last campaign
 *
 * GET /api/operator/previous-artist
 * Returns artist name from most recent campaign context
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@total-audio/core-logger'

const log = logger.scope('API:PreviousArtist')

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
      log.debug('No authenticated user for previous artist lookup')
      return NextResponse.json({ artist: null })
    }

    // Get most recent campaign context
    const { data, error } = await supabase
      .from('campaign_context')
      .select('artist')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      log.error('Failed to fetch previous artist', error)
      return NextResponse.json({ artist: null })
    }

    if (!data) {
      log.debug('No previous campaigns found', { userId: user.id })
      return NextResponse.json({ artist: null })
    }

    log.debug('Previous artist retrieved', { artist: data.artist, userId: user.id })
    return NextResponse.json({ artist: data.artist })
  } catch (error) {
    log.error('Previous artist API error', error)
    return NextResponse.json({ artist: null })
  }
}
