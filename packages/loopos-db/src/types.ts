/**
 * LoopOS Database Types
 * Generated from Supabase schema
 */

export type NodeType = 'creative' | 'promotional' | 'analysis' | 'planning' | 'custom'
export type NodeStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'archived'
export type ExportType = 'promotion' | 'analysis' | 'planning' | 'creative'
export type ExportStatus = 'pending' | 'synced' | 'failed'
export type ExecutionStatus = 'started' | 'completed' | 'failed' | 'skipped'

export interface LoopOSNode {
  id: string
  user_id: string
  title: string
  description: string | null
  node_type: NodeType
  status: NodeStatus
  depends_on: string[]
  sequence_order: number | null
  auto_start: boolean
  position_x: number
  position_y: number
  momentum_value: number
  tags: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  completed_at: string | null
  due_date: string | null
}

export interface LoopOSNote {
  id: string
  user_id: string
  title: string
  content: string
  tags: string[]
  backlinks: string[]
  linked_nodes: string[]
  ai_summary: string | null
  ai_themes: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface LoopOSMomentum {
  id: string
  user_id: string
  current_momentum: number
  max_momentum: number
  current_streak: number
  longest_streak: number
  last_action_date: string | null
  last_decay_at: string
  decay_rate: number
  total_nodes_completed: number
  total_sequences_completed: number
  created_at: string
  updated_at: string
}

export interface LoopOSExport {
  id: string
  user_id: string
  source_type: 'node' | 'note' | 'sequence' | 'daily_action'
  source_id: string | null
  export_type: ExportType
  content: string
  metadata: Record<string, any>
  suggested_date: string | null
  status: ExportStatus
  sync_error: string | null
  synced_at: string | null
  created_at: string
  updated_at: string
}

export interface LoopOSNodeExecution {
  id: string
  user_id: string
  node_id: string
  started_at: string | null
  completed_at: string | null
  duration_seconds: number | null
  status: ExecutionStatus
  notes: string | null
  momentum_gained: number
  metadata: Record<string, any>
  created_at: string
}

export interface LoopOSLoopTemplate {
  id: string
  name: string
  description: string
  category: string
  is_public: boolean
  created_by: string | null
  template_data: Record<string, any>
  use_count: number
  created_at: string
  updated_at: string
}

// Insert types (without auto-generated fields)
export type LoopOSNodeInsert = Omit<LoopOSNode, 'id' | 'created_at' | 'updated_at'>
export type LoopOSNoteInsert = Omit<LoopOSNote, 'id' | 'created_at' | 'updated_at'>
export type LoopOSMomentumInsert = Omit<LoopOSMomentum, 'id' | 'created_at' | 'updated_at'>
export type LoopOSExportInsert = Omit<LoopOSExport, 'id' | 'created_at' | 'updated_at'>
export type LoopOSNodeExecutionInsert = Omit<LoopOSNodeExecution, 'id' | 'created_at'>
export type LoopOSLoopTemplateInsert = Omit<LoopOSLoopTemplate, 'id' | 'created_at' | 'updated_at' | 'use_count'>

// Update types (all fields optional except id)
export type LoopOSNodeUpdate = Partial<Omit<LoopOSNode, 'id' | 'user_id' | 'created_at'>>
export type LoopOSNoteUpdate = Partial<Omit<LoopOSNote, 'id' | 'user_id' | 'created_at'>>
export type LoopOSMomentumUpdate = Partial<Omit<LoopOSMomentum, 'id' | 'user_id' | 'created_at'>>
export type LoopOSExportUpdate = Partial<Omit<LoopOSExport, 'id' | 'user_id' | 'created_at'>>
