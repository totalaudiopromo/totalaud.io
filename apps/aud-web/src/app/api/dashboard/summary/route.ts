/**
 * Dashboard Summary API
 * Phase 15.5: Connected Campaign Dashboard
 *
 * GET /api/dashboard/summary?campaignId={id}&period={7|30}
 * Returns aggregate metrics for the specified campaign and time period
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseClient'
import { logger } from '@/lib/logger'

const log = logger.scope('DashboardSummaryAPI')

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const campaignId = searchParams.get('campaignId')
    const period = parseInt(searchParams.get('period') || '7', 10)

    if (!campaignId) {
      return NextResponse.json({ error: 'campaignId is required' }, { status: 400 })
    }

    if (![7, 30].includes(period)) {
      return NextResponse.json({ error: 'period must be 7 or 30' }, { status: 400 })
    }

    const supabase = createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      log.warn('Unauthenticated request to dashboard summary')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calculate period boundaries
    const periodEnd = new Date()
    const periodStart = new Date()
    periodStart.setDate(periodStart.getDate() - period)

    // Fetch metrics for the period
    const { data: metrics, error: metricsError } = await supabase
      .from('campaign_dashboard_metrics')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('user_id', user.id)
      .gte('period_start', periodStart.toISOString())
      .lte('period_end', periodEnd.toISOString())
      .order('created_at', { ascending: false })

    if (metricsError) {
      log.error('Failed to fetch dashboard metrics', metricsError)
      return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
    }

    // Aggregate metrics
    const summary = {
      campaignId,
      period,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      metrics: {
        views: metrics?.reduce((sum, m) => sum + m.views, 0) || 0,
        downloads: metrics?.reduce((sum, m) => sum + m.downloads, 0) || 0,
        shares: metrics?.reduce((sum, m) => sum + m.shares, 0) || 0,
        engagementScore:
          metrics?.reduce((sum, m) => sum + parseFloat(m.engagement_score), 0) /
            (metrics?.length || 1) || 0,
      },
      dataPoints: metrics?.length || 0,
    }

    log.info('Dashboard summary fetched', {
      campaignId,
      period,
      dataPoints: summary.dataPoints,
    })

    return NextResponse.json(summary, { status: 200 })
  } catch (error) {
    log.error('Unexpected error in dashboard summary API', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
