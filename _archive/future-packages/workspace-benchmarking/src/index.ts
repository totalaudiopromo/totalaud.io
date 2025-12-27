/**
 * Workspace Benchmarking
 * Cross-artist comparison for PR agencies
 */

import type { FusionContext } from '@total-audio/fusion-layer'

export interface BenchmarkInput {
  workspaceId: string
  context: FusionContext
}

export interface BenchmarkSnapshot {
  snapshotDate: Date
  metrics: WorkspaceMetrics
  artistComparisons: ArtistComparison[]
  insights: string[]
  topPerformers: TopPerformer[]
  improvementAreas: ImprovementArea[]
}

export interface WorkspaceMetrics {
  totalArtists: number
  totalCampaigns: number
  avgReplyQuality: number
  avgScenePenetration: number
  avgCreativityIndex: number
  avgCampaignEfficiency: number
  avgMomentum: number
}

export interface ArtistComparison {
  artistSlug: string
  artistName: string
  replyQuality: number
  scenePenetration: number
  creativityIndex: number
  campaignEfficiency: number
  successAlignment: number
  momentum: number
  coverageFootprint: number
  overallScore: number
  rank: number
}

export interface TopPerformer {
  artistSlug: string
  metric: string
  score: number
  reason: string
}

export interface ImprovementArea {
  artistSlug: string
  metrics: string[]
  suggestions: string[]
  priority: 'high' | 'medium' | 'low'
}

export async function generateBenchmark(input: BenchmarkInput): Promise<BenchmarkSnapshot> {
  const { context } = input

  // Calculate workspace-wide metrics
  const metrics = calculateWorkspaceMetrics(context)

  // Compare all artists
  const artistComparisons = compareArtists(context)

  // Generate insights
  const insights = generateInsights(artistComparisons, metrics)

  // Identify top performers
  const topPerformers = identifyTopPerformers(artistComparisons)

  // Identify improvement areas
  const improvementAreas = identifyImprovementAreas(artistComparisons)

  return {
    snapshotDate: new Date(),
    metrics,
    artistComparisons,
    insights,
    topPerformers,
    improvementAreas,
  }
}

function calculateWorkspaceMetrics(context: FusionContext): WorkspaceMetrics {
  const totalCampaigns = context.tracker.totalCampaigns

  // Average metrics across all contacts/campaigns
  const avgReplyQuality = context.contactIntel.avgReplyQualityScore
  const avgScenePenetration = 0.65 // Could be calculated from scene data
  const avgCreativityIndex = 0.7 // Could be calculated from creative assets
  const avgCampaignEfficiency =
    totalCampaigns > 0 ? context.tracker.performanceMetrics.successRate / 100 : 0
  const avgMomentum = context.tracker.activeCampaigns > 0 ? 0.7 : 0.4

  return {
    totalArtists: 1, // Single artist in context, could be enhanced for multi-artist
    totalCampaigns,
    avgReplyQuality,
    avgScenePenetration,
    avgCreativityIndex,
    avgCampaignEfficiency,
    avgMomentum,
  }
}

function compareArtists(context: FusionContext): ArtistComparison[] {
  // In a real implementation, this would iterate over multiple artists
  // For now, we'll create a comparison for the current artist

  const replyQuality = context.contactIntel.avgReplyQualityScore
  const scenePenetration = calculateScenePenetration(context)
  const creativityIndex = calculateCreativityIndex(context)
  const campaignEfficiency =
    context.tracker.totalCampaigns > 0 ? context.tracker.performanceMetrics.successRate / 100 : 0
  const successAlignment = calculateSuccessAlignment(context)
  const momentum = calculateMomentum(context)
  const coverageFootprint = calculateCoverageFootprint(context)

  const overallScore =
    (replyQuality * 0.2 +
      scenePenetration * 0.15 +
      creativityIndex * 0.15 +
      campaignEfficiency * 0.2 +
      successAlignment * 0.1 +
      momentum * 0.1 +
      coverageFootprint * 0.1) *
    100

  return [
    {
      artistSlug: 'current-artist',
      artistName: 'Current Artist',
      replyQuality,
      scenePenetration,
      creativityIndex,
      campaignEfficiency,
      successAlignment,
      momentum,
      coverageFootprint,
      overallScore,
      rank: 1,
    },
  ]
}

function calculateScenePenetration(context: FusionContext): number {
  // Based on community posts, scene involvement, and coverage
  const communityScore = Math.min(context.community.posts.length / 50, 1.0) * 0.4
  const coverageScore = Math.min(context.coverage.events.length / 30, 1.0) * 0.6
  return communityScore + coverageScore
}

function calculateCreativityIndex(context: FusionContext): number {
  // Based on asset drops, variety, and creative output
  const assetScore = Math.min(context.assets.drops.length / 20, 1.0) * 0.5
  const varietyScore =
    context.assets.drops.filter((d) => d.tags && d.tags.length > 0).length /
    Math.max(context.assets.drops.length, 1)
  return assetScore * 0.5 + varietyScore * 0.5
}

function calculateSuccessAlignment(context: FusionContext): number {
  // Based on success profiles and campaign outcomes
  const successRate = context.tracker.performanceMetrics.successRate / 100
  const campaignCompletion =
    context.tracker.totalCampaigns > 0
      ? context.tracker.campaigns.filter((c) => c.status === 'completed').length /
        context.tracker.totalCampaigns
      : 0

  return successRate * 0.6 + campaignCompletion * 0.4
}

function calculateMomentum(context: FusionContext): number {
  // Based on active campaigns, recent activity, and trend
  const activeCampaignScore = Math.min(context.tracker.activeCampaigns / 5, 1.0) * 0.5
  const recentActivityScore =
    context.tracker.recentActivity.filter(
      (a) => new Date(a.timestamp).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
    ).length / Math.max(context.tracker.recentActivity.length, 1)

  return activeCampaignScore + recentActivityScore * 0.5
}

function calculateCoverageFootprint(context: FusionContext): number {
  // Based on coverage events, geographic spread, and importance
  const eventScore = Math.min(context.coverage.events.length / 50, 1.0) * 0.6
  const countries = new Set(context.coverage.events.map((e) => e.country).filter(Boolean)).size
  const geoScore = Math.min(countries / 10, 1.0) * 0.4

  return eventScore + geoScore
}

function generateInsights(comparisons: ArtistComparison[], metrics: WorkspaceMetrics): string[] {
  const insights: string[] = []

  // Analyze top performers
  const topArtist = comparisons[0]
  if (topArtist) {
    if (topArtist.replyQuality > 0.7) {
      insights.push(
        `${topArtist.artistName} leads in reply quality with ${(topArtist.replyQuality * 100).toFixed(0)}%`
      )
    }

    if (topArtist.momentum < 0.5) {
      insights.push(
        `${topArtist.artistName} showing slowing momentum - consider new campaign initiatives`
      )
    }

    if (topArtist.scenePenetration > 0.8) {
      insights.push(
        `${topArtist.artistName} has strong scene penetration - well-positioned for growth`
      )
    }
  }

  // Workspace-wide insights
  if (metrics.avgReplyQuality < 0.5) {
    insights.push('Workspace-wide reply quality below 50% - review targeting strategy')
  }

  if (metrics.avgCampaignEfficiency < 0.4) {
    insights.push('Campaign efficiency across workspace is low - consider process improvements')
  }

  return insights
}

function identifyTopPerformers(comparisons: ArtistComparison[]): TopPerformer[] {
  const topPerformers: TopPerformer[] = []

  // Find leader in each metric
  const metrics = [
    'replyQuality',
    'scenePenetration',
    'creativityIndex',
    'campaignEfficiency',
    'momentum',
  ] as const

  metrics.forEach((metric) => {
    const sorted = [...comparisons].sort((a, b) => b[metric] - a[metric])
    const top = sorted[0]
    if (top) {
      topPerformers.push({
        artistSlug: top.artistSlug,
        metric,
        score: top[metric],
        reason: `Leading workspace with ${(top[metric] * 100).toFixed(0)}% ${metric}`,
      })
    }
  })

  return topPerformers
}

function identifyImprovementAreas(comparisons: ArtistComparison[]): ImprovementArea[] {
  const improvementAreas: ImprovementArea[] = []

  comparisons.forEach((artist) => {
    const weakMetrics: string[] = []
    const suggestions: string[] = []

    if (artist.replyQuality < 0.5) {
      weakMetrics.push('reply_quality')
      suggestions.push('Improve pitch personalization and targeting')
    }

    if (artist.scenePenetration < 0.4) {
      weakMetrics.push('scene_penetration')
      suggestions.push('Increase community engagement and scene presence')
    }

    if (artist.momentum < 0.4) {
      weakMetrics.push('momentum')
      suggestions.push('Launch new campaign or refresh strategy')
    }

    if (artist.coverageFootprint < 0.3) {
      weakMetrics.push('coverage_footprint')
      suggestions.push('Expand outreach to new outlets and regions')
    }

    if (weakMetrics.length > 0) {
      improvementAreas.push({
        artistSlug: artist.artistSlug,
        metrics: weakMetrics,
        suggestions,
        priority: weakMetrics.length >= 3 ? 'high' : weakMetrics.length === 2 ? 'medium' : 'low',
      })
    }
  })

  return improvementAreas
}
