/**
 * Evolution Event Listener
 * Phase 13A Integration
 *
 * Subscribes to liveEventBus and triggers OS Evolution for relevant events
 */

import { liveEventBus, type LiveEventPayload } from '../events/liveEventBus'
import { processEvolutionEvent } from './evolutionEngine'

/**
 * Initialize evolution listener
 * Subscribes to agent_warning and agent_success events from liveEventBus
 */
export function initializeEvolutionListener(userId: string): () => void {
  const handleEvent = async (event: LiveEventPayload) => {
    // Only process agent warning and success events
    if (event.type !== 'agent_warning' && event.type !== 'agent_success') {
      return
    }

    // Ensure we have an OS hint
    if (!event.osHint) {
      console.warn('[EvolutionListener] No OS hint provided for event:', event.type)
      return
    }

    try {
      await processEvolutionEvent(
        {
          type: event.type === 'agent_warning' ? 'agent_warning' : 'agent_success',
          os: event.osHint,
          meta: {
            agent: event.agent,
            severity: event.severity,
            entityType: event.entityType,
            entityId: event.entityId,
            ...event.meta,
          },
          timestamp: event.timestamp,
        },
        userId,
        event.campaignId
      )
    } catch (error) {
      console.error('[EvolutionListener] Failed to process evolution event:', error)
      // Don't throw - just log and continue
    }
  }

  // Subscribe to live event bus
  const unsubscribe = liveEventBus.subscribe(handleEvent)

  console.log('[EvolutionListener] Initialized for user:', userId)

  return unsubscribe
}
