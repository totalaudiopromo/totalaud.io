/**
 * Agent Event Bus - Phase 9
 * Event-driven communication system for agent behaviours
 */

import type { TimelineClip, AgentBehaviourResult } from '@total-audio/timeline'

/**
 * Agent Event Types
 */
export type AgentEventType =
  | 'onClipActivated'
  | 'onClipCompleted'
  | 'onClipRejected'
  | 'onTimelineUpdated'
  | 'onCardCreated'
  | 'onAgentError'
  | 'onAgentOutput'
  | 'onAgentNeedsInput'
  | 'onAgentStarted'
  | 'onAgentStopped'
  | 'onPlayheadMoved'

/**
 * Event Payload Types
 */
export interface ClipActivatedEvent {
  type: 'onClipActivated'
  clip: TimelineClip
  playheadPosition: number
  timestamp: string
}

export interface ClipCompletedEvent {
  type: 'onClipCompleted'
  clip: TimelineClip
  result: AgentBehaviourResult
  duration: number
  timestamp: string
}

export interface ClipRejectedEvent {
  type: 'onClipRejected'
  clip: TimelineClip
  reason: string
  timestamp: string
}

export interface TimelineUpdatedEvent {
  type: 'onTimelineUpdated'
  campaignId: string
  changeType: 'clipAdded' | 'clipRemoved' | 'clipModified' | 'trackAdded' | 'trackRemoved'
  affectedIds: string[]
  timestamp: string
}

export interface CardCreatedEvent {
  type: 'onCardCreated'
  cardId: string
  sentiment: string
  linkedClipIds: string[]
  timestamp: string
}

export interface AgentErrorEvent {
  type: 'onAgentError'
  agentType: string
  clipId: string
  error: Error
  timestamp: string
}

export interface AgentOutputEvent {
  type: 'onAgentOutput'
  agentType: string
  clipId: string
  output: Record<string, unknown>
  timestamp: string
}

export interface AgentNeedsInputEvent {
  type: 'onAgentNeedsInput'
  agentType: string
  clipId: string
  question: string
  options?: string[]
  timestamp: string
}

export interface AgentStartedEvent {
  type: 'onAgentStarted'
  agentType: string
  clipId: string
  timestamp: string
}

export interface AgentStoppedEvent {
  type: 'onAgentStopped'
  agentType: string
  clipId: string
  reason: 'completed' | 'error' | 'cancelled'
  timestamp: string
}

export interface PlayheadMovedEvent {
  type: 'onPlayheadMoved'
  position: number
  previousPosition: number
  timestamp: string
}

/**
 * Union of all event types
 */
export type AgentEvent =
  | ClipActivatedEvent
  | ClipCompletedEvent
  | ClipRejectedEvent
  | TimelineUpdatedEvent
  | CardCreatedEvent
  | AgentErrorEvent
  | AgentOutputEvent
  | AgentNeedsInputEvent
  | AgentStartedEvent
  | AgentStoppedEvent
  | PlayheadMovedEvent

/**
 * Event Listener Function
 */
export type EventListener<T extends AgentEvent = AgentEvent> = (event: T) => void | Promise<void>

/**
 * Event Subscription
 */
interface EventSubscription {
  id: string
  type: AgentEventType
  listener: EventListener
  once: boolean
}

/**
 * Agent Event Bus Class
 */
export class AgentEventBus {
  private subscriptions: Map<string, EventSubscription> = new Map()
  private eventHistory: AgentEvent[] = []
  private maxHistorySize: number = 100

  /**
   * Subscribe to an event
   */
  on<T extends AgentEvent>(
    type: AgentEventType,
    listener: EventListener<T>,
    options?: { once?: boolean }
  ): string {
    const id = `${type}-${Date.now()}-${Math.random().toString(36).substring(7)}`
    const subscription: EventSubscription = {
      id,
      type,
      listener: listener as EventListener,
      once: options?.once || false,
    }

    this.subscriptions.set(id, subscription)
    return id
  }

  /**
   * Subscribe to an event (fires only once)
   */
  once<T extends AgentEvent>(type: AgentEventType, listener: EventListener<T>): string {
    return this.on(type, listener, { once: true })
  }

  /**
   * Unsubscribe from an event
   */
  off(subscriptionId: string): boolean {
    return this.subscriptions.delete(subscriptionId)
  }

  /**
   * Emit an event
   */
  async emit(event: AgentEvent): Promise<void> {
    // Add to history
    this.eventHistory.push(event)
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift()
    }

    // Get all subscriptions for this event type
    const matchingSubscriptions = Array.from(this.subscriptions.values()).filter(
      (sub) => sub.type === event.type
    )

    // Execute listeners
    const promises: Promise<void>[] = []

    for (const subscription of matchingSubscriptions) {
      try {
        const result = subscription.listener(event)
        if (result instanceof Promise) {
          promises.push(result)
        }

        // Remove one-time subscriptions
        if (subscription.once) {
          this.subscriptions.delete(subscription.id)
        }
      } catch (error) {
        console.error(`[AgentEventBus] Error in listener for ${event.type}:`, error)
      }
    }

    // Wait for all async listeners to complete
    if (promises.length > 0) {
      await Promise.allSettled(promises)
    }
  }

  /**
   * Get event history
   */
  getHistory(filter?: { type?: AgentEventType; limit?: number }): AgentEvent[] {
    let events = this.eventHistory

    if (filter?.type) {
      events = events.filter((e) => e.type === filter.type)
    }

    if (filter?.limit) {
      events = events.slice(-filter.limit)
    }

    return events
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = []
  }

  /**
   * Get all active subscriptions
   */
  getSubscriptions(): EventSubscription[] {
    return Array.from(this.subscriptions.values())
  }

  /**
   * Clear all subscriptions
   */
  clearSubscriptions(): void {
    this.subscriptions.clear()
  }

  /**
   * Get subscription count for an event type
   */
  getSubscriptionCount(type?: AgentEventType): number {
    if (!type) {
      return this.subscriptions.size
    }

    return Array.from(this.subscriptions.values()).filter((sub) => sub.type === type).length
  }
}

/**
 * Global event bus instance (singleton)
 */
let globalEventBus: AgentEventBus | null = null

/**
 * Get or create the global event bus
 */
export function getEventBus(): AgentEventBus {
  if (!globalEventBus) {
    globalEventBus = new AgentEventBus()
  }
  return globalEventBus
}

/**
 * Reset the global event bus (useful for testing)
 */
export function resetEventBus(): void {
  globalEventBus = null
}
