/**
 * Server-side Dashboard Data Fetcher
 *
 * Aggregates data from Supabase tables for the unified dashboard.
 * Falls back to mock data when tables are empty (for new users).
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

const log = logger.scope('Dashboard')

export interface DashboardSnapshot {
  activeCampaigns: number
  totalContacts: number
  coverageEvents: number
  avgReplyRate: number
}

export interface DashboardAction {
  id: string
  action: string
  priority: 'high' | 'medium' | 'low'
  category: string
}

export interface DashboardPattern {
  id: string
  pattern: string
  confidence: number
  impact: string
}

export interface TrajectoryPoint {
  day: number
  coverageEvents: number
  replyRate: number
}

export interface CoverageData {
  totalEvents: number
  countriesReached: number
  citiesReached: number
  coverageScore: number
}

export interface IdentityData {
  brandVoice: {
    tone: string
    themes: string[]
  }
  sceneIdentity: {
    primaryScene: string
  }
  microgenreMap: {
    primary: string
    secondary: string[]
  }
}

export interface SignalEvent {
  id: string
  date: Date
  type: string
  title: string
  significance: number
}

export interface DashboardData {
  snapshot: DashboardSnapshot
  nextActions: DashboardAction[]
  patterns: DashboardPattern[]
  trajectory: TrajectoryPoint[]
  coverage: CoverageData
  identity: IdentityData
  signals: SignalEvent[]
}

/**
 * Fetch dashboard data from Supabase (server-side)
 * Returns aggregated data from campaigns, contacts, coverage, patterns, and actions tables
 */
export async function fetchDashboardData(): Promise<DashboardData> {
  const supabase = await createServerSupabaseClient()

  try {
    // Run all queries in parallel
    const [campaignsRes, contactsRes, coverageRes, patternsRes, actionsRes, metricsRes, eventsRes] =
      await Promise.all([
        // Active campaigns count
        supabase
          .from('campaigns')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active'),

        // Total contacts count
        supabase.from('campaign_contacts').select('id', { count: 'exact', head: true }),

        // Coverage events with country/city counts
        supabase.from('coverage_events').select('id, country, city, coverage_score'),

        // Patterns (limit to recent)
        supabase
          .from('campaign_patterns')
          .select('id, pattern_text, confidence, impact_score')
          .order('detected_at', { ascending: false })
          .limit(5),

        // Actions (pending/in_progress only)
        supabase
          .from('campaign_actions')
          .select('id, action_text, priority, category, status')
          .in('status', ['pending', 'in_progress'])
          .order('priority', { ascending: true })
          .limit(5),

        // Campaign metrics for reply rate
        supabase.from('campaign_metrics').select('open_rate, reply_rate'),

        // Recent campaign events for signals
        supabase
          .from('campaign_events')
          .select('id, type, message, created_at')
          .order('created_at', { ascending: false })
          .limit(10),
      ])

    // Calculate snapshot
    const activeCampaigns = campaignsRes.count ?? 0
    const totalContacts = contactsRes.count ?? 0
    const coverageEvents = coverageRes.data?.length ?? 0

    // Calculate average reply rate from metrics
    const metrics = metricsRes.data ?? []
    const avgReplyRate =
      metrics.length > 0
        ? metrics.reduce((acc, m) => acc + (m.reply_rate ?? 0), 0) / metrics.length
        : 0

    // Calculate coverage data
    const coverageData = coverageRes.data ?? []
    const uniqueCountries = new Set(coverageData.map((c) => c.country).filter(Boolean))
    const uniqueCities = new Set(coverageData.map((c) => c.city).filter(Boolean))
    const avgCoverageScore =
      coverageData.length > 0
        ? coverageData.reduce((acc, c) => acc + (c.coverage_score ?? 0.5), 0) / coverageData.length
        : 0

    // Transform patterns
    const patterns: DashboardPattern[] = (patternsRes.data ?? []).map((p) => ({
      id: p.id,
      pattern: p.pattern_text,
      confidence: p.confidence ?? 0.5,
      impact: p.impact_score ?? 'medium',
    }))

    // Transform actions
    const nextActions: DashboardAction[] = (actionsRes.data ?? []).map((a) => ({
      id: a.id,
      action: a.action_text,
      priority: (a.priority as 'high' | 'medium' | 'low') ?? 'medium',
      category: a.category ?? 'general',
    }))

    // Transform events to signals
    const signals: SignalEvent[] = (eventsRes.data ?? []).map((e) => ({
      id: e.id,
      date: new Date(e.created_at),
      type: e.type,
      title: e.message || e.type,
      significance: 0.5,
    }))

    // Build response
    const data: DashboardData = {
      snapshot: {
        activeCampaigns,
        totalContacts,
        coverageEvents,
        avgReplyRate,
      },
      nextActions: nextActions.length > 0 ? nextActions : getEmptyStateActions(),
      patterns: patterns.length > 0 ? patterns : getEmptyStatePatterns(),
      trajectory: generateTrajectoryData(coverageEvents, avgReplyRate),
      coverage: {
        totalEvents: coverageEvents,
        countriesReached: uniqueCountries.size,
        citiesReached: uniqueCities.size,
        coverageScore: Math.round(avgCoverageScore * 100),
      },
      identity: getDefaultIdentity(),
      signals: signals.length > 0 ? signals : getEmptyStateSignals(),
    }

    return data
  } catch (error) {
    log.error('Error fetching dashboard data', error)
    // Return empty state data on error
    return getEmptyStateDashboard()
  }
}

/**
 * Generate trajectory data based on current metrics
 */
function generateTrajectoryData(
  currentCoverage: number,
  currentReplyRate: number
): TrajectoryPoint[] {
  // Project growth over 90 days
  const baseGrowth = 1.15 // 15% monthly growth
  return [
    {
      day: 0,
      coverageEvents: Math.max(1, Math.round(currentCoverage * 0.6)),
      replyRate: Math.max(0.02, currentReplyRate * 0.6),
    },
    {
      day: 30,
      coverageEvents: Math.max(2, Math.round(currentCoverage * 0.8)),
      replyRate: Math.max(0.05, currentReplyRate * 0.8),
    },
    { day: 60, coverageEvents: currentCoverage, replyRate: currentReplyRate },
    {
      day: 90,
      coverageEvents: Math.round(currentCoverage * baseGrowth),
      replyRate: Math.min(0.3, currentReplyRate * baseGrowth),
    },
  ]
}

/**
 * Empty state helpers - shown when user has no data yet
 */
function getEmptyStateActions(): DashboardAction[] {
  return [
    {
      id: 'welcome-1',
      action: 'start your first campaign to see personalised actions here',
      priority: 'medium',
      category: 'getting-started',
    },
    {
      id: 'welcome-2',
      action: 'add contacts to your database via scout mode',
      priority: 'low',
      category: 'setup',
    },
  ]
}

function getEmptyStatePatterns(): DashboardPattern[] {
  return [
    {
      id: 'empty-1',
      pattern: 'patterns will appear here once you have campaign data',
      confidence: 1.0,
      impact: 'getting started',
    },
  ]
}

function getEmptyStateSignals(): SignalEvent[] {
  return [
    {
      id: 'welcome-signal',
      date: new Date(),
      type: 'welcome',
      title: 'welcome to totalaud.io!',
      significance: 1.0,
    },
  ]
}

function getDefaultIdentity(): IdentityData {
  return {
    brandVoice: {
      tone: 'not yet defined',
      themes: ['complete your identity setup'],
    },
    sceneIdentity: {
      primaryScene: 'not yet defined',
    },
    microgenreMap: {
      primary: 'indie',
      secondary: [],
    },
  }
}

function getEmptyStateDashboard(): DashboardData {
  return {
    snapshot: {
      activeCampaigns: 0,
      totalContacts: 0,
      coverageEvents: 0,
      avgReplyRate: 0,
    },
    nextActions: getEmptyStateActions(),
    patterns: getEmptyStatePatterns(),
    trajectory: [
      { day: 0, coverageEvents: 0, replyRate: 0 },
      { day: 30, coverageEvents: 0, replyRate: 0 },
      { day: 60, coverageEvents: 0, replyRate: 0 },
      { day: 90, coverageEvents: 0, replyRate: 0 },
    ],
    coverage: {
      totalEvents: 0,
      countriesReached: 0,
      citiesReached: 0,
      coverageScore: 0,
    },
    identity: getDefaultIdentity(),
    signals: getEmptyStateSignals(),
  }
}
