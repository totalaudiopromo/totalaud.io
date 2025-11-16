/**
 * Campaign State Types
 * Unified state for timeline, cards, and campaign metadata
 * Used across all OS personalities
 */

export type ThemeId = 'ascii' | 'xp' | 'aqua' | 'daw' | 'analogue'

export type AgentName = 'scout' | 'coach' | 'tracker' | 'insight'

export type LoopType = 'improvement' | 'exploration' | 'healthcheck' | 'emotion' | 'prediction'

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
  | 'fusion'

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
  agent: AgentName
  loopType: LoopType
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

// ============================================================================
// FUSION MODE TYPES (Phase 11)
// ============================================================================

export interface FusionSession {
  id: string
  userId: string
  focusType: 'clip' | 'card' | 'campaign'
  focusId: string
  active: boolean
  osContributors: ThemeId[]
  createdAt: string
  closedAt: string | null
}

export interface FusionMessage {
  id: string
  sessionId: string
  os: ThemeId
  agent: AgentName
  role: 'system' | 'agent' | 'summary'
  content: {
    message: string
    recommendations?: string[]
    metadata?: Record<string, unknown>
  }
  createdAt: string
}

export interface FusionCardData {
  osContributors: ThemeId[] // Usually all 5
  unifiedSummary: string
  pointsOfAgreement: string[]
  pointsOfTension?: string[]
  recommendedNextMoves: string[]
  sessionId: string
}

export interface FusionOutput {
  perOS: Record<
    ThemeId,
    {
      summary: string
      recommendations: string[]
      sentiment?: 'positive' | 'neutral' | 'cautious' | 'critical'
    }
  >
  unifiedSummary: string
  pointsOfAgreement: string[]
  pointsOfTension: string[]
}

export interface FusionState {
  currentSession: FusionSession | null
  sessions: FusionSession[]
  messages: FusionMessage[]
  isLoading: boolean
  liveEnabled: boolean
  lastFusionEventAt: string | null
}

export interface MixtapeData {
  campaign: CampaignMeta
  timeline: TimelineState
  cards?: AnalogueCard[]
  agentInsights?: AgentInsights
  loopInsights?: LoopInsights
  fusionInsights?: {
    totalSessions: number
    topRecommendations: string[]
    fusionCardSummary?: string
    multiOSStory?: string
  }
  exportedAt: Date
  exportConfig: MixtapeExportConfig
}

// ============================================================================
// MEMORY SYSTEM TYPES (Phase 12A)
// ============================================================================

export type MemoryType = 'fact' | 'pattern' | 'reflection' | 'emotion' | 'warning'

export interface OSMemory {
  id: string
  userId: string
  campaignId?: string | null // Global vs per-campaign
  os: ThemeId
  agent?: AgentName | null
  memoryType: MemoryType
  title: string
  content: Record<string, unknown>
  importance: number // 1-5
  createdAt: string
}

export interface MemoryLink {
  id: string
  memoryId: string
  entityType: 'clip' | 'card' | 'loop' | 'campaign' | 'fusion_session'
  entityId: string
  createdAt: string
}

export interface MemoryState {
  memories: OSMemory[]
  memoryLinks: MemoryLink[]
  isLoadingMemories: boolean
}

// ============================================================================
// OS EVOLUTION TYPES (Phase 13A)
// ============================================================================

export type EvolutionEventType =
  | 'memory'
  | 'fusion_agreement'
  | 'fusion_tension'
  | 'loop_feedback'
  | 'agent_success'
  | 'agent_warning'
  | 'user_override'
  | 'sentiment_shift'

export interface EmotionalBias {
  hope: number
  doubt: number
  clarity: number
  pride: number
  fear: number
}

export interface EvolvedOSProfile {
  id: string
  userId: string
  campaignId?: string | null
  os: ThemeId

  // Personality parameters (0-1 scale)
  confidenceLevel: number
  verbosity: number
  riskTolerance: number
  empathyLevel: number

  // Emotional bias weights (sum to 1.0)
  emotionalBias: EmotionalBias

  // DAW-specific: tempo preference (60-180 bpm)
  tempoPreference?: number

  // Historical drift
  driftHistory: Array<{
    timestamp: string
    delta: Record<string, number>
    reasoning: string
  }>

  updatedAt: string
  createdAt: string
}

export interface OSEvolutionEvent {
  id: string
  userId: string
  campaignId?: string | null
  os: ThemeId
  eventType: EvolutionEventType
  delta: Record<string, unknown>
  reasoning: string
  sourceEntityType?: string
  sourceEntityId?: string
  createdAt: string
}

export interface EvolutionState {
  profiles: EvolvedOSProfile[]
  events: OSEvolutionEvent[]
  isLoadingProfiles: boolean
  lastEvolutionEventAt: string | null
}

// ============================================================================
// OS SOCIAL GRAPH TYPES (Phase 14)
// ============================================================================

export interface OSRelationship {
  id: string
  userId: string
  campaignId?: string | null
  osA: ThemeId
  osB: ThemeId
  trust: number // -1 to 1
  synergy: number // 0 to 1
  tension: number // 0 to 1
  influenceBias: number // -1 to 1
  dataPoints: number
  updatedAt: string
  createdAt: string
}

export interface OSIdentitySnapshot {
  id: string
  userId: string
  campaignId?: string | null
  takenAt: string
  leaderOS?: ThemeId | null
  supportOS: ThemeId[]
  rebelOS: ThemeId[]
  cohesionScore: number // 0-1
  notes: Record<string, unknown>
  createdAt: string
}

export interface SocialGraphState {
  relationships: OSRelationship[]
  snapshots: OSIdentitySnapshot[]
  isLoadingSocialGraph: boolean
  lastSnapshotAt: string | null
}

export interface SocialSummary {
  leaderOS?: ThemeId
  supportOS: ThemeId[]
  rebelOS: ThemeId[]
  cohesionScore: number
}
