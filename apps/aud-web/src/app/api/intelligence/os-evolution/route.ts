/**
 * OS Evolution API
 * Phase 15: CIB 2.0 - Evolution metrics over time
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

type OSType = 'ascii' | 'xp' | 'aqua' | 'daw' | 'analogue'

/**
 * GET /api/intelligence/os-evolution
 * Returns evolution time series for OS personalities
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    // Parse query params
    const { searchParams } = new URL(req.url)
    const campaignId = searchParams.get('campaignId')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const os = searchParams.get('os')

    // Get evolution events to build time series
    let eventsQuery = supabase
      .from('os_evolution_events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (campaignId) {
      eventsQuery = eventsQuery.eq('campaign_id', campaignId)
    }

    if (os) {
      eventsQuery = eventsQuery.eq('os', os)
    }

    if (from) {
      eventsQuery = eventsQuery.gte('created_at', from)
    }

    if (to) {
      eventsQuery = eventsQuery.lte('created_at', to)
    }

    const { data: events, error: eventsError } = await eventsQuery

    if (eventsError) {
      console.error('[OSEvolution] Error fetching events:', eventsError)
      return NextResponse.json({ error: eventsError.message }, { status: 500 })
    }

    // Get current evolution profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('os_evolution_profiles')
      .select('*')
      .eq('user_id', user.id)

    if (profilesError) {
      console.error('[OSEvolution] Error fetching profiles:', profilesError)
      return NextResponse.json({ error: profilesError.message }, { status: 500 })
    }

    // Build time series from events
    const allOSs: OSType[] = ['ascii', 'xp', 'aqua', 'daw', 'analogue']
    const targetOSs = os ? [os as OSType] : allOSs

    const evolutionSeries = targetOSs.map((osId) => {
      const osEvents = (events || []).filter((e) => e.os === osId)
      const currentProfile = (profiles || []).find((p) => p.os === osId)

      // Build series from baseline + events + current
      const series: Array<{
        at: string
        confidence: number
        riskTolerance: number
        empathy: number
        verbosity: number
        tempo?: number
      }> = []

      // Add baseline point (campaign start or first event)
      const firstEvent = osEvents[0]
      if (firstEvent) {
        series.push({
          at: firstEvent.created_at,
          confidence: 0.5,
          riskTolerance: 0.5,
          empathy: 0.5,
          verbosity: 0.5,
          tempo: osId === 'daw' ? 120 : undefined,
        })
      }

      // Add current profile as latest point
      if (currentProfile) {
        series.push({
          at: currentProfile.updated_at,
          confidence: currentProfile.confidence_level,
          riskTolerance: currentProfile.risk_tolerance,
          empathy: currentProfile.empathy_level,
          verbosity: currentProfile.verbosity,
          tempo: currentProfile.tempo,
        })
      }

      return {
        os: osId,
        series,
      }
    })

    return NextResponse.json({ profiles: evolutionSeries })
  } catch (error) {
    console.error('[OSEvolution] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
