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

export interface MixtapeData {
  campaign: CampaignMeta
  timeline: TimelineState
  cards?: AnalogueCard[]
  exportedAt: Date
  exportConfig: MixtapeExportConfig
}
