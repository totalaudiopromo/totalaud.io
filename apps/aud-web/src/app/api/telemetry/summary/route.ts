/**
 * Telemetry Summary API
 * Phase 15: Flow State Intelligence + Signal Analytics
 *
 * GET /api/telemetry/summary?campaignId=uuid&period=7d
 * Response: { summary: TelemetrySummary, sparklines: Sparklines }
 *
 * Purpose:
 * - Aggregate telemetry data for SignalAnalytics component
 * - Generate sparkline data for visual charts (last 7 days by default)
 * - Calculate key metrics: saves, shares, agent runs, time in flow
 * - Requires authenticated session (no demo fallbacks)
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createRouteSupabaseClient } from '@aud-web/lib/supabase/server'

const log = logger.scope('TelemetrySummaryAPI')

interface TelemetrySummary {
  totalSaves: number
  totalShares: number
  totalAgentRuns: number
  totalTimeInFlowMs: number
  avgSaveIntervalMs: number | null
  lastActivityAt: string | null
}

interface SparklineData {
  timestamp: string
  value: number
}

interface Sparklines {
  saves: SparklineData[] // Daily save count
  agentRuns: SparklineData[] // Daily agent run count
  timeInFlow: SparklineData[] // Daily active time in ms
}

interface SummaryResponse {
  success: boolean
  summary: TelemetrySummary
  sparklines: Sparklines
  duration: number
  message?: string
}

/**
 * Parse period parameter (e.g., "7d", "30d", "24h")
 * Returns number of days to query
 */
function parsePeriod(period?: string): number {
  if (!period) return 7 // Default: 7 days

  const match = period.match(/^(\d+)([dh])$/)
  if (!match) return 7

  const value = parseInt(match[1], 10)
  const unit = match[2]

  if (unit === 'd') return value
  if (unit === 'h') return Math.max(1, Math.floor(value / 24))

  return 7
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaignId') || undefined
    const periodParam = searchParams.get('period') || '7d'
    const days = parsePeriod(periodParam)

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

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Build query
    let query = supabase
      .from('flow_telemetry')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true })

    if (campaignId) {
      query = query.eq('campaign_id', campaignId)
    }

    // Fetch telemetry data
    const { data, error } = await query

    if (error) {
      log.error('Supabase query failed', error, { campaignId, days })
      return NextResponse.json(
        {
          error: 'Database query failed',
          details: error.message,
        },
        { status: 500 }
      )
    }

    const events = data || []

    // Calculate summary metrics
    const saveEvents = events.filter((e) => e.event_type === 'save')
    const shareEvents = events.filter((e) => e.event_type === 'share')
    const agentRunEvents = events.filter((e) => e.event_type === 'agentRun')
    const sessionEvents = events.filter(
      (e) => e.event_type === 'sessionStart' || e.event_type === 'sessionEnd'
    )

    const summary: TelemetrySummary = {
      totalSaves: saveEvents.length,
      totalShares: shareEvents.length,
      totalAgentRuns: agentRunEvents.length,
      totalTimeInFlowMs: 0,
      avgSaveIntervalMs: null,
      lastActivityAt: events.length > 0 ? events[events.length - 1].created_at : null,
    }

    // Calculate average save interval
    if (saveEvents.length > 1) {
      const intervals: number[] = []
      for (let i = 1; i < saveEvents.length; i++) {
        const prevTime = new Date(saveEvents[i - 1].created_at).getTime()
        const currTime = new Date(saveEvents[i].created_at).getTime()
        intervals.push(currTime - prevTime)
      }
      summary.avgSaveIntervalMs = Math.floor(
        intervals.reduce((a, b) => a + b, 0) / intervals.length
      )
    }

    // Calculate total time in flow (session durations)
    let totalFlowTime = 0
    for (let i = 0; i < sessionEvents.length; i++) {
      const event = sessionEvents[i]
      if (event.event_type === 'sessionStart') {
        // Find next sessionEnd
        const nextEnd = sessionEvents.slice(i + 1).find((e) => e.event_type === 'sessionEnd')
        if (nextEnd) {
          const startTime = new Date(event.created_at).getTime()
          const endTime = new Date(nextEnd.created_at).getTime()
          totalFlowTime += endTime - startTime
        }
      }
    }
    summary.totalTimeInFlowMs = totalFlowTime

    // Generate sparkline data (daily aggregates)
    const sparklines: Sparklines = {
      saves: [],
      agentRuns: [],
      timeInFlow: [],
    }

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const dayEvents = events.filter((e) => {
        const eventDate = new Date(e.created_at)
        return eventDate >= date && eventDate < nextDate
      })

      const daySaves = dayEvents.filter((e) => e.event_type === 'save').length
      const dayAgentRuns = dayEvents.filter((e) => e.event_type === 'agentRun').length

      // Calculate day's flow time
      let dayFlowTime = 0
      const daySessions = dayEvents.filter(
        (e) => e.event_type === 'sessionStart' || e.event_type === 'sessionEnd'
      )
      for (let j = 0; j < daySessions.length; j++) {
        const session = daySessions[j]
        if (session.event_type === 'sessionStart') {
          const nextEnd = daySessions.slice(j + 1).find((e) => e.event_type === 'sessionEnd')
          if (nextEnd) {
            const startTime = new Date(session.created_at).getTime()
            const endTime = new Date(nextEnd.created_at).getTime()
            dayFlowTime += endTime - startTime
          }
        }
      }

      sparklines.saves.push({ timestamp: date.toISOString(), value: daySaves })
      sparklines.agentRuns.push({ timestamp: date.toISOString(), value: dayAgentRuns })
      sparklines.timeInFlow.push({ timestamp: date.toISOString(), value: dayFlowTime })
    }

    const duration = Date.now() - startTime

    log.debug('Telemetry summary generated', {
      campaignId,
      days,
      eventCount: events.length,
      duration,
    })

    const response: SummaryResponse = {
      success: true,
      summary,
      sparklines,
      duration,
    }

    return NextResponse.json(response)
  } catch (error) {
    const duration = Date.now() - startTime
    log.error('Telemetry summary API error', error, { duration })

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
