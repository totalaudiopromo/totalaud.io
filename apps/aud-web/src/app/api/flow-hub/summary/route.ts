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
import { logger } from '@/lib/logger'
import { createRouteSupabaseClient } from '@aud-web/lib/supabase/server'

const log = logger.scope('FlowHubSummaryAPI')

const ALLOWED_PERIODS = new Set([7, 30, 90])

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const periodParam = parseInt(searchParams.get('period') || '7', 10)
    const period = ALLOWED_PERIODS.has(periodParam) ? periodParam : 7

    const supabase = await createRouteSupabaseClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      log.error('Failed to verify session', sessionError)
      return NextResponse.json({ error: 'Failed to verify authentication' }, { status: 500 })
    }

    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const userId = session.user.id
    const now = new Date()
    const periodStart = new Date(now)
    periodStart.setDate(periodStart.getDate() - period)

    // Note: flow_hub_summary_cache table is planned but not yet created in database
     
    const { data: cachedSummary, error: cacheError } = await (supabase as any)
      .from('flow_hub_summary_cache')
      .select('metrics, generated_at, expires_at')
      .eq('user_id', userId)
      .maybeSingle()

    if (cacheError) {
      log.error('Failed to load cached Flow Hub summary', cacheError)
    }

    let summary = cachedSummary
    let isCacheHit = false

    if (summary?.expires_at) {
      isCacheHit = new Date(summary.expires_at).getTime() > now.getTime()
    }

    if (!summary || !isCacheHit) {
       
      const { error: refreshError } = await (supabase as any).rpc('refresh_flow_hub_summary', {
        uid: userId,
      })

      if (refreshError) {
        log.error('Failed to refresh Flow Hub summary', refreshError)
        return NextResponse.json({ error: 'Failed to refresh analytics summary' }, { status: 500 })
      }

       
      const refreshed = await (supabase as any)
        .from('flow_hub_summary_cache')
        .select('metrics, generated_at, expires_at')
        .eq('user_id', userId)
        .maybeSingle()

      if (refreshed.error) {
        log.error('Failed to load refreshed Flow Hub summary', refreshed.error)
        return NextResponse.json({ error: 'Failed to load analytics summary' }, { status: 500 })
      }

      summary = refreshed.data ?? null
      isCacheHit = false
    }

    if (!summary) {
      log.error('Flow Hub summary unavailable after refresh', { userId })
      return NextResponse.json({ error: 'Analytics summary unavailable' }, { status: 404 })
    }

    const metrics = (summary.metrics as Record<string, unknown>) || {}
    const totals = (metrics.totals as Record<string, number>) || {}
    const topEpks = (metrics.top_epks as Array<Record<string, unknown>>) || []
    const topAgents = (metrics.top_agents as Array<Record<string, unknown>>) || []

    const briefNode = metrics.ai_brief as
      | { data?: Record<string, unknown>; generated_at?: string }
      | undefined

    const response = {
      period_days: period,
      period_start: periodStart.toISOString(),
      period_end: now.toISOString(),
      total_campaigns: Number(totals.campaigns ?? 0),
      total_epks: Number(totals.epks ?? 0),
      total_views: Number(totals.epk_views ?? 0),
      total_downloads: Number(totals.epk_downloads ?? 0),
      total_shares: Number(totals.epk_shares ?? 0),
      total_agent_runs: Number(totals.agent_runs ?? 0),
      total_saves: Number(totals.manual_saves ?? 0),
      avg_ctr: 0,
      avg_engagement_score: 0,
      top_epks: topEpks.map((epk) => ({
        epk_id: String(epk.epk_id ?? ''),
        views: Number(epk.views ?? 0),
        downloads: Number(epk.downloads ?? 0),
        shares: Number(epk.shares ?? 0),
      })),
      top_agents: topAgents.map((agent) => ({
        agent_type: String(agent.agent_type ?? ''),
        runs: Number(agent.runs ?? 0),
      })),
      generated_at: summary.generated_at ?? null,
      expires_at: summary.expires_at ?? null,
      cached: isCacheHit,
      ai_brief: briefNode?.data ?? null,
      ai_brief_generated_at: briefNode?.generated_at ?? null,
    }

    log.info('Flow Hub summary served', {
      userId,
      period,
      cached: isCacheHit,
    })

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    log.error('Unexpected error in Flow Hub summary API', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
