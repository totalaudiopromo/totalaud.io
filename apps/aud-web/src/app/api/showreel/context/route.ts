/**
 * Showreel Context API
 * Phase 17: Fetch and compose campaign data for showreel generation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@total-audio/core-supabase'
import type { ThemeId } from '@totalaud/os-state/campaign'
import type {
  ShowreelContext,
  IdentitySnapshot,
  IntelligenceNarrative,
  EvolutionSeries,
  SocialSummary,
} from '@totalaud/showreel'
import { generateIntelligenceNarrative } from '@totalaud/agents/intelligence'

/**
 * GET /api/showreel/context
 * Query params: campaignId
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const campaignId = searchParams.get('campaignId')

    if (!campaignId) {
      return NextResponse.json({ error: 'campaignId is required' }, { status: 400 })
    }

    // Create Supabase client
    const supabase = createServerClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch identity snapshots
    const snapshots = await fetchIdentitySnapshots(supabase, user.id, campaignId)

    // Fetch evolution series
    const evolutionSeries = await fetchEvolutionSeries(supabase, user.id, campaignId)

    // Fetch relationship summary
    const relationshipSummary = await fetchRelationshipSummary(supabase, user.id, campaignId)

    // Fetch current relationships for narrative generation
    const currentRelationships = await fetchCurrentRelationships(
      supabase,
      user.id,
      campaignId
    )

    // Generate intelligence narrative
    const narrative = generateIntelligenceNarrative({
      snapshots,
      relationshipSeries: [], // V1: skip time series for now
      evolutionSeries,
      currentRelationships,
    })

    // Build context
    const context: ShowreelContext = {
      campaignId,
      snapshots,
      narrative,
      evolutionSeries,
      relationshipSummary,
    }

    return NextResponse.json(context)
  } catch (error) {
    console.error('Failed to fetch showreel context:', error)
    return NextResponse.json(
      { error: 'Failed to fetch showreel context' },
      { status: 500 }
    )
  }
}

/**
 * Fetch identity snapshots from database
 */
async function fetchIdentitySnapshots(
  supabase: any,
  userId: string,
  campaignId: string
): Promise<IdentitySnapshot[]> {
  const { data, error } = await supabase
    .from('os_identity_snapshots')
    .select('*')
    .eq('user_id', userId)
    .eq('campaign_id', campaignId)
    .order('taken_at', { ascending: true })
    .limit(50)

  if (error) {
    console.error('Failed to fetch identity snapshots:', error)
    return []
  }

  if (!data || data.length === 0) {
    return []
  }

  return data.map((snap: any) => ({
    takenAt: snap.taken_at,
    leaderOS: snap.leader_os as ThemeId,
    cohesion: snap.cohesion,
    osMetrics: snap.os_metrics,
  }))
}

/**
 * Fetch evolution series from database
 */
async function fetchEvolutionSeries(
  supabase: any,
  userId: string,
  campaignId: string
): Promise<EvolutionSeries[]> {
  // Fetch evolution events
  const { data: events, error: eventsError } = await supabase
    .from('os_evolution_events')
    .select('*')
    .eq('user_id', userId)
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: true })

  if (eventsError) {
    console.error('Failed to fetch evolution events:', eventsError)
    return []
  }

  // Fetch current profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('os_evolution_profiles')
    .select('*')
    .eq('user_id', userId)
    .eq('campaign_id', campaignId)

  if (profilesError) {
    console.error('Failed to fetch evolution profiles:', profilesError)
    return []
  }

  // Group events by OS
  const eventsByOS: Record<ThemeId, any[]> = {
    ascii: [],
    xp: [],
    aqua: [],
    daw: [],
    analogue: [],
  }

  events?.forEach((event: any) => {
    const os = event.os_type as ThemeId
    if (eventsByOS[os]) {
      eventsByOS[os].push(event)
    }
  })

  // Build series for each OS
  const allOS: ThemeId[] = ['ascii', 'xp', 'aqua', 'daw', 'analogue']
  return allOS.map((os) => {
    const osEvents = eventsByOS[os] || []
    const profile = profiles?.find((p: any) => p.os_type === os)

    // Build series from events
    const confidence = osEvents.map((e: any) => ({
      timestamp: e.created_at,
      value: e.new_confidence ?? 0.5,
    }))

    const riskTolerance = osEvents.map((e: any) => ({
      timestamp: e.created_at,
      value: e.new_risk_tolerance ?? 0.5,
    }))

    const empathy = osEvents.map((e: any) => ({
      timestamp: e.created_at,
      value: e.new_empathy ?? 0.5,
    }))

    const verbosity = osEvents.map((e: any) => ({
      timestamp: e.created_at,
      value: e.new_verbosity ?? 0.5,
    }))

    const tempo = osEvents.map((e: any) => ({
      timestamp: e.created_at,
      value: e.new_tempo ?? 0.5,
    }))

    // Add current profile as final point if exists
    if (profile) {
      const now = new Date().toISOString()
      confidence.push({ timestamp: now, value: profile.confidence })
      riskTolerance.push({ timestamp: now, value: profile.risk_tolerance })
      empathy.push({ timestamp: now, value: profile.empathy })
      verbosity.push({ timestamp: now, value: profile.verbosity })
      tempo.push({ timestamp: now, value: profile.tempo })
    }

    return {
      os,
      confidence,
      riskTolerance,
      empathy,
      verbosity,
      tempo,
    }
  })
}

/**
 * Fetch relationship summary from database
 */
async function fetchRelationshipSummary(
  supabase: any,
  userId: string,
  campaignId: string
): Promise<SocialSummary> {
  // Fetch current relationships
  const { data: relationships, error } = await supabase
    .from('os_relationships')
    .select('*')
    .eq('user_id', userId)
    .eq('campaign_id', campaignId)

  if (error || !relationships || relationships.length === 0) {
    // Return default summary
    return {
      leader: 'ascii',
      support: ['xp', 'aqua'],
      alliances: [],
      conflicts: [],
    }
  }

  // Determine leader (highest average trust + synergy)
  const osScores: Record<ThemeId, number> = {
    ascii: 0,
    xp: 0,
    aqua: 0,
    daw: 0,
    analogue: 0,
  }

  relationships.forEach((rel: any) => {
    const osA = rel.os_a as ThemeId
    const osB = rel.os_b as ThemeId
    const score = rel.trust + rel.synergy

    osScores[osA] += score
    osScores[osB] += score
  })

  const sortedByScore = Object.entries(osScores).sort(([, a], [, b]) => b - a)
  const leader = sortedByScore[0][0] as ThemeId
  const support = sortedByScore.slice(1, 3).map(([os]) => os as ThemeId)
  const rebel = sortedByScore[sortedByScore.length - 1][0] as ThemeId

  // Build alliances (high trust + synergy)
  const alliances = relationships
    .filter((rel: any) => rel.trust > 0.6 && rel.synergy > 0.6)
    .map((rel: any) => ({
      osA: rel.os_a as ThemeId,
      osB: rel.os_b as ThemeId,
      strength: (rel.trust + rel.synergy) / 2,
    }))
    .sort((a, b) => b.strength - a.strength)

  // Build conflicts (high tension)
  const conflicts = relationships
    .filter((rel: any) => rel.tension > 0.5)
    .map((rel: any) => ({
      osA: rel.os_a as ThemeId,
      osB: rel.os_b as ThemeId,
      tension: rel.tension,
    }))
    .sort((a, b) => b.tension - a.tension)

  return {
    leader,
    support,
    rebel,
    alliances,
    conflicts,
  }
}

/**
 * Fetch current relationships for narrative generation
 */
async function fetchCurrentRelationships(
  supabase: any,
  userId: string,
  campaignId: string
): Promise<any[]> {
  const { data, error } = await supabase
    .from('os_relationships')
    .select('*')
    .eq('user_id', userId)
    .eq('campaign_id', campaignId)

  if (error) {
    console.error('Failed to fetch relationships:', error)
    return []
  }

  return data || []
}
