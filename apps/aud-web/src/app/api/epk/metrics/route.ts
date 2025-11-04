/**
 * EPK Metrics API
 * Phase 15.5: EPK Analytics
 *
 * GET /api/epk/metrics?epkId={id}&groupBy={region|device}
 * Returns grouped analytics for the specified EPK
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseClient'
import { logger } from '@/lib/logger'

const log = logger.scope('EPKMetricsAPI')

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const epkId = searchParams.get('epkId')
    const groupBy = searchParams.get('groupBy') || 'region'

    if (!epkId) {
      return NextResponse.json({ error: 'epkId is required' }, { status: 400 })
    }

    if (!['region', 'device'].includes(groupBy)) {
      return NextResponse.json({ error: 'groupBy must be region or device' }, { status: 400 })
    }

    const supabase = createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      log.warn('Unauthenticated request to EPK metrics')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch analytics data
    const { data: analytics, error: analyticsError } = await supabase
      .from('epk_analytics')
      .select('*')
      .eq('epk_id', epkId)
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(1000) // Limit to recent 1000 events

    if (analyticsError) {
      log.error('Failed to fetch EPK analytics', analyticsError)
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }

    // Group analytics by specified dimension
    const grouped = analytics?.reduce(
      (acc, event) => {
        const key = groupBy === 'region' ? event.region : event.device
        if (!key) return acc

        if (!acc[key]) {
          acc[key] = {
            name: key,
            views: 0,
            downloads: 0,
            shares: 0,
          }
        }

        if (event.event_type === 'view') acc[key].views += 1
        if (event.event_type === 'download') acc[key].downloads += 1
        if (event.event_type === 'share') acc[key].shares += 1

        return acc
      },
      {} as Record<string, { name: string; views: number; downloads: number; shares: number }>,
    )

    // Convert to array and sort by total activity
    const groupedArray = Object.values(grouped || {}).sort(
      (a, b) => b.views + b.downloads + b.shares - (a.views + a.downloads + a.shares),
    )

    // Calculate totals
    const totals = {
      views: analytics?.filter((e) => e.event_type === 'view').length || 0,
      downloads: analytics?.filter((e) => e.event_type === 'download').length || 0,
      shares: analytics?.filter((e) => e.event_type === 'share').length || 0,
    }

    const response = {
      epkId,
      groupBy,
      totals,
      grouped: groupedArray,
      eventCount: analytics?.length || 0,
    }

    log.info('EPK metrics fetched', {
      epkId,
      groupBy,
      eventCount: response.eventCount,
    })

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    log.error('Unexpected error in EPK metrics API', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
