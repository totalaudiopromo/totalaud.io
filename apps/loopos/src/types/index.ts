// Node Types
export type NodeType = 'create' | 'promote' | 'analyse' | 'refine'

export interface LoopNode {
  id: string
  type: NodeType
  title: string
  description?: string
  friction: number // 0-100
  priority: number // 0-100
  dependencies: string[] // Node IDs
  position: { x: number; y: number }
  timeStart?: number // Timeline position in seconds
  duration?: number // Duration in seconds
  createdAt: Date
  updatedAt: Date
}

// Momentum & Sequence
export interface MomentumState {
  current: number // 0-100
  trend: 'increasing' | 'stable' | 'decreasing'
  lastUpdated: Date
}

export interface SequenceProgress {
  phase: 'planning' | 'execution' | 'review' | 'complete'
  completedNodes: string[]
  activeNodes: string[]
  blockedNodes: string[]
}

// Agent Types
export type AgentRole = 'create' | 'promote' | 'analyse' | 'refine' | 'orchestrate'

export interface Agent {
  id: string
  name: string
  role: AgentRole
  status: 'idle' | 'thinking' | 'executing' | 'complete' | 'error'
  currentTask?: string
}

// Orchestration Types
export interface OrchestrationStep {
  id: string
  agentRole: AgentRole
  action: string
  dependsOn?: string[] // Step IDs
  status: 'pending' | 'running' | 'complete' | 'error'
  result?: unknown
}

export interface Orchestration {
  id: string
  name: string
  description: string
  steps: OrchestrationStep[]
  status: 'draft' | 'running' | 'complete' | 'error'
  createdAt: Date
  updatedAt: Date
}

// Journal Types
export interface JournalEntry {
  id: string
  date: Date
  content: string
  aiSummary?: string
  blockers?: string[]
  themes?: string[]
  momentum?: number
  linkedNodes?: string[]
  tomorrowActions?: string[]
}

// Timeline Types
export interface TimelineState {
  zoom: number // 1 = 1 second per pixel
  playheadPosition: number // Current time in seconds
  isPlaying: boolean
  loopStart: number
  loopEnd: number
  duration: number
}

// Cross-App Surface Types
export interface SurfaceDefinition {
  id: string
  name: string
  targetApp: 'console' | 'audio-intel'
  dataSchema: Record<string, unknown>
  previewData: Record<string, unknown>
}
