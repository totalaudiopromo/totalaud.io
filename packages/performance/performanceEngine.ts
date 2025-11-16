/**
 * Performance Engine
 * Phase 16: Central orchestrator for Live Performance Mode
 */

import { PerformanceClock, type PerformanceClockState } from './performanceClock'

export type OSType = 'ascii' | 'xp' | 'aqua' | 'daw' | 'analogue'

export type PerformanceEventType =
  | 'clip_activated'
  | 'clip_completed'
  | 'loop_executed'
  | 'loop_suggestion_created'
  | 'fusion_consensus'
  | 'fusion_tension'
  | 'memory_created'
  | 'agent_success'
  | 'agent_warning'
  | 'evolution_spike'

export type EventSeverity = 'info' | 'success' | 'warning' | 'critical'

export interface PerformanceEvent {
  type: PerformanceEventType
  os?: OSType
  relatedOS?: OSType[]
  createdAt: number // timestamp
  severity?: EventSeverity
  meta?: Record<string, unknown>
}

export interface OSPerformanceState {
  os: OSType
  isSpeaking: boolean // recent fusion/agent activity
  isThinking: boolean // loop or internal processing
  isCharged: boolean // recent evolution spike or important memory
  intensity: number // 0-1, overall activity level
  lastActivityAt: number
}

export interface EdgePerformanceState {
  osA: OSType
  osB: OSType
  shouldVibrate: boolean // recent tension event
  vibrateIntensity: number // 0-1
}

export interface PerformanceState {
  clock: PerformanceClockState
  osStates: Map<OSType, OSPerformanceState>
  edgeStates: EdgePerformanceState[]
  recentEvents: PerformanceEvent[]
  globalAtmosphere: {
    cohesion: number // 0-1
    tension: number // 0-1
    energy: number // 0-1
  }
}

export type PerformanceStateListener = (state: PerformanceState) => void

/**
 * Live Event Bus interface (from Phase 12B)
 */
export interface LiveEventBus {
  subscribe: (listener: (event: any) => void) => () => void
}

const EVENT_RETENTION_MS = 60000 // Keep events for 60s
const ACTIVITY_DECAY_MS = 8000 // Activity decays over 8s

/**
 * Performance Engine
 * Orchestrates live performance visualization
 */
export class PerformanceEngine {
  public clock: PerformanceClock
  private events: PerformanceEvent[] = []
  private listeners: Set<PerformanceStateListener> = new Set()
  private eventBusUnsubscribe: (() => void) | null = null
  private osStates: Map<OSType, OSPerformanceState>
  private edgeStates: EdgePerformanceState[] = []

  constructor(initialBpm: number = 120) {
    this.clock = new PerformanceClock(initialBpm)

    // Initialize OS states
    this.osStates = new Map()
    const allOS: OSType[] = ['ascii', 'xp', 'aqua', 'daw', 'analogue']
    allOS.forEach((os) => {
      this.osStates.set(os, {
        os,
        isSpeaking: false,
        isThinking: false,
        isCharged: false,
        intensity: 0,
        lastActivityAt: 0,
      })
    })

    // Subscribe to clock updates
    this.clock.subscribe(() => {
      this.updateState()
    })
  }

  /**
   * Attach to live event bus (Phase 12B)
   */
  attachEventBus(eventBus: LiveEventBus): void {
    if (this.eventBusUnsubscribe) {
      this.eventBusUnsubscribe()
    }

    this.eventBusUnsubscribe = eventBus.subscribe((event) => {
      this.handleLiveEvent(event)
    })
  }

  /**
   * Start the engine
   */
  start(): void {
    this.clock.start()
  }

  /**
   * Stop the engine
   */
  stop(): void {
    this.clock.stop()

    if (this.eventBusUnsubscribe) {
      this.eventBusUnsubscribe()
      this.eventBusUnsubscribe = null
    }
  }

  /**
   * Subscribe to performance state updates
   */
  subscribe(listener: PerformanceStateListener): () => void {
    this.listeners.add(listener)

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Add a performance event manually (for demo/testing)
   */
  addEvent(event: PerformanceEvent): void {
    this.events.push({
      ...event,
      createdAt: event.createdAt || performance.now(),
    })

    // Trim old events
    this.trimEvents()

    // Update derived states
    this.updateOSStates()
    this.updateEdgeStates()
    this.notify()
  }

  /**
   * Handle incoming live event from event bus
   */
  private handleLiveEvent(event: any): void {
    const now = performance.now()
    let perfEvent: PerformanceEvent | null = null

    // Map live events to performance events
    switch (event.type) {
      case 'clip_activated':
        perfEvent = {
          type: 'clip_activated',
          createdAt: now,
          severity: 'info',
          meta: event.data,
        }
        break

      case 'clip_completed':
        perfEvent = {
          type: 'clip_completed',
          createdAt: now,
          severity: 'success',
          meta: event.data,
        }
        break

      case 'loop_executed':
        perfEvent = {
          type: 'loop_executed',
          os: event.data?.agentType as OSType,
          createdAt: now,
          severity: 'info',
          meta: event.data,
        }
        break

      case 'fusion_message_created':
        // Detect consensus vs tension based on sentiment
        const sentiment = event.data?.sentiment
        if (sentiment === 'positive' || sentiment === 'hopeful') {
          perfEvent = {
            type: 'fusion_consensus',
            os: event.data?.os as OSType,
            createdAt: now,
            severity: 'success',
            meta: event.data,
          }
        } else if (sentiment === 'frustrated' || sentiment === 'concerned') {
          perfEvent = {
            type: 'fusion_tension',
            os: event.data?.os as OSType,
            createdAt: now,
            severity: 'warning',
            meta: event.data,
          }
        }
        break

      case 'memory_created':
        if (event.data?.importance >= 3) {
          perfEvent = {
            type: 'memory_created',
            os: event.data?.os as OSType,
            createdAt: now,
            severity: 'info',
            meta: event.data,
          }
        }
        break

      case 'evolution_delta':
        perfEvent = {
          type: 'evolution_spike',
          os: event.data?.os as OSType,
          createdAt: now,
          severity: 'success',
          meta: event.data,
        }
        break
    }

    if (perfEvent) {
      this.addEvent(perfEvent)
    }
  }

  /**
   * Trim old events
   */
  private trimEvents(): void {
    const cutoff = performance.now() - EVENT_RETENTION_MS
    this.events = this.events.filter((e) => e.createdAt > cutoff)
  }

  /**
   * Update OS performance states based on recent events
   */
  private updateOSStates(): void {
    const now = performance.now()

    this.osStates.forEach((state, os) => {
      // Find recent events for this OS
      const recentEvents = this.events.filter(
        (e) => e.os === os && now - e.createdAt < ACTIVITY_DECAY_MS
      )

      // Determine speaking state (fusion messages, agent activity)
      const speakingEvents = recentEvents.filter(
        (e) =>
          e.type === 'fusion_consensus' ||
          e.type === 'fusion_tension' ||
          e.type === 'agent_success' ||
          e.type === 'agent_warning'
      )
      state.isSpeaking = speakingEvents.length > 0

      // Determine thinking state (loops)
      const thinkingEvents = recentEvents.filter(
        (e) => e.type === 'loop_executed' || e.type === 'loop_suggestion_created'
      )
      state.isThinking = thinkingEvents.length > 0

      // Determine charged state (evolution, important memories)
      const chargedEvents = recentEvents.filter(
        (e) => e.type === 'evolution_spike' || e.type === 'memory_created'
      )
      state.isCharged = chargedEvents.length > 0

      // Calculate intensity (0-1)
      const eventCount = recentEvents.length
      state.intensity = Math.min(1, eventCount / 5)

      // Update last activity
      if (recentEvents.length > 0) {
        state.lastActivityAt = Math.max(...recentEvents.map((e) => e.createdAt))
      }

      // Decay states over time
      const timeSinceActivity = now - state.lastActivityAt
      if (timeSinceActivity > ACTIVITY_DECAY_MS) {
        state.isSpeaking = false
        state.isThinking = false
        state.intensity = Math.max(0, state.intensity - 0.01)
      }
    })
  }

  /**
   * Update edge states based on recent tension events
   */
  private updateEdgeStates(): void {
    const now = performance.now()
    const tensionEvents = this.events.filter(
      (e) => e.type === 'fusion_tension' && now - e.createdAt < ACTIVITY_DECAY_MS
    )

    // Reset all edges
    this.edgeStates = []

    // For each tension event, mark the relevant edge
    tensionEvents.forEach((event) => {
      if (event.os && event.relatedOS && event.relatedOS.length > 0) {
        event.relatedOS.forEach((relatedOS) => {
          const timeSinceEvent = now - event.createdAt
          const decayFactor = 1 - timeSinceEvent / ACTIVITY_DECAY_MS

          this.edgeStates.push({
            osA: event.os!,
            osB: relatedOS,
            shouldVibrate: true,
            vibrateIntensity: Math.max(0, decayFactor),
          })
        })
      }
    })
  }

  /**
   * Update state and notify listeners
   */
  private updateState(): void {
    this.trimEvents()
    this.updateOSStates()
    this.updateEdgeStates()
    this.notify()
  }

  /**
   * Notify all listeners with current state
   */
  private notify(): void {
    const state: PerformanceState = {
      clock: this.clock.getState(),
      osStates: new Map(this.osStates),
      edgeStates: [...this.edgeStates],
      recentEvents: [...this.events],
      globalAtmosphere: this.computeGlobalAtmosphere(),
    }

    this.listeners.forEach((listener) => {
      try {
        listener(state)
      } catch (error) {
        console.error('[PerformanceEngine] Listener error:', error)
      }
    })
  }

  /**
   * Compute global atmosphere metrics
   */
  private computeGlobalAtmosphere(): {
    cohesion: number
    tension: number
    energy: number
  } {
    const now = performance.now()

    // Calculate tension from recent tension events
    const recentTension = this.events.filter(
      (e) => e.type === 'fusion_tension' && now - e.createdAt < ACTIVITY_DECAY_MS
    )
    const tension = Math.min(1, recentTension.length / 3)

    // Calculate cohesion from consensus events
    const recentConsensus = this.events.filter(
      (e) => e.type === 'fusion_consensus' && now - e.createdAt < ACTIVITY_DECAY_MS
    )
    const cohesion = Math.min(1, recentConsensus.length / 3)

    // Calculate energy from all recent activity
    const recentActivity = this.events.filter((e) => now - e.createdAt < ACTIVITY_DECAY_MS)
    const energy = Math.min(1, recentActivity.length / 10)

    return { cohesion, tension, energy }
  }
}
