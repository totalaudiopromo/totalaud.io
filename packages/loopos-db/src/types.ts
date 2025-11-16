import { z } from 'zod'

// ============================================================================
// WORKSPACE TYPES
// ============================================================================

export const WorkspaceRoleSchema = z.enum(['owner', 'editor', 'viewer'])
export type WorkspaceRole = z.infer<typeof WorkspaceRoleSchema>

export interface Workspace {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
}

export interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string
  role: WorkspaceRole
  created_at: string
  updated_at: string
}

// ============================================================================
// NODE TYPES (Timeline Canvas)
// ============================================================================

export const NodeTypeSchema = z.enum([
  'idea',
  'milestone',
  'task',
  'reference',
  'insight',
  'decision',
])
export type NodeType = z.infer<typeof NodeTypeSchema>

export interface Node {
  id: string
  workspace_id: string
  user_id: string
  type: NodeType
  title: string
  content: string
  colour: string
  position_x: number
  position_y: number
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// ============================================================================
// NOTE TYPES
// ============================================================================

export interface Note {
  id: string
  workspace_id: string
  user_id: string
  node_id: string | null
  content: string
  created_at: string
  updated_at: string
}

// ============================================================================
// JOURNAL TYPES
// ============================================================================

export const JournalEntryTypeSchema = z.enum(['text', 'voice', 'reflection'])
export type JournalEntryType = z.infer<typeof JournalEntryTypeSchema>

export interface JournalEntry {
  id: string
  workspace_id: string
  user_id: string
  type: JournalEntryType
  title: string
  content: string
  voice_url: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// ============================================================================
// MOODBOARD TYPES
// ============================================================================

export interface MoodboardItem {
  id: string
  workspace_id: string
  user_id: string
  type: 'image' | 'colour' | 'text' | 'link'
  content: string
  image_url: string | null
  position_x: number
  position_y: number
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// ============================================================================
// CREATIVE PACK TYPES
// ============================================================================

export interface CreativePack {
  id: string
  workspace_id: string | null // null = global pack
  user_id: string | null
  name: string
  description: string
  category: string
  content: Record<string, unknown>
  is_public: boolean
  created_at: string
  updated_at: string
}

// ============================================================================
// PLAYBOOK TYPES
// ============================================================================

export interface PlaybookChapter {
  id: string
  workspace_id: string | null // null = global chapter
  title: string
  description: string
  content: Record<string, unknown>
  order_index: number
  is_public: boolean
  created_at: string
  updated_at: string
}

// ============================================================================
// FLOW SESSION TYPES
// ============================================================================

export const FlowSessionStatusSchema = z.enum(['active', 'paused', 'completed'])
export type FlowSessionStatus = z.infer<typeof FlowSessionStatusSchema>

export interface FlowSession {
  id: string
  workspace_id: string
  user_id: string
  name: string
  status: FlowSessionStatus
  started_at: string
  ended_at: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// ============================================================================
// AGENT EXECUTION TYPES
// ============================================================================

export const AgentExecutionStatusSchema = z.enum([
  'pending',
  'running',
  'completed',
  'failed',
])
export type AgentExecutionStatus = z.infer<typeof AgentExecutionStatusSchema>

export interface AgentExecution {
  id: string
  workspace_id: string
  user_id: string
  agent_type: string
  input: Record<string, unknown>
  output: Record<string, unknown> | null
  status: AgentExecutionStatus
  started_at: string
  ended_at: string | null
  error: string | null
  created_at: string
  updated_at: string
}

// ============================================================================
// AUTO CHAIN TYPES
// ============================================================================

export interface AutoChain {
  id: string
  workspace_id: string
  user_id: string
  name: string
  trigger: Record<string, unknown>
  actions: Record<string, unknown>[]
  is_active: boolean
  created_at: string
  updated_at: string
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export const ExportTypeSchema = z.enum([
  'pdf',
  'docx',
  'json',
  'zip',
  'presentation',
])
export type ExportType = z.infer<typeof ExportTypeSchema>

export const ExportStatusSchema = z.enum(['pending', 'processing', 'completed', 'failed'])
export type ExportStatus = z.infer<typeof ExportStatusSchema>

export interface Export {
  id: string
  workspace_id: string
  user_id: string
  type: ExportType
  name: string
  file_url: string | null
  status: ExportStatus
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}
