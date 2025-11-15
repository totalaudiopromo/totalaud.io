/**
 * Asset Telemetry Helper
 * Phase 15.2-C: Agent Integration Layer
 *
 * Purpose:
 * - Centralized telemetry tracking for asset-related events
 * - Ensures consistent event structure across agents
 * - Integrates with useFlowStateTelemetry hook
 *
 * Events:
 * - asset_attach_to_pitch
 * - asset_used_for_intel
 * - asset_view_from_tracker
 * - asset_unlinked
 */

import { logger } from '@/lib/logger'

const log = logger.scope('AssetTelemetry')

export interface AssetTelemetryEvent {
  sessionId?: string
  userId?: string
  assetId: string
  assetTitle?: string
  assetKind?: 'audio' | 'image' | 'document' | 'archive' | 'link' | 'other'
  agentName?: 'pitch' | 'intel' | 'tracker'
  metadata?: Record<string, any>
}

/**
 * Track asset_attach_to_pitch event
 */
export function trackAssetAttachToPitch(event: AssetTelemetryEvent): void {
  log.info('Telemetry: asset_attach_to_pitch', {
    sessionId: event.sessionId,
    userId: event.userId,
    assetId: event.assetId,
    assetKind: event.assetKind,
    metadata: event.metadata,
  })

  // In real implementation, this would call:
  // useFlowStateTelemetry().trackEvent('save', {
  //   metadata: {
  //     action: 'asset_attach_to_pitch',
  //     assetId: event.assetId,
  //     assetKind: event.assetKind,
  //     ...event.metadata
  //   }
  // })
}

/**
 * Track asset_used_for_intel event
 */
export function trackAssetUsedForIntel(event: AssetTelemetryEvent): void {
  log.info('Telemetry: asset_used_for_intel', {
    sessionId: event.sessionId,
    userId: event.userId,
    assetId: event.assetId,
    assetTitle: event.assetTitle,
    assetKind: event.assetKind,
    metadata: event.metadata,
  })

  // In real implementation, this would call useFlowStateTelemetry
}

/**
 * Track asset_view_from_tracker event
 */
export function trackAssetViewFromTracker(event: AssetTelemetryEvent): void {
  log.info('Telemetry: asset_view_from_tracker', {
    sessionId: event.sessionId,
    userId: event.userId,
    assetId: event.assetId,
    assetTitle: event.assetTitle,
    metadata: event.metadata,
  })

  // In real implementation, this would call useFlowStateTelemetry
}

/**
 * Track asset_unlinked event
 */
export function trackAssetUnlinked(event: AssetTelemetryEvent): void {
  log.info('Telemetry: asset_unlinked', {
    sessionId: event.sessionId,
    userId: event.userId,
    assetId: event.assetId,
    agentName: event.agentName,
    metadata: event.metadata,
  })

  // In real implementation, this would call useFlowStateTelemetry
}

/**
 * Batch track multiple asset events
 */
export function trackAssetEventsBatch(
  eventType: 'attach' | 'used' | 'view' | 'unlinked',
  events: AssetTelemetryEvent[]
): void {
  log.info(`Telemetry batch: ${events.length} asset events`, {
    eventType,
    assetIds: events.map((e) => e.assetId),
  })

  events.forEach((event) => {
    switch (eventType) {
      case 'attach':
        trackAssetAttachToPitch(event)
        break
      case 'used':
        trackAssetUsedForIntel(event)
        break
      case 'view':
        trackAssetViewFromTracker(event)
        break
      case 'unlinked':
        trackAssetUnlinked(event)
        break
    }
  })
}

/**
 * Helper to format asset telemetry metadata
 */
export function formatAssetMetadata(
  assetId: string,
  assetTitle: string,
  assetKind: string,
  additional?: Record<string, any>
): Record<string, any> {
  return {
    assetId,
    assetTitle,
    assetKind,
    timestamp: new Date().toISOString(),
    ...additional,
  }
}
