/**
 * Agent State Management
 * Tracks active agents, execution queue, and rate limiting
 */

export type AgentStatus = 'idle' | 'running' | 'waiting' | 'error'

export interface AgentExecutionState {
  agentName: string
  status: AgentStatus
  currentClipId?: string
  startedAt?: Date
  completedAt?: Date
  error?: string
  output?: unknown
}

export interface AgentRateLimiter {
  actionsInLastMinute: number
  lastResetTime: Date
  maxActionsPerMinute: number
}

export class AgentStateManager {
  private executionStates: Map<string, AgentExecutionState> = new Map()
  private rateLimiters: Map<string, AgentRateLimiter> = new Map()
  private executionQueue: Array<{ agentName: string; clipId: string }> = []

  constructor(private maxActionsPerMinute: number = 10) {}

  /**
   * Register an agent
   */
  registerAgent(agentName: string): void {
    if (!this.executionStates.has(agentName)) {
      this.executionStates.set(agentName, {
        agentName,
        status: 'idle',
      })

      this.rateLimiters.set(agentName, {
        actionsInLastMinute: 0,
        lastResetTime: new Date(),
        maxActionsPerMinute: this.maxActionsPerMinute,
      })
    }
  }

  /**
   * Check if agent can execute (rate limiting)
   */
  canExecute(agentName: string): boolean {
    const limiter = this.rateLimiters.get(agentName)
    if (!limiter) return false

    // Reset counter if minute has passed
    const now = new Date()
    const minutesPassed =
      (now.getTime() - limiter.lastResetTime.getTime()) / (1000 * 60)

    if (minutesPassed >= 1) {
      limiter.actionsInLastMinute = 0
      limiter.lastResetTime = now
    }

    return limiter.actionsInLastMinute < limiter.maxActionsPerMinute
  }

  /**
   * Record agent execution
   */
  recordExecution(agentName: string): void {
    const limiter = this.rateLimiters.get(agentName)
    if (limiter) {
      limiter.actionsInLastMinute++
    }
  }

  /**
   * Start agent execution
   */
  startExecution(agentName: string, clipId: string): void {
    const state = this.executionStates.get(agentName)
    if (state) {
      state.status = 'running'
      state.currentClipId = clipId
      state.startedAt = new Date()
      state.completedAt = undefined
      state.error = undefined
    }
  }

  /**
   * Complete agent execution
   */
  completeExecution(agentName: string, output?: unknown): void {
    const state = this.executionStates.get(agentName)
    if (state) {
      state.status = 'idle'
      state.completedAt = new Date()
      state.output = output
      state.currentClipId = undefined
    }
  }

  /**
   * Mark agent execution as failed
   */
  failExecution(agentName: string, error: string): void {
    const state = this.executionStates.get(agentName)
    if (state) {
      state.status = 'error'
      state.error = error
      state.completedAt = new Date()
    }
  }

  /**
   * Get agent status
   */
  getAgentStatus(agentName: string): AgentStatus {
    return this.executionStates.get(agentName)?.status || 'idle'
  }

  /**
   * Get all agent states
   */
  getAllStates(): AgentExecutionState[] {
    return Array.from(this.executionStates.values())
  }

  /**
   * Add to execution queue
   */
  enqueue(agentName: string, clipId: string): void {
    this.executionQueue.push({ agentName, clipId })
  }

  /**
   * Get next from queue
   */
  dequeue(): { agentName: string; clipId: string } | undefined {
    return this.executionQueue.shift()
  }

  /**
   * Check if queue is empty
   */
  isQueueEmpty(): boolean {
    return this.executionQueue.length === 0
  }

  /**
   * Clear all state
   */
  reset(): void {
    this.executionStates.clear()
    this.rateLimiters.clear()
    this.executionQueue = []
  }
}

// Global instance
export const agentStateManager = new AgentStateManager()
