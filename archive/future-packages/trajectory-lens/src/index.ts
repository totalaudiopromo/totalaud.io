/**
 * Trajectory Lens
 * 90-day forecasting with opportunity windows
 */

import type { FusionContext } from '@total-audio/fusion-layer'

export interface TrajectoryInput {
  artistSlug: string
  forecastDays: number
  context: FusionContext
}

export interface TrajectoryForecast {
  forecast: Record<string, DayForecast>
  opportunityWindows: OpportunityWindow[]
  riskIndicators: RiskIndicator[]
  confidence: number
  projectedMetrics: ProjectedMetrics
}

export interface DayForecast {
  day: number
  coverageEvents: number
  replyRate: number
  momentum: number
}

export interface OpportunityWindow {
  start: string
  end: string
  reason: string
  confidence: number
}

export interface RiskIndicator {
  type: 'warning' | 'critical'
  description: string
  date: string
}

export interface ProjectedMetrics {
  totalCoverage: number
  avgReplyRate: number
  trajectoryScore: number
}

export async function predictTrajectory(input: TrajectoryInput): Promise<TrajectoryForecast> {
  const { forecastDays, context } = input

  // Build forecast based on historical performance
  const baseline = {
    coverageRate: context.coverage.events.length / 90, // events per day
    replyRate: context.email.performanceMetrics.avgReplyRate / 100,
    momentum: context.tracker.activeCampaigns > 0 ? 0.7 : 0.4,
  }

  const forecast: Record<string, DayForecast> = {}
  const opportunityWindows: OpportunityWindow[] = []
  const riskIndicators: RiskIndicator[] = []

  // Generate daily forecasts with growth curve
  for (let day = 0; day <= forecastDays; day += 10) {
    const growthFactor = 1 + (day / forecastDays) * 0.3 // 30% growth over period
    const seasonality = Math.sin((day / 30) * Math.PI) * 0.1 + 1 // Monthly cycles

    forecast[`day_${day}`] = {
      day,
      coverageEvents: Math.round(baseline.coverageRate * 10 * growthFactor * seasonality),
      replyRate: Math.min(baseline.replyRate * growthFactor, 0.3),
      momentum: Math.min(baseline.momentum * growthFactor * seasonality, 1.0),
    }
  }

  // Identify opportunity windows
  if (context.calendar.upcomingDeadlines.length > 0) {
    const firstDeadline = context.calendar.upcomingDeadlines[0]
    const daysUntil = Math.floor(
      (firstDeadline.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )

    if (daysUntil > 0 && daysUntil < forecastDays) {
      opportunityWindows.push({
        start: new Date(Date.now() + (daysUntil - 7) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        end: firstDeadline.date.toISOString().split('T')[0],
        reason: `${firstDeadline.name} submission window`,
        confidence: 0.85,
      })
    }
  }

  // Peak activity window
  opportunityWindows.push({
    start: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reason: 'Projected momentum peak',
    confidence: 0.7,
  })

  // Risk indicators
  if (context.tracker.activeCampaigns === 0) {
    riskIndicators.push({
      type: 'warning',
      description: 'No active campaigns - momentum at risk',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    })
  }

  if (baseline.replyRate < 0.05) {
    riskIndicators.push({
      type: 'critical',
      description: 'Low reply rate trend - strategy adjustment needed',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    })
  }

  // Calculate projected metrics
  const projectedCoverage = Object.values(forecast).reduce(
    (sum, day) => sum + day.coverageEvents,
    0
  )
  const avgReplyRate =
    Object.values(forecast).reduce((sum, day) => sum + day.replyRate, 0) /
    Object.keys(forecast).length
  const trajectoryScore = Math.min(
    ((projectedCoverage / forecastDays) * 50 + avgReplyRate * 100 + baseline.momentum * 50) / 2,
    100
  )

  const confidence = Math.min(
    0.5 + (context.tracker.totalCampaigns / 20) * 0.4, // More campaigns = higher confidence
    0.9
  )

  return {
    forecast,
    opportunityWindows,
    riskIndicators,
    confidence,
    projectedMetrics: {
      totalCoverage: projectedCoverage,
      avgReplyRate,
      trajectoryScore,
    },
  }
}
