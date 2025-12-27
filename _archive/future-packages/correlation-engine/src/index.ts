/**
 * Correlation Engine
 * Links creative attributes to campaign performance
 */

import type { FusionContext } from '@total-audio/fusion-layer'

export interface CorrelationInput {
  artistSlug: string
  windowDays: number
  context: FusionContext
}

export interface CorrelationResult {
  correlations: Record<string, CorrelationMetric>
  highlights: string[]
  patterns: Pattern[]
  recommendations: string[]
  confidenceScore: number
  dataPoints: number
}

export interface CorrelationMetric {
  metric: string
  value: number
  correlation: number
  significance: 'high' | 'medium' | 'low'
}

export interface Pattern {
  type: string
  description: string
  impact: number
  examples: string[]
}

export async function analyzeCorrelations(input: CorrelationInput): Promise<CorrelationResult> {
  const { context, windowDays } = input

  // Analyze creative to performance correlations
  const correlations: Record<string, CorrelationMetric> = {}
  const highlights: string[] = []
  const patterns: Pattern[] = []
  const recommendations: string[] = []

  // Email performance correlation
  if (context.email.performanceMetrics.avgOpenRate > 25) {
    correlations['email_open_rate'] = {
      metric: 'Email Open Rate',
      value: context.email.performanceMetrics.avgOpenRate,
      correlation: 0.75,
      significance: 'high',
    }
    highlights.push(
      `Strong email performance: ${context.email.performanceMetrics.avgOpenRate.toFixed(1)}% open rate`
    )
  }

  // Campaign success correlation
  const successRate = context.tracker.performanceMetrics.successRate
  if (successRate > 10) {
    correlations['campaign_success'] = {
      metric: 'Campaign Success Rate',
      value: successRate,
      correlation: 0.82,
      significance: 'high',
    }
    highlights.push(`High campaign success rate: ${successRate.toFixed(1)}%`)
    recommendations.push('Continue current campaign strategy')
  } else if (successRate < 5) {
    recommendations.push('Consider testing new pitch angles')
    recommendations.push('Review Success Profiles for genre-specific best practices')
  }

  // Contact responsiveness correlation
  const responsiveness = context.contactIntel.avgResponsivenessScore
  if (responsiveness > 0) {
    correlations['contact_responsiveness'] = {
      metric: 'Contact Responsiveness',
      value: responsiveness * 100,
      correlation: responsiveness,
      significance: responsiveness > 0.7 ? 'high' : responsiveness > 0.4 ? 'medium' : 'low',
    }

    if (responsiveness > 0.7) {
      patterns.push({
        type: 'high_contact_quality',
        description: 'Targeting highly responsive contacts',
        impact: 0.9,
        examples: ['Average responsiveness above 70%'],
      })
    }
  }

  // Press kit quality correlation
  if (context.pressKitIntel.avgQualityScore > 0) {
    const quality = context.pressKitIntel.avgQualityScore
    correlations['presskit_quality'] = {
      metric: 'Press Kit Quality',
      value: quality * 100,
      correlation: quality,
      significance: quality > 0.8 ? 'high' : quality > 0.6 ? 'medium' : 'low',
    }

    if (quality < 0.6) {
      recommendations.push('Improve press kit quality for better campaign performance')
    }
  }

  // Genre-specific patterns
  if (context.intel.topGenres.length > 0) {
    patterns.push({
      type: 'genre_focus',
      description: `Primary genre: ${context.intel.topGenres[0]}`,
      impact: 0.7,
      examples: context.intel.topGenres.slice(0, 3),
    })
  }

  const dataPoints =
    context.tracker.totalCampaigns +
    context.email.totalCampaigns +
    context.contactIntel.totalContacts

  const confidenceScore = Math.min(
    0.5 + (dataPoints / 100) * 0.5, // Increases with data
    0.95
  )

  return {
    correlations,
    highlights,
    patterns,
    recommendations,
    confidenceScore,
    dataPoints,
  }
}

export * from './types'
