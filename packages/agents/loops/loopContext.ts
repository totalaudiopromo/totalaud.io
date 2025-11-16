/**
 * Loop Context
 * Provides campaign context for autonomous loop execution
 */

import type { CampaignMeta, TimelineState, CardState, ThemeId } from '@totalaud/os-state/campaign'
import type { AgentContext } from '../runtime/agent-context'
import type { AgentLoop, LoopType } from './loopTypes'

export interface LoopExecutionContext {
  // Campaign context
  campaign: CampaignMeta
  timeline: TimelineState
  cards: CardState
  currentOS: ThemeId

  // Loop-specific context
  loop: AgentLoop
  loopType: LoopType
  isBackgroundExecution: boolean

  // Loop metrics
  loopHistory: {
    totalExecutions: number
    successRate: number
    lastSuccessfulRun: Date | null
  }

  // User preferences
  userPreferences: {
    allowBackgroundLoops: boolean
    maxLoopsPerHour: number
    enableAutoSuggestions: boolean
  }

  // System state
  timestamp: Date
  sessionId: string
}

/**
 * Create loop execution context from agent context
 */
export function createLoopContext(
  agentContext: AgentContext,
  loop: AgentLoop,
  loopHistory: {
    totalExecutions: number
    successRate: number
    lastSuccessfulRun: Date | null
  }
): LoopExecutionContext {
  return {
    campaign: agentContext.campaign,
    timeline: agentContext.timeline,
    cards: agentContext.cards,
    currentOS: agentContext.currentOS,
    loop,
    loopType: loop.loopType,
    isBackgroundExecution: true,
    loopHistory,
    userPreferences: {
      allowBackgroundLoops: agentContext.userPreferences.allowAutoExecution,
      maxLoopsPerHour: 3,
      enableAutoSuggestions: true,
    },
    timestamp: agentContext.timestamp,
    sessionId: agentContext.sessionId,
  }
}

/**
 * Convert loop context to agent context for execution
 */
export function loopContextToAgentContext(loopContext: LoopExecutionContext): AgentContext {
  return {
    campaign: loopContext.campaign,
    timeline: loopContext.timeline,
    cards: loopContext.cards,
    currentOS: loopContext.currentOS,
    osActivity: {
      ascii: 0,
      xp: 0,
      aqua: 0,
      daw: 0,
      analogue: 0,
    },
    clipId: undefined,
    executionMode: 'auto', // Loops always run in auto mode
    userPreferences: {
      allowAutoExecution: loopContext.userPreferences.allowBackgroundLoops,
      maxAutoActionsPerMinute: 10,
      preferredAgents: ['scout', 'coach', 'tracker', 'insight'],
    },
    timestamp: loopContext.timestamp,
    sessionId: loopContext.sessionId,
  }
}

/**
 * Determine if a loop should execute based on context
 */
export function shouldExecuteLoop(
  loop: AgentLoop,
  context: Partial<LoopExecutionContext>
): { shouldExecute: boolean; reason?: string } {
  // Don't execute disabled loops
  if (loop.status === 'disabled') {
    return { shouldExecute: false, reason: 'Loop is disabled' }
  }

  // Don't execute if already running
  if (loop.status === 'running') {
    return { shouldExecute: false, reason: 'Loop is already running' }
  }

  // Check if user allows background loops
  if (!context.userPreferences?.allowBackgroundLoops) {
    return { shouldExecute: false, reason: 'Background loops disabled by user' }
  }

  // Check if next run time has arrived
  const now = new Date()
  const nextRun = new Date(loop.nextRun)
  if (now < nextRun) {
    return {
      shouldExecute: false,
      reason: `Loop scheduled for ${nextRun.toISOString()}`,
    }
  }

  return { shouldExecute: true }
}
