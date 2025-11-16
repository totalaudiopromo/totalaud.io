/**
 * Live Event Bus
 * Phase 12B: Real-Time Multi-OS Collaboration
 *
 * Client-side pub/sub system for real-time OS reactions
 */

export type LiveEventType =
  | 'clip_activated'
  | 'clip_completed'
  | 'loop_executed'
  | 'loop_suggestion_created'
  | 'fusion_session_started'
  | 'fusion_session_ended'
  | 'memory_created'
  | 'card_created'
  | 'agent_warning'
  | 'agent_success'
  | 'fusion_message_created'

export type LiveEventSeverity = 'info' | 'success' | 'warning' | 'critical'

export type LiveEventEntityType = 'clip' | 'card' | 'loop' | 'campaign' | 'fusion_session'

export type LiveEventOS = 'ascii' | 'xp' | 'aqua' | 'daw' | 'analogue'

export type LiveEventAgent = 'scout' | 'coach' | 'tracker' | 'insight'

export interface LiveEventPayload {
  type: LiveEventType
  timestamp: string
  campaignId: string
  entityType?: LiveEventEntityType
  entityId?: string
  agent?: LiveEventAgent
  osHint?: LiveEventOS
  severity?: LiveEventSeverity
  meta?: Record<string, unknown>
}

export type LiveEventListener = (event: LiveEventPayload) => void

/**
 * In-memory event bus for client-side pub/sub
 */
class LiveEventBus {
  private listeners: LiveEventListener[] = []
  private eventHistory: LiveEventPayload[] = []
  private maxHistorySize = 100

  /**
   * Emit an event to all subscribers
   */
  emit(event: LiveEventPayload): void {
    // Add to history
    this.eventHistory.push(event)
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift()
    }

    // Notify all listeners
    this.listeners.forEach((listener) => {
      try {
        listener(event)
      } catch (error) {
        console.error('[LiveEventBus] Listener error:', error)
      }
    })
  }

  /**
   * Subscribe to events
   * Returns unsubscribe function
   */
  subscribe(listener: LiveEventListener): () => void {
    this.listeners.push(listener)

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * Get recent event history
   */
  getHistory(limit = 20): LiveEventPayload[] {
    return this.eventHistory.slice(-limit)
  }

  /**
   * Clear all listeners (useful for testing)
   */
  clearListeners(): void {
    this.listeners = []
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = []
  }
}

// Singleton instance
export const liveEventBus = new LiveEventBus()

/**
 * Helper: Create event payload with defaults
 */
export function createLiveEvent(
  type: LiveEventType,
  campaignId: string,
  options?: Partial<Omit<LiveEventPayload, 'type' | 'timestamp' | 'campaignId'>>
): LiveEventPayload {
  return {
    type,
    timestamp: new Date().toISOString(),
    campaignId,
    ...options,
  }
}

/**
 * Helper: Get severity priority (higher = more urgent)
 */
export function getEventSeverityPriority(severity?: LiveEventSeverity): number {
  switch (severity) {
    case 'critical':
      return 4
    case 'warning':
      return 3
    case 'success':
      return 2
    case 'info':
    default:
      return 1
  }
}

/**
 * Helper: Get event type priority
 */
export function getEventTypePriority(type: LiveEventType): number {
  switch (type) {
    case 'agent_warning':
    case 'agent_success':
      return 4
    case 'loop_suggestion_created':
      return 3
    case 'memory_created':
    case 'card_created':
      return 2
    case 'clip_activated':
    case 'clip_completed':
    default:
      return 1
  }
}
