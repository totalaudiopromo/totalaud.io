/**
 * Agent State Management - Phase 9
 * Tracks agent execution state and status
 */

import type { AgentType } from '@total-audio/timeline'

/**
 * Agent Execution State
 */
export type AgentExecutionState = 'idle' | 'initialising' | 'running' | 'paused' | 'completed' | 'failed'

/**
 * Agent Instance State
 */
export interface AgentInstanceState {
  agentType: AgentType
  clipId: string
  state: AgentExecutionState
  startedAt: string
  completedAt?: string
  duration?: number
  progress: number // 0-100
  output?: Record<string, unknown>
  error?: Error
  metadata: Record<string, unknown>
}

/**
 * Agent State Manager
 */
export class AgentStateManager {
  private states: Map<string, AgentInstanceState> = new Map()

  /**
   * Register a new agent execution
   */
  register(clipId: string, agentType: AgentType): AgentInstanceState {
    const state: AgentInstanceState = {
      agentType,
      clipId,
      state: 'initialising',
      startedAt: new Date().toISOString(),
      progress: 0,
      metadata: {},
    }

    this.states.set(clipId, state)
    return state
  }

  /**
   * Update agent state
   */
  update(clipId: string, updates: Partial<AgentInstanceState>): AgentInstanceState | null {
    const state = this.states.get(clipId)

    if (!state) {
      console.warn(`[AgentStateManager] No state found for clip ${clipId}`)
      return null
    }

    const updatedState = { ...state, ...updates }
    this.states.set(clipId, updatedState)

    return updatedState
  }

  /**
   * Set agent to running state
   */
  setRunning(clipId: string): AgentInstanceState | null {
    return this.update(clipId, { state: 'running' })
  }

  /**
   * Set agent to paused state
   */
  setPaused(clipId: string): AgentInstanceState | null {
    return this.update(clipId, { state: 'paused' })
  }

  /**
   * Set agent to completed state
   */
  setCompleted(clipId: string, output?: Record<string, unknown>): AgentInstanceState | null {
    const state = this.states.get(clipId)

    if (!state) {
      return null
    }

    const completedAt = new Date().toISOString()
    const duration = new Date(completedAt).getTime() - new Date(state.startedAt).getTime()

    return this.update(clipId, {
      state: 'completed',
      completedAt,
      duration,
      progress: 100,
      output,
    })
  }

  /**
   * Set agent to failed state
   */
  setFailed(clipId: string, error: Error): AgentInstanceState | null {
    const state = this.states.get(clipId)

    if (!state) {
      return null
    }

    const completedAt = new Date().toISOString()
    const duration = new Date(completedAt).getTime() - new Date(state.startedAt).getTime()

    return this.update(clipId, {
      state: 'failed',
      completedAt,
      duration,
      error,
    })
  }

  /**
   * Update progress (0-100)
   */
  setProgress(clipId: string, progress: number): AgentInstanceState | null {
    const clampedProgress = Math.max(0, Math.min(100, progress))
    return this.update(clipId, { progress: clampedProgress })
  }

  /**
   * Get state for a clip
   */
  get(clipId: string): AgentInstanceState | null {
    return this.states.get(clipId) || null
  }

  /**
   * Get all active agent states
   */
  getActive(): AgentInstanceState[] {
    return Array.from(this.states.values()).filter(
      (state) => state.state === 'running' || state.state === 'paused'
    )
  }

  /**
   * Get all states
   */
  getAll(): AgentInstanceState[] {
    return Array.from(this.states.values())
  }

  /**
   * Clear completed/failed states
   */
  clearFinished(): void {
    for (const [clipId, state] of this.states.entries()) {
      if (state.state === 'completed' || state.state === 'failed') {
        this.states.delete(clipId)
      }
    }
  }

  /**
   * Clear all states
   */
  clearAll(): void {
    this.states.clear()
  }

  /**
   * Get state count by status
   */
  getCountByState(state: AgentExecutionState): number {
    return Array.from(this.states.values()).filter((s) => s.state === state).length
  }
}

/**
 * Global state manager instance
 */
let globalStateManager: AgentStateManager | null = null

/**
 * Get or create the global state manager
 */
export function getAgentStateManager(): AgentStateManager {
  if (!globalStateManager) {
    globalStateManager = new AgentStateManager()
  }
  return globalStateManager
}

/**
 * Reset the global state manager (useful for testing)
 */
export function resetAgentStateManager(): void {
  globalStateManager = null
}
