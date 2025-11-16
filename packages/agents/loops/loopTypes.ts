/**
 * Loop Types
 * Type definitions for autonomous agent loops
 */

export type AgentName = 'scout' | 'coach' | 'tracker' | 'insight'

export type LoopType =
  | 'improvement' // Optimise existing work
  | 'exploration' // Discover new opportunities
  | 'healthcheck' // Monitor timeline health
  | 'emotion' // Track emotional journey
  | 'prediction' // Forecast outcomes

export type LoopInterval = '5m' | '15m' | '1h' | 'daily'

export type LoopStatus = 'idle' | 'running' | 'error' | 'disabled'

export interface AgentLoop {
  id: string
  userId: string
  agent: AgentName
  loopType: LoopType
  interval: LoopInterval
  payload: Record<string, unknown>
  lastRun: string | null
  nextRun: string
  status: LoopStatus
  createdAt: string
  updatedAt: string
}

export interface LoopEvent {
  id: string
  loopId: string
  agent: AgentName
  result: LoopExecutionResult
  createdAt: string
}

export interface LoopExecutionResult {
  success: boolean
  message: string
  data?: unknown
  clipsCreated?: number
  cardsCreated?: number
  suggestionsGenerated?: number
  executionTimeMs?: number
  error?: string
}

export interface LoopSuggestion {
  id: string
  agent: AgentName
  suggestionType: 'missing_followups' | 'timeline_gap' | 'emotion_drop' | 'overload'
  message: string
  priority: 'low' | 'medium' | 'high'
  recommendedAction: {
    type: 'create_clips' | 'create_cards' | 'modify_timeline' | 'adjust_timing'
    payload: unknown
  }
  createdAt: string
  status: 'pending' | 'accepted' | 'declined' | 'modified'
}

export interface LoopMetrics {
  totalLoops: number
  activeLoops: number
  loopsExecutedLast24h: number
  loopHealthScore: number // 0-100
  nextLoopRun: string | null
  agentBreakdown: Record<AgentName, {
    loopCount: number
    lastRun: string | null
    successRate: number
  }>
}

export interface LoopSchedule {
  interval: LoopInterval
  lastRun: Date | null
  nextRun: Date
  isOverdue: boolean
}

// Interval to milliseconds mapping
export const LOOP_INTERVALS: Record<LoopInterval, number> = {
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  'daily': 24 * 60 * 60 * 1000,
}

// Loop type descriptions
export const LOOP_TYPE_DESCRIPTIONS: Record<LoopType, string> = {
  improvement: 'Analyses existing work and suggests optimisations',
  exploration: 'Discovers new opportunities and research leads',
  healthcheck: 'Monitors timeline health and detects bottlenecks',
  emotion: 'Tracks emotional journey and sentiment changes',
  prediction: 'Forecasts outcomes and suggests next steps',
}

// Agent loop capabilities
export const AGENT_LOOP_CAPABILITIES: Record<AgentName, LoopType[]> = {
  scout: ['exploration', 'healthcheck'],
  coach: ['improvement', 'prediction'],
  tracker: ['healthcheck', 'prediction'],
  insight: ['emotion', 'improvement', 'healthcheck'],
}
