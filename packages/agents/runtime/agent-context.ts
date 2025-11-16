/**
 * Agent Context
 * Provides campaign and OS context to agent behaviours
 */

import type { ThemeId, CampaignMeta, TimelineState, CardState } from '@totalaud/os-state/campaign'

export interface AgentContext {
  // Campaign context
  campaign: CampaignMeta
  timeline: TimelineState
  cards: CardState

  // OS context
  currentOS: ThemeId
  osActivity: Record<ThemeId, number>

  // Execution context
  clipId?: string
  executionMode: 'auto' | 'manual' | 'assist'

  // User preferences
  userPreferences: {
    allowAutoExecution: boolean
    maxAutoActionsPerMinute: number
    preferredAgents: string[]
  }

  // System state
  timestamp: Date
  sessionId: string
}

export interface AgentCapabilities {
  canCreateClips: boolean
  canModifyClips: boolean
  canDeleteClips: boolean
  canCreateCards: boolean
  canSendMessages: boolean
  canRequestInput: boolean
  canTriggerOtherAgents: boolean
}

export const DEFAULT_AGENT_CAPABILITIES: AgentCapabilities = {
  canCreateClips: true,
  canModifyClips: true,
  canDeleteClips: false,
  canCreateCards: true,
  canSendMessages: true,
  canRequestInput: true,
  canTriggerOtherAgents: true,
}

export function createAgentContext(
  campaign: CampaignMeta,
  timeline: TimelineState,
  cards: CardState,
  currentOS: ThemeId,
  sessionId: string,
  options?: Partial<AgentContext>
): AgentContext {
  return {
    campaign,
    timeline,
    cards,
    currentOS,
    osActivity: {
      ascii: 0,
      xp: 0,
      aqua: 0,
      daw: 0,
      analogue: 0,
    },
    executionMode: options?.executionMode || 'manual',
    userPreferences: {
      allowAutoExecution: false,
      maxAutoActionsPerMinute: 10,
      preferredAgents: ['scout', 'coach', 'tracker', 'insight'],
      ...options?.userPreferences,
    },
    timestamp: new Date(),
    sessionId,
    ...options,
  }
}
