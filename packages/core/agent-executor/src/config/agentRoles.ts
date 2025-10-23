/**
 * Agent Roles Configuration
 *
 * Defines the personality, capabilities, and visual/audio identity
 * of each agent in the TotalAud.io system.
 *
 * Design Principle: "Each agent is a performer. Broker conducts. The user directs."
 */

export interface AgentRole {
  /** Agent identifier */
  id: string

  /** Display name */
  name: string

  /** Agent emoji */
  emoji: string

  /** Primary brand color */
  color: string

  /** Skills this agent can execute */
  skills: string[]

  /** Agent's communication voice/tone */
  voice: string

  /** Agent's domain expertise */
  expertise: string

  /** Sound cue ID (from Theme Engine) */
  soundCue?: 'ping' | 'chime' | 'pulse' | 'pad' | 'transition'

  /** Description for users */
  description: string
}

/**
 * Complete agent roster
 */
export const agentRoles: Record<string, AgentRole> = {
  broker: {
    id: 'broker',
    name: 'Broker',
    emoji: '🎙️',
    color: '#6366f1', // Indigo
    skills: ['orchestrate', 'delegate', 'summarize'],
    voice: 'witty, supportive, coordinating',
    expertise: 'Workflow orchestration and team coordination',
    soundCue: 'transition',
    description: 'Your audio liaison - coordinates all agents and guides the campaign flow',
  },

  scout: {
    id: 'scout',
    name: 'Scout',
    emoji: '🧭',
    color: '#10b981', // Green
    skills: ['research-contacts', 'analyze-datasets', 'discover-opportunities'],
    voice: 'optimistic, adventurous, resourceful',
    expertise: 'Contact research and opportunity discovery',
    soundCue: 'ping',
    description: 'Discovers radio stations, journalists, curators, and venues for your campaign',
  },

  coach: {
    id: 'coach',
    name: 'Coach',
    emoji: '🎯',
    color: '#6366f1', // Blue
    skills: ['write-pitch', 'refine-language', 'craft-story'],
    voice: 'supportive, confident, articulate',
    expertise: 'Pitch writing and creative communication',
    soundCue: 'chime',
    description: 'Crafts compelling pitches and helps you tell your story effectively',
  },

  tracker: {
    id: 'tracker',
    name: 'Tracker',
    emoji: '📊',
    color: '#f59e0b', // Amber
    skills: ['monitor-campaign', 'analyze-metrics', 'track-responses'],
    voice: 'analytical, calm, precise',
    expertise: 'Campaign monitoring and performance analysis',
    soundCue: 'pulse',
    description: 'Monitors your campaign progress and analyzes response patterns',
  },

  insight: {
    id: 'insight',
    name: 'Insight',
    emoji: '💡',
    color: '#8b5cf6', // Purple
    skills: ['generate-insights', 'compare-trends', 'recommend-strategy'],
    voice: 'wise, poetic, strategic',
    expertise: 'Strategic insights and trend analysis',
    soundCue: 'pad',
    description: 'Analyzes patterns and provides strategic recommendations for your campaign',
  },
}

/**
 * Get agent by ID
 */
export function getAgent(agentId: string): AgentRole | null {
  return agentRoles[agentId] || null
}

/**
 * Get agent by skill
 */
export function getAgentBySkill(skillId: string): AgentRole | null {
  for (const agent of Object.values(agentRoles)) {
    if (agent.skills.includes(skillId)) {
      return agent
    }
  }
  return null
}

/**
 * Get all available agents
 */
export function getAllAgents(): AgentRole[] {
  return Object.values(agentRoles)
}

/**
 * Agent execution statuses
 */
export type AgentStatus = 'queued' | 'running' | 'complete' | 'error' | 'cancelled'

/**
 * Get status color
 */
export function getStatusColor(status: AgentStatus): string {
  switch (status) {
    case 'queued':
      return '#64748b' // Gray
    case 'running':
      return '#f59e0b' // Amber
    case 'complete':
      return '#10b981' // Green
    case 'error':
      return '#ef4444' // Red
    case 'cancelled':
      return '#6b7280' // Dark gray
    default:
      return '#64748b'
  }
}

/**
 * Get status emoji
 */
export function getStatusEmoji(status: AgentStatus): string {
  switch (status) {
    case 'queued':
      return '⏱️'
    case 'running':
      return '⚡'
    case 'complete':
      return '✅'
    case 'error':
      return '❌'
    case 'cancelled':
      return '🚫'
    default:
      return '❓'
  }
}

/**
 * Agent activity log entry interface
 */
export interface AgentActivity {
  id: string
  session_id: string
  agent_name: string
  node_id: string
  status: AgentStatus
  message?: string
  result?: any
  metadata?: any
  started_at?: string
  completed_at?: string
  created_at: string
}
