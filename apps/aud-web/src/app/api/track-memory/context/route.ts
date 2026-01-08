/**
 * Track Memory Context API
 *
 * GET /api/track-memory/context?track=<uuid>
 *
 * Returns the track memory context for a given track.
 * Used by the useTrackContext hook for read-side integration.
 *
 * Silent failure: returns success: false on all errors (no 500s)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteSupabaseClient } from '@/lib/supabase/server'
import { getTrackMemory } from '@/lib/track-memory'
import { logger } from '@/lib/logger'

const log = logger.scope('TrackMemory/Context')

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const trackId = searchParams.get('track')

    if (!trackId) {
      return NextResponse.json({ success: false, error: 'Missing track parameter' })
    }

    // Get authenticated user
    const supabase = await createRouteSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      // Not authenticated - return empty context (not an error)
      return NextResponse.json({
        success: true,
        data: {
          canonicalIntent: null,
          canonicalIntentUpdatedAt: null,
          entries: [],
        },
      })
    }

    // Fetch track memory with entries
    const memory = await getTrackMemory(user.id, trackId, {
      includeEntries: true,
      // Get all types for the context
      entryTypes: ['intent', 'perspective', 'story_fragment', 'sequence_decision'],
    })

    if (!memory) {
      // No memory for this track - return empty (not an error)
      return NextResponse.json({
        success: true,
        data: {
          canonicalIntent: null,
          canonicalIntentUpdatedAt: null,
          entries: [],
        },
      })
    }

    log.debug('Context retrieved', {
      trackId,
      hasIntent: !!memory.canonicalIntent,
      entryCount: memory.entries?.length || 0,
    })

    return NextResponse.json({
      success: true,
      data: {
        canonicalIntent: memory.canonicalIntent,
        canonicalIntentUpdatedAt: memory.canonicalIntentUpdatedAt,
        entries:
          memory.entries?.map((e) => ({
            id: e.id,
            entryType: e.entryType,
            payload: e.payload,
            createdAt: e.createdAt,
          })) || [],
      },
    })
  } catch (error) {
    // Silent failure
    log.error('Context retrieval error', error)
    return NextResponse.json({
      success: false,
      error: 'Internal error',
    })
  }
}
