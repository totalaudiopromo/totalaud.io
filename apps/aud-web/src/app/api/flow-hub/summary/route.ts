/**
 * Flow Hub Summary API
 * Phase 15.9: Unified Campaign Analytics + AI Briefs
 *
 * GET /api/flow-hub/summary?period={7|30|90}
 * Returns cached analytics summary for the authenticated user
 *
 * Features:
 * - Fetches from flow_hub_summary_cache table
 * - Auto-refreshes if data is stale (> 1 hour old)
 * - Falls back to real-time calculation if cache miss
 * - Sub-300ms response time for cached data
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseClient'
import { logger } from '@/lib/logger'

const log = logger.scope('FlowHubSummaryAPI')

// Cache staleness threshold (1 hour)
const CACHE_STALENESS_MS = 60 * 60 * 1000

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const periodParam = searchParams.get('period')
    const period = parseInt(periodParam || '7', 10)

    // Validate period
    if (![7, 30, 90].includes(period)) {
      log.warn('Invalid period parameter', { period: periodParam })
      return NextResponse.json({ error: 'period must be 7, 30, or 90' }, { status: 400 })
    }

    const supabase = createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      log.debug('Demo mode: returning fixture analytics')
      return NextResponse.json(getDemoSummary(period), { status: 200 })
    }

    log.debug('Fetching flow hub summary', { userId: user.id, period })

    // Try to fetch from cache
    const { data: cachedSummary, error: cacheError } = await supabase
      .from('flow_hub_summary_cache')
      .select('*')
      .eq('user_id', user.id)
      .eq('period_days', period)
      .maybeSingle()

    if (cacheError) {
      log.error('Failed to fetch cached summary', cacheError)
      // Continue to refresh path
    }

    // Check if cache is fresh (< 1 hour old)
    const isCacheFresh =
      cachedSummary &&
      new Date(cachedSummary.updated_at).getTime() > Date.now() - CACHE_STALENESS_MS

    if (isCacheFresh) {
      log.info('Returning fresh cached summary', {
        userId: user.id,
        period,
        cacheAge: Date.now() - new Date(cachedSummary.updated_at).getTime(),
      })

      return NextResponse.json(
        {
          ...formatSummary(cachedSummary),
          cached: true,
          cacheAge: Date.now() - new Date(cachedSummary.updated_at).getTime(),
        },
        { status: 200 }
      )
    }

    // Cache miss or stale - refresh summary
    log.info('Cache miss or stale, refreshing summary', { userId: user.id, period })

    const { data: refreshedSummary, error: refreshError } = await supabase.rpc(
      'refresh_flow_hub_summary',
      {
        p_user_id: user.id,
        p_period_days: period,
      }
    )

    if (refreshError) {
      log.error('Failed to refresh summary', refreshError)
      return NextResponse.json({ error: 'Failed to refresh analytics summary' }, { status: 500 })
    }

    log.info('Summary refreshed successfully', { userId: user.id, period })

    return NextResponse.json(
      {
        ...refreshedSummary,
        cached: false,
      },
      { status: 200 }
    )
  } catch (error) {
    log.error('Unexpected error in flow hub summary API', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Format cached summary for response
 */
function formatSummary(summary: any) {
  return {
    period_days: summary.period_days,
    period_start: summary.period_start,
    period_end: summary.period_end,
    total_campaigns: summary.total_campaigns,
    total_epks: summary.total_epks,
    total_views: summary.total_views,
    total_downloads: summary.total_downloads,
    total_shares: summary.total_shares,
    total_agent_runs: summary.total_agent_runs,
    total_saves: summary.total_saves,
    avg_ctr: parseFloat(summary.avg_ctr || '0'),
    avg_engagement_score: parseFloat(summary.avg_engagement_score || '0'),
    top_epks: summary.top_epks || [],
    top_agents: summary.top_agents || [],
    ai_brief: summary.ai_brief || null,
    ai_brief_generated_at: summary.ai_brief_generated_at || null,
  }
}

/**
 * Get demo fixture summary
 */
function getDemoSummary(period: number) {
  const now = new Date()
  const start = new Date(now.getTime() - period * 24 * 60 * 60 * 1000)

  return {
    period_days: period,
    period_start: start.toISOString(),
    period_end: now.toISOString(),
    total_campaigns: 3,
    total_epks: 5,
    total_views: 247,
    total_downloads: 42,
    total_shares: 18,
    total_agent_runs: 156,
    total_saves: 23,
    avg_ctr: 12.45,
    avg_engagement_score: 7.8,
    top_epks: [
      { epk_id: 'demo-epk-1', campaign_id: 'demo-campaign-1', views: 124 },
      { epk_id: 'demo-epk-2', campaign_id: 'demo-campaign-2', views: 89 },
      { epk_id: 'demo-epk-3', campaign_id: 'demo-campaign-3', views: 34 },
    ],
    top_agents: [
      { agent_id: 'demo-agent-1', name: 'intel scout', runs: 67 },
      { agent_id: 'demo-agent-2', name: 'pitch coach', runs: 52 },
      { agent_id: 'demo-agent-3', name: 'tracker', runs: 37 },
    ],
    ai_brief: null,
    ai_brief_generated_at: null,
    cached: false,
    demo: true,
  }
}
