/**
 * Client-Safe Utilities
 *
 * This file contains utilities that can be safely imported in client components
 * without pulling in server-side dependencies (googleapis, etc.)
 */

// Re-export client-safe types and functions
export type { FlowTemplate, FlowStep } from './config/goalToFlowMap'

export {
  deserializeFlowTemplate,
  serializeFlowTemplate,
  goalToFlowMap,
} from './config/goalToFlowMap'

export type { AgentStatus } from './config/agentRoles'

// Re-export hooks
export { useAgentExecution } from './hooks/useAgentExecution'
export type { UseAgentExecutionOptions, UseAgentExecutionReturn } from './hooks/useAgentExecution'

// Agent status helpers
export function getStatusEmoji(status: string): string {
  const emojiMap: Record<string, string> = {
    idle: '⚪',
    queued: '🟡',
    running: '🔵',
    complete: '🟢',
    error: '🔴',
  }
  return emojiMap[status] || '⚪'
}

export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    idle: '#94a3b8',
    queued: '#fbbf24',
    running: '#3b82f6',
    complete: '#10b981',
    error: '#ef4444',
  }
  return colorMap[status] || '#94a3b8'
}

// Agent metadata (client-safe)
export interface AgentMetadata {
  id: string
  name: string
  emoji: string
  color: string
  description: string
  expertise?: string
}

export function getAgent(agentId: string): AgentMetadata | null {
  const agents: Record<string, AgentMetadata> = {
    'agent-broker': {
      id: 'agent-broker',
      name: 'Broker',
      emoji: '🎯',
      color: '#6366f1',
      description: 'Campaign orchestrator',
      expertise: 'Multi-agent workflow coordination',
    },
    'agent-scout': {
      id: 'agent-scout',
      name: 'Scout',
      emoji: '🧭',
      color: '#10b981',
      description: 'Contact research',
      expertise: 'Industry contact discovery',
    },
    'agent-coach': {
      id: 'agent-coach',
      name: 'Coach',
      emoji: '🎙️',
      color: '#3b82f6',
      description: 'Follow-up emails',
      expertise: 'AI-powered email drafting',
    },
    'agent-tracker': {
      id: 'agent-tracker',
      name: 'Tracker',
      emoji: '📊',
      color: '#f59e0b',
      description: 'Metrics & analytics',
      expertise: 'Integration sync & metrics',
    },
    'agent-insight': {
      id: 'agent-insight',
      name: 'Insight',
      emoji: '💡',
      color: '#8b5cf6',
      description: 'Campaign reports',
      expertise: 'Campaign mixdown reports',
    },
  }
  return agents[agentId] || null
}

// Broker personality helpers
// Re-export directly from personas module (client-safe)
export type {
  BrokerPersonality,
  BrokerPersonalityQuirk,
} from './personas/brokerPersonalityRegistry'
export {
  getBrokerPersonality,
  getPersonalityLine,
  applyPersonalityTone,
  getQuirkAnimationClass,
} from './personas/brokerPersonalityRegistry'
export type OSTheme = 'operator' | 'guide' | 'map' | 'timeline' | 'tape'

// Flow template helpers
export { getFlowTemplateForGoal } from './config/goalToFlowMap'

// Memory hooks
export { useBrokerMemoryLocal } from './hooks/useBrokerMemoryLocal'
export type { UseBrokerMemoryLocalReturn } from './hooks/useBrokerMemoryLocal'
export type { BrokerMemoryData } from './hooks/types'
