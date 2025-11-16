/**
 * Live Fusion Controller
 * Phase 12B: Real-Time Multi-OS Collaboration
 *
 * Orchestrates real-time OS contributions in response to events
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { ThemeId, AgentName, FusionMessage } from '@totalaud/os-state/campaign'
import {
  liveEventBus,
  type LiveEventPayload,
  type LiveEventType,
  getEventTypePriority,
  getEventSeverityPriority,
} from '../events/liveEventBus'
import { generateOSContribution, type FusionFocus } from './crossOsReasoning'
import { writeFusionSummaryMemory } from '../memory/memoryWriter'

export interface LiveFusionConfig {
  minDelayPerOSMs: number // Minimum time between contributions per OS
  maxMessagesPerOSPerMinute: number // Rate limit per OS
  importantEventThreshold: number // Priority threshold for immediate response
  consensusMemoryThreshold: number // Number of agreeing OSs to trigger memory
}

const DEFAULT_CONFIG: LiveFusionConfig = {
  minDelayPerOSMs: 10000, // 10 seconds
  maxMessagesPerOSPerMinute: 4,
  importantEventThreshold: 3, // Priority >= 3 triggers immediate response
  consensusMemoryThreshold: 3, // 3+ OSs agreeing triggers memory
}

interface OSContributionState {
  lastContributionAt: number
  contributionsInLastMinute: number
  contributionTimestamps: number[]
}

class LiveFusionController {
  private config: LiveFusionConfig
  private activeSessions: Map<string, boolean> = new Map()
  private osStates: Map<string, Map<ThemeId, OSContributionState>> = new Map()
  private eventQueue: LiveEventPayload[] = []
  private processingInterval: NodeJS.Timeout | null = null
  private unsubscribe: (() => void) | null = null
  private supabase: SupabaseClient | null = null
  private userId: string | null = null

  constructor(config?: Partial<LiveFusionConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Initialise with Supabase client and user
   */
  init(supabase: SupabaseClient, userId: string): void {
    this.supabase = supabase
    this.userId = userId

    // Subscribe to event bus
    this.unsubscribe = liveEventBus.subscribe((event) => {
      this.handleEvent(event)
    })

    // Start processing queue
    this.startProcessing()
  }

  /**
   * Start live fusion for a session
   */
  startLiveFusion(sessionId: string): void {
    this.activeSessions.set(sessionId, true)
    this.osStates.set(sessionId, new Map())

    // Initialise OS states
    const allOSs: ThemeId[] = ['ascii', 'xp', 'aqua', 'daw', 'analogue']
    const sessionStates = this.osStates.get(sessionId)!

    allOSs.forEach((os) => {
      sessionStates.set(os, {
        lastContributionAt: 0,
        contributionsInLastMinute: 0,
        contributionTimestamps: [],
      })
    })

    console.log(`[LiveFusion] Started for session ${sessionId}`)
  }

  /**
   * Stop live fusion for a session
   */
  stopLiveFusion(sessionId: string): void {
    this.activeSessions.delete(sessionId)
    this.osStates.delete(sessionId)
    console.log(`[LiveFusion] Stopped for session ${sessionId}`)
  }

  /**
   * Handle incoming event
   */
  private handleEvent(event: LiveEventPayload): void {
    // Only queue events for active sessions
    const hasActiveSession = Array.from(this.activeSessions.keys()).some((sessionId) =>
      this.activeSessions.get(sessionId)
    )

    if (!hasActiveSession) return

    // Calculate event priority
    const typePriority = getEventTypePriority(event.type)
    const severityPriority = getEventSeverityPriority(event.severity)
    const totalPriority = typePriority + severityPriority

    // Add to queue with priority
    this.eventQueue.push(event)

    // Sort by priority (highest first)
    this.eventQueue.sort((a, b) => {
      const aPriority =
        getEventTypePriority(a.type) + getEventSeverityPriority(a.severity)
      const bPriority =
        getEventTypePriority(b.type) + getEventSeverityPriority(b.severity)
      return bPriority - aPriority
    })

    // Keep queue manageable
    if (this.eventQueue.length > 50) {
      this.eventQueue = this.eventQueue.slice(0, 50)
    }

    console.log(`[LiveFusion] Queued event: ${event.type} (priority: ${totalPriority})`)
  }

  /**
   * Start processing event queue
   */
  private startProcessing(): void {
    if (this.processingInterval) return

    // Process queue every 5 seconds
    this.processingInterval = setInterval(() => {
      this.processQueue()
    }, 5000)
  }

  /**
   * Process event queue
   */
  private async processQueue(): Promise<void> {
    if (this.eventQueue.length === 0) return

    const event = this.eventQueue.shift()!

    // Find active session for this campaign
    const sessionId = this.findActiveSession(event.campaignId)
    if (!sessionId) return

    // Decide which OS should respond
    const os = this.selectRespondingOS(sessionId, event)
    if (!os) return

    // Check rate limits
    if (!this.canOSContribute(sessionId, os)) {
      console.log(`[LiveFusion] OS ${os} rate limited`)
      return
    }

    // Generate contribution
    await this.generateContribution(sessionId, event, os)
  }

  /**
   * Find active session for campaign
   */
  private findActiveSession(campaignId: string): string | null {
    // In practice, you'd query Supabase for active fusion_sessions
    // For now, return first active session (simplified)
    const activeSessions = Array.from(this.activeSessions.keys()).filter((id) =>
      this.activeSessions.get(id)
    )
    return activeSessions[0] || null
  }

  /**
   * Select which OS should respond to this event
   */
  private selectRespondingOS(sessionId: string, event: LiveEventPayload): ThemeId | null {
    const sessionStates = this.osStates.get(sessionId)
    if (!sessionStates) return null

    // If event has OS hint, prefer that OS
    if (event.osHint && sessionStates.has(event.osHint)) {
      if (this.canOSContribute(sessionId, event.osHint)) {
        return event.osHint
      }
    }

    // Otherwise, select OS that hasn't spoken recently
    const allOSs: ThemeId[] = ['ascii', 'xp', 'aqua', 'daw', 'analogue']
    const availableOSs = allOSs.filter((os) => this.canOSContribute(sessionId, os))

    if (availableOSs.length === 0) return null

    // Return OS with oldest last contribution
    return availableOSs.reduce((oldest, current) => {
      const oldestState = sessionStates.get(oldest)!
      const currentState = sessionStates.get(current)!
      return currentState.lastContributionAt < oldestState.lastContributionAt
        ? current
        : oldest
    })
  }

  /**
   * Check if OS can contribute (rate limiting)
   */
  private canOSContribute(sessionId: string, os: ThemeId): boolean {
    const sessionStates = this.osStates.get(sessionId)
    if (!sessionStates) return false

    const state = sessionStates.get(os)
    if (!state) return false

    const now = Date.now()

    // Check minimum delay
    if (now - state.lastContributionAt < this.config.minDelayPerOSMs) {
      return false
    }

    // Clean up old timestamps (older than 1 minute)
    state.contributionTimestamps = state.contributionTimestamps.filter(
      (ts) => now - ts < 60000
    )

    // Check rate limit
    if (state.contributionTimestamps.length >= this.config.maxMessagesPerOSPerMinute) {
      return false
    }

    return true
  }

  /**
   * Generate OS contribution
   */
  private async generateContribution(
    sessionId: string,
    event: LiveEventPayload,
    os: ThemeId
  ): Promise<void> {
    if (!this.supabase || !this.userId) {
      console.error('[LiveFusion] Not initialised with Supabase client')
      return
    }

    try {
      // Get previous messages for context
      const { data: previousMessages } = await this.supabase
        .from('fusion_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(10)

      // Get agent from event or default
      const agent: AgentName = event.agent || this.getAgentForEventType(event.type)

      // Create focus based on event
      const focus = this.createFocusFromEvent(event)

      // Generate contribution
      const contribution = await generateOSContribution({
        focus,
        previousMessages: (previousMessages as FusionMessage[]) || [],
        agent,
        os,
      })

      // Save to fusion_messages
      const { data: newMessage, error } = await this.supabase
        .from('fusion_messages')
        .insert({
          session_id: sessionId,
          os,
          agent,
          role: 'agent',
          content: {
            message: contribution.summary,
            recommendations: contribution.recommendations,
            metadata: {
              eventType: event.type,
              eventId: event.entityId,
              sentiment: contribution.sentiment,
            },
          },
        })
        .select()
        .single()

      if (error) {
        console.error('[LiveFusion] Failed to save message:', error)
        return
      }

      // Update OS state
      const now = Date.now()
      const sessionStates = this.osStates.get(sessionId)!
      const state = sessionStates.get(os)!
      state.lastContributionAt = now
      state.contributionTimestamps.push(now)
      state.contributionsInLastMinute = state.contributionTimestamps.length

      console.log(`[LiveFusion] ${os.toUpperCase()} contributed: ${contribution.summary.slice(0, 50)}...`)

      // Emit fusion_message_created event
      liveEventBus.emit({
        type: 'fusion_message_created',
        timestamp: new Date().toISOString(),
        campaignId: event.campaignId,
        entityType: 'fusion_session',
        entityId: sessionId,
        osHint: os,
        meta: {
          messageId: newMessage.id,
          sentiment: contribution.sentiment,
        },
      })

      // Check for consensus and write memory if needed
      await this.checkAndWriteMemory(sessionId, event.campaignId, previousMessages as FusionMessage[] || [], contribution, os)
    } catch (error) {
      console.error('[LiveFusion] Error generating contribution:', error)
    }
  }

  /**
   * Get appropriate agent for event type
   */
  private getAgentForEventType(type: LiveEventType): AgentName {
    switch (type) {
      case 'loop_executed':
      case 'loop_suggestion_created':
        return 'coach'
      case 'memory_created':
      case 'card_created':
        return 'insight'
      case 'clip_activated':
      case 'clip_completed':
        return 'tracker'
      case 'agent_warning':
      case 'agent_success':
      default:
        return 'scout'
    }
  }

  /**
   * Create fusion focus from event
   */
  private createFocusFromEvent(event: LiveEventPayload): FusionFocus {
    // Simplified - in practice, fetch entity data from Supabase
    return {
      type: event.entityType === 'clip' ? 'clip' : event.entityType === 'card' ? 'card' : 'campaign',
      id: event.entityId || event.campaignId,
      data: {
        id: event.entityId || event.campaignId,
        // Add minimal data - real implementation would fetch from DB
      } as any,
    }
  }

  /**
   * Check for consensus/tension and write memory if appropriate
   */
  private async checkAndWriteMemory(
    sessionId: string,
    campaignId: string,
    previousMessages: FusionMessage[],
    newContribution: { summary: string; recommendations: string[]; sentiment: string },
    os: ThemeId
  ): Promise<void> {
    if (!this.supabase || !this.userId) return

    // Get last 5 messages
    const recentMessages = previousMessages.slice(0, 5)

    // Count sentiment distribution
    const sentimentCounts = {
      positive: 0,
      neutral: 0,
      cautious: 0,
      critical: 0,
    }

    recentMessages.forEach((msg) => {
      const sentiment = (msg.content as any)?.metadata?.sentiment
      if (sentiment && sentiment in sentimentCounts) {
        sentimentCounts[sentiment as keyof typeof sentimentCounts]++
      }
    })

    // Add new contribution
    if (newContribution.sentiment in sentimentCounts) {
      sentimentCounts[newContribution.sentiment as keyof typeof sentimentCounts]++
    }

    // Check for consensus (3+ OSs with same sentiment)
    const maxSentiment = Object.entries(sentimentCounts).reduce((max, [sentiment, count]) =>
      count > max[1] ? [sentiment, count] : max
    , ['', 0])

    if (maxSentiment[1] >= this.config.consensusMemoryThreshold) {
      // Write consensus memory
      await writeFusionSummaryMemory({
        supabase: this.supabase,
        userId: this.userId,
        campaignId,
        sessionId,
        summary: `Consensus reached: ${maxSentiment[0]} sentiment across ${maxSentiment[1]} OS perspectives`,
        recommendations: newContribution.recommendations.slice(0, 3),
        importance: 4,
      })

      console.log(`[LiveFusion] Wrote consensus memory: ${maxSentiment[0]}`)
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }

    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }

    this.activeSessions.clear()
    this.osStates.clear()
    this.eventQueue = []
  }
}

// Singleton instance
let controllerInstance: LiveFusionController | null = null

/**
 * Initialise live fusion controller
 */
export function initLiveFusionController(
  supabase: SupabaseClient,
  userId: string,
  config?: Partial<LiveFusionConfig>
): LiveFusionController {
  if (!controllerInstance) {
    controllerInstance = new LiveFusionController(config)
  }
  controllerInstance.init(supabase, userId)
  return controllerInstance
}

/**
 * Get controller instance
 */
export function getLiveFusionController(): LiveFusionController | null {
  return controllerInstance
}

/**
 * Destroy controller
 */
export function destroyLiveFusionController(): void {
  if (controllerInstance) {
    controllerInstance.destroy()
    controllerInstance = null
  }
}
