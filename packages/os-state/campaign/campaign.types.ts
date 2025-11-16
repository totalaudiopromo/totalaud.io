/**
 * Campaign State Types
 * Unified state for timeline, cards, and campaign metadata
 * Used across all OS personalities
 */

export type ThemeId = 'ascii' | 'xp' | 'aqua' | 'daw' | 'analogue'

export type CardType =
  | 'hope'
  | 'doubt'
  | 'pride'
  | 'fear'
  | 'clarity'
  | 'excitement'
  | 'frustration'
  | 'breakthrough'
  | 'uncertainty'
  | 'loop_insight'
  | 'loop_warning'
  | 'loop_improvement'
  | 'loop_prediction'

export interface TimelineClip {
  id: string
  trackId: string
  name: string
  startTime: number // in seconds
  duration: number
  colour: string
  agentSource?: string // Which agent suggested this clip
  cardLinks: string[] // IDs of linked analogue cards
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface TimelineTrack {
  id: string
  name: string
  colour: string
  height: number
  muted: boolean
  solo: boolean
  order: number
}

export interface AnalogueCard {
  id: string
  type: CardType
  content: string
  timestamp: Date
  linkedClipId?: string
  colour: string
  createdBy: string // user_id or 'system'
  metadata?: Record<string, unknown>
}

export interface TimelineState {
  tracks: TimelineTrack[]
  clips: TimelineClip[]
  playheadPosition: number // in seconds
  zoom: number // pixels per second
  scrollOffset: number // horizontal scroll in pixels
  snapToGrid: boolean
  gridSize: number // in seconds
  isPlaying: boolean
  duration: number // total timeline duration
  selectedClipIds: string[]
  selectedTrackIds: string[]
}

export interface CardState {
  cards: AnalogueCard[]
  selectedCardIds: string[]
  filterByType?: CardType
  sortBy: 'timestamp' | 'type' | 'recent'
}

export interface LoopState {
  loops: AgentLoop[]
  loopEvents: LoopEvent[]
  loopSuggestions: LoopSuggestion[]
  loopMetrics: LoopMetrics | null
  nextLoopRun: string | null
  loopHealthScore: number
}

export interface AgentLoop {
  id: string
  userId: string
  agent: 'scout' | 'coach' | 'tracker' | 'insight'
  loopType: 'improvement' | 'exploration' | 'healthcheck' | 'emotion' | 'prediction'
  interval: '5m' | '15m' | '1h' | 'daily'
  payload: Record<string, unknown>
  lastRun: string | null
  nextRun: string
  status: 'idle' | 'running' | 'error' | 'disabled'
  createdAt: string
  updatedAt: string
}

export interface LoopEvent {
  id: string
  loopId: string
  agent: 'scout' | 'coach' | 'tracker' | 'insight'
  result: {
    success: boolean
    message: string
    data?: unknown
    clipsCreated?: number
    cardsCreated?: number
    suggestionsGenerated?: number
    executionTimeMs?: number
    error?: string
  }
  createdAt: string
}

export interface LoopSuggestion {
  id: string
  agent: 'scout' | 'coach' | 'tracker' | 'insight'
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
  loopHealthScore: number
  nextLoopRun: string | null
  agentBreakdown: Record<'scout' | 'coach' | 'tracker' | 'insight', {
    loopCount: number
    lastRun: string | null
    successRate: number
  }>
}

export interface CampaignMeta {
  id: string
  name: string
  goal: string
  currentTheme: ThemeId
  createdAt: Date
  updatedAt: Date
  userId: string
}

export interface CampaignContext {
  meta: CampaignMeta
  timeline: TimelineState
  cards: CardState
  loops: LoopState
  isDirty: boolean
  lastSavedAt?: Date
}

// Agent suggestion types
export interface AgentSuggestion {
  id: string
  agentType: 'scout' | 'coach' | 'tracker' | 'insight'
  clipName: string
  suggestedStartTime?: number
  suggestedDuration: number
  rationale: string
  confidence: number // 0-1
  metadata?: Record<string, unknown>
  createdAt: Date
}

// OS Activity tracking for Mood Rings
export interface OSActivity {
  osId: ThemeId
  activityType: string
  count: number
  lastActivity: Date
}

export interface OSMoodRing {
  ascii: OSActivity
  xp: OSActivity
  aqua: OSActivity
  daw: OSActivity
  analogue: OSActivity
}

// Mixtape export types
export interface MixtapeExportConfig {
  includeCards: boolean
  includeTimestamps: boolean
  theme: ThemeId
  title: string
  description?: string
}

export interface AgentInsights {
  totalExecutions: number
  agentBreakdown: Record<string, { executions: number; successRate: number }>
  bottlenecks: Array<{
    type: string
    severity: 'low' | 'medium' | 'high'
    description: string
  }>
  recommendations: Array<{
    title: string
    description: string
    impact: 'low' | 'medium' | 'high'
    agent: string
  }>
  emotionalJourney: Array<{
    emotion: CardType
    count: number
    trend: 'increasing' | 'stable' | 'decreasing'
  }>
}

export interface LoopInsights {
  totalLoops: number
  activeLoops: number
  loopHealthScore: number
  loopBreakdown: Record<
    string,
    {
      loops: number
      lastRun: string | null
      successRate: number
    }
  >
  recentEvents: {
    loopType: LoopType
    agent: AgentName
    success: boolean
    timestamp: Date
    message: string
  }[]
  suggestions: {
    pending: number
    accepted: number
    declined: number
  }
}

export interface MixtapeData {
  campaign: CampaignMeta
  timeline: TimelineState
  cards?: AnalogueCard[]
  agentInsights?: AgentInsights
  loopInsights?: LoopInsights
  exportedAt: Date
  exportConfig: MixtapeExportConfig
}
