/**
 * Public Canvas API
 * Phase 14.7: Read-only share page support
 *
 * GET /api/canvas/public?shareId={public_share_id}
 * Returns scene data for public sharing (no auth required)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@aud-web/lib/supabaseClient'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shareId = searchParams.get('shareId')

    if (!shareId) {
      return NextResponse.json({ error: 'share id required' }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    // Fetch public scene by public_share_id
    const { data: scene, error } = await supabase
      .from('canvas_scenes')
      .select('id, title, scene_state, created_at, campaign_id')
      .eq('public_share_id', shareId)
      .eq('is_public', true)
      .single()

    if (error || !scene) {
      return NextResponse.json({ error: 'scene not found or not public' }, { status: 404 })
    }

    // Optionally fetch campaign context for artist/goal
    let campaignContext = null
    if (scene.campaign_id) {
      const { data: campaign } = await supabase
        .from('campaign_context')
        .select('artist, goal')
        .eq('id', scene.campaign_id)
        .single()

      campaignContext = campaign
    }

    return NextResponse.json({
      scene_state: scene.scene_state,
      title: scene.title,
      artist: campaignContext?.artist,
      goal: campaignContext?.goal,
      created_at: scene.created_at,
    })
  } catch (error) {
    console.error('[Public Canvas API] Error:', error)
    return NextResponse.json({ error: 'failed to fetch scene' }, { status: 500 })
  }
}
