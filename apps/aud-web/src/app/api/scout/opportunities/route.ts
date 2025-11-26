import { NextRequest, NextResponse } from 'next/server'
import { createRouteSupabaseClient } from '@/lib/supabase/server'

interface OpportunityCreateRequest {
  opportunities: Array<{
    contactId?: string
    searchTrackTitle: string
    searchGenres: string[]
    searchGoals: string[]
    searchVibe?: string
    type: 'playlist' | 'blog' | 'radio' | 'youtube' | 'podcast'
    name: string
    contactName?: string
    contactEmail?: string
    contactSubmissionUrl?: string
    relevanceScore: number
    genres: string[]
    pitchTips?: string[]
    source: 'database' | 'scraped' | 'api'
  }>
}

/**
 * GET /api/scout/opportunities
 * List user's saved opportunities
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteSupabaseClient()

    // Check auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    // Get query params for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Build query
    let query = supabase
      .from('opportunities')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    if (type) {
      query = query.eq('type', type)
    }

    const { data: opportunities, error, count } = await query

    if (error) {
      console.error('Failed to fetch opportunities:', error)
      return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      opportunities: opportunities || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error('Opportunities list error:', error)
    return NextResponse.json({ error: 'Failed to list opportunities' }, { status: 500 })
  }
}

/**
 * POST /api/scout/opportunities
 * Save opportunities from discovery results
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteSupabaseClient()

    // Check auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const body: OpportunityCreateRequest = await request.json()

    if (!body.opportunities || body.opportunities.length === 0) {
      return NextResponse.json({ error: 'No opportunities provided' }, { status: 400 })
    }

    // Transform to database format
    const opportunitiesToInsert = body.opportunities.map((opp) => ({
      user_id: user.id,
      contact_id: opp.contactId || null,
      search_track_title: opp.searchTrackTitle,
      search_genres: opp.searchGenres,
      search_goals: opp.searchGoals,
      search_vibe: opp.searchVibe || null,
      type: opp.type,
      name: opp.name,
      contact_name: opp.contactName || null,
      contact_email: opp.contactEmail || null,
      contact_submission_url: opp.contactSubmissionUrl || null,
      relevance_score: opp.relevanceScore,
      genres: opp.genres,
      pitch_tips: opp.pitchTips || [],
      source: opp.source,
      status: 'saved',
    }))

    const { data: inserted, error } = await supabase
      .from('opportunities')
      .insert(opportunitiesToInsert)
      .select()

    if (error) {
      console.error('Failed to save opportunities:', error)
      return NextResponse.json({ error: 'Failed to save opportunities' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      saved: inserted?.length || 0,
      opportunities: inserted || [],
    })
  } catch (error) {
    console.error('Opportunities save error:', error)
    return NextResponse.json({ error: 'Failed to save opportunities' }, { status: 500 })
  }
}
