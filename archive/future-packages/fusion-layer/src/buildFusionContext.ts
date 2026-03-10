/**
 * Build Fusion Context
 *
 * Main orchestrator that loads and aggregates all context data
 * from Intel, Pitch, Tracker, and all supporting systems
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { FusionContext, LoaderOptions } from './types'
import {
  loadIntelContext,
  loadTrackerContext,
  loadCommunityContext,
  loadAssetContext,
  loadEmailContext,
  loadListContext,
  loadContactIntelContext,
  loadPressKitIntelContext,
  loadWriterRoomContext,
  loadReplyIntelContext,
  loadCampaignWatcherContext,
  loadPitchContext,
  loadReleaseContext,
  loadIntegrationContext,
  loadDiscoveryContext,
  loadAudienceBuilderContext,
  loadSuccessProfileContext,
  loadSimulatorContext,
  loadCoverageContext,
  loadCalendarContext,
} from './loaders'

/**
 * Build Fusion Context
 *
 * Loads all data from across the Total Audio ecosystem and
 * aggregates it into a unified context object.
 *
 * @param supabase - Supabase client
 * @param userId - User ID
 * @param workspaceId - Optional workspace ID for multi-client access
 * @returns Complete fusion context
 */
export async function buildFusionContext(
  supabase: SupabaseClient,
  userId: string,
  workspaceId?: string
): Promise<FusionContext> {
  const startTime = Date.now()
  const errors: string[] = []
  const warnings: string[] = []
  const sources: string[] = []

  const options: LoaderOptions = {
    userId,
    workspaceId,
    limit: 100,
  }

  // Load all contexts in parallel for performance
  const [
    intelResult,
    pitchResult,
    trackerResult,
    assetResult,
    emailResult,
    listResult,
    releaseResult,
    communityResult,
    integrationResult,
    contactIntelResult,
    pressKitIntelResult,
    writerRoomResult,
    replyIntelResult,
    campaignWatcherResult,
    discoveryResult,
    audienceBuilderResult,
    successProfileResult,
    simulatorResult,
    coverageResult,
    calendarResult,
  ] = await Promise.all([
    loadIntelContext(supabase, options),
    loadPitchContext(supabase, options),
    loadTrackerContext(supabase, options),
    loadAssetContext(supabase, options),
    loadEmailContext(supabase, options),
    loadListContext(supabase, options),
    loadReleaseContext(supabase, options),
    loadCommunityContext(supabase, options),
    loadIntegrationContext(supabase, options),
    loadContactIntelContext(supabase, options),
    loadPressKitIntelContext(supabase, options),
    loadWriterRoomContext(supabase, options),
    loadReplyIntelContext(supabase, options),
    loadCampaignWatcherContext(supabase, options),
    loadDiscoveryContext(supabase, options),
    loadAudienceBuilderContext(supabase, options),
    loadSuccessProfileContext(supabase, options),
    loadSimulatorContext(supabase, options),
    loadCoverageContext(supabase, options),
    loadCalendarContext(supabase, options),
  ])

  // Collect errors and sources
  const results = [
    { name: 'intel', result: intelResult },
    { name: 'pitch', result: pitchResult },
    { name: 'tracker', result: trackerResult },
    { name: 'asset', result: assetResult },
    { name: 'email', result: emailResult },
    { name: 'list', result: listResult },
    { name: 'release', result: releaseResult },
    { name: 'community', result: communityResult },
    { name: 'integration', result: integrationResult },
    { name: 'contactIntel', result: contactIntelResult },
    { name: 'pressKitIntel', result: pressKitIntelResult },
    { name: 'writerRoom', result: writerRoomResult },
    { name: 'replyIntel', result: replyIntelResult },
    { name: 'campaignWatcher', result: campaignWatcherResult },
    { name: 'discovery', result: discoveryResult },
    { name: 'audienceBuilder', result: audienceBuilderResult },
    { name: 'successProfile', result: successProfileResult },
    { name: 'simulator', result: simulatorResult },
    { name: 'coverage', result: coverageResult },
    { name: 'calendar', result: calendarResult },
  ]

  let cacheHits = 0
  let cacheMisses = 0

  results.forEach(({ name, result }) => {
    sources.push(name)
    if (result.error) {
      errors.push(`${name}: ${result.error}`)
    }
    if (result.cached) {
      cacheHits++
    } else {
      cacheMisses++
    }
  })

  // Build unified context
  const fusionContext: FusionContext = {
    userId,
    workspaceId,

    // Core data
    intel: intelResult.data,
    pitch: pitchResult.data,
    tracker: trackerResult.data,

    // Features
    assets: assetResult.data,
    email: emailResult.data,
    lists: listResult.data,
    releases: releaseResult.data,
    community: communityResult.data,
    integrations: integrationResult.data,

    // Intelligence
    contactIntel: contactIntelResult.data,
    pressKitIntel: pressKitIntelResult.data,
    writerRoom: writerRoomResult.data,
    replyIntel: replyIntelResult.data,
    campaigns: campaignWatcherResult.data,

    // Discovery
    discovery: discoveryResult.data,
    audienceBuilder: audienceBuilderResult.data,

    // Analytics
    successProfiles: successProfileResult.data,
    simulator: simulatorResult.data,
    coverage: coverageResult.data,
    calendar: calendarResult.data,

    // Metadata
    metadata: {
      loadTime: Date.now() - startTime,
      sources,
      errors,
      warnings,
      cacheHits,
      cacheMisses,
    },
    lastUpdated: new Date(),
  }

  return fusionContext
}

/**
 * Partial Fusion Context Builder
 *
 * Load only specific contexts for performance optimization
 */
export async function buildPartialFusionContext(
  supabase: SupabaseClient,
  userId: string,
  contexts: string[],
  workspaceId?: string
): Promise<Partial<FusionContext>> {
  const startTime = Date.now()
  const errors: string[] = []
  const sources: string[] = []

  const options: LoaderOptions = {
    userId,
    workspaceId,
    limit: 100,
  }

  const partial: Partial<FusionContext> = {
    userId,
    workspaceId,
  }

  // Load only requested contexts
  if (contexts.includes('intel')) {
    const result = await loadIntelContext(supabase, options)
    partial.intel = result.data
    sources.push('intel')
    if (result.error) errors.push(`intel: ${result.error}`)
  }

  if (contexts.includes('tracker')) {
    const result = await loadTrackerContext(supabase, options)
    partial.tracker = result.data
    sources.push('tracker')
    if (result.error) errors.push(`tracker: ${result.error}`)
  }

  if (contexts.includes('pitch')) {
    const result = await loadPitchContext(supabase, options)
    partial.pitch = result.data
    sources.push('pitch')
    if (result.error) errors.push(`pitch: ${result.error}`)
  }

  if (contexts.includes('assets')) {
    const result = await loadAssetContext(supabase, options)
    partial.assets = result.data
    sources.push('assets')
    if (result.error) errors.push(`assets: ${result.error}`)
  }

  if (contexts.includes('email')) {
    const result = await loadEmailContext(supabase, options)
    partial.email = result.data
    sources.push('email')
    if (result.error) errors.push(`email: ${result.error}`)
  }

  if (contexts.includes('community')) {
    const result = await loadCommunityContext(supabase, options)
    partial.community = result.data
    sources.push('community')
    if (result.error) errors.push(`community: ${result.error}`)
  }

  partial.metadata = {
    loadTime: Date.now() - startTime,
    sources,
    errors,
    warnings: [],
    cacheHits: 0,
    cacheMisses: sources.length,
  }

  partial.lastUpdated = new Date()

  return partial
}

/**
 * Get Fusion Context (with caching)
 *
 * Production-ready wrapper with caching support
 */
export async function getFusionContext(
  supabase: SupabaseClient,
  userId: string,
  workspaceId?: string,
  options?: {
    useCache?: boolean
    cacheKeyPrefix?: string
    cacheTTL?: number
  }
): Promise<FusionContext> {
  // TODO: Implement caching layer (Redis or in-memory)
  // For now, just build fresh context
  return buildFusionContext(supabase, userId, workspaceId)
}
