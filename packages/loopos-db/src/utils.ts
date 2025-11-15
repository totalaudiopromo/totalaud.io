/**
 * LoopOS Database Utilities
 * Helper functions for common database operations
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  LoopOSNode,
  LoopOSNodeInsert,
  LoopOSNodeUpdate,
  LoopOSNote,
  LoopOSNoteInsert,
  LoopOSNoteUpdate,
  LoopOSMomentum,
  LoopOSMomentumInsert,
  LoopOSMomentumUpdate,
  LoopOSExport,
  LoopOSExportInsert,
  LoopOSNodeExecution,
  LoopOSNodeExecutionInsert,
} from './types'

export class LoopOSDatabase {
  constructor(private supabase: SupabaseClient) {}

  // ============================================================
  // NODES
  // ============================================================
  async getNodes(userId: string): Promise<LoopOSNode[]> {
    const { data, error } = await this.supabase
      .from('loopos_nodes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as LoopOSNode[]
  }

  async getNode(id: string): Promise<LoopOSNode | null> {
    const { data, error } = await this.supabase
      .from('loopos_nodes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as LoopOSNode
  }

  async createNode(node: LoopOSNodeInsert): Promise<LoopOSNode> {
    const { data, error } = await this.supabase
      .from('loopos_nodes')
      .insert(node)
      .select()
      .single()

    if (error) throw error
    return data as LoopOSNode
  }

  async updateNode(id: string, updates: LoopOSNodeUpdate): Promise<LoopOSNode> {
    const { data, error } = await this.supabase
      .from('loopos_nodes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as LoopOSNode
  }

  async deleteNode(id: string): Promise<void> {
    const { error } = await this.supabase.from('loopos_nodes').delete().eq('id', id)

    if (error) throw error
  }

  async getNodesByStatus(userId: string, status: string): Promise<LoopOSNode[]> {
    const { data, error } = await this.supabase
      .from('loopos_nodes')
      .select('*')
      .eq('user_id', userId)
      .eq('status', status)
      .order('sequence_order', { ascending: true, nullsFirst: false })

    if (error) throw error
    return data as LoopOSNode[]
  }

  async getNodeDependencies(nodeId: string): Promise<LoopOSNode[]> {
    const node = await this.getNode(nodeId)
    if (!node || node.depends_on.length === 0) return []

    const { data, error } = await this.supabase
      .from('loopos_nodes')
      .select('*')
      .in('id', node.depends_on)

    if (error) throw error
    return data as LoopOSNode[]
  }

  // ============================================================
  // NOTES
  // ============================================================
  async getNotes(userId: string): Promise<LoopOSNote[]> {
    const { data, error } = await this.supabase
      .from('loopos_notes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data as LoopOSNote[]
  }

  async getNote(id: string): Promise<LoopOSNote | null> {
    const { data, error } = await this.supabase
      .from('loopos_notes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as LoopOSNote
  }

  async createNote(note: LoopOSNoteInsert): Promise<LoopOSNote> {
    const { data, error } = await this.supabase
      .from('loopos_notes')
      .insert(note)
      .select()
      .single()

    if (error) throw error
    return data as LoopOSNote
  }

  async updateNote(id: string, updates: LoopOSNoteUpdate): Promise<LoopOSNote> {
    const { data, error } = await this.supabase
      .from('loopos_notes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as LoopOSNote
  }

  async deleteNote(id: string): Promise<void> {
    const { error } = await this.supabase.from('loopos_notes').delete().eq('id', id)

    if (error) throw error
  }

  async searchNotes(userId: string, query: string): Promise<LoopOSNote[]> {
    const { data, error } = await this.supabase
      .from('loopos_notes')
      .select('*')
      .eq('user_id', userId)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)

    if (error) throw error
    return data as LoopOSNote[]
  }

  // ============================================================
  // MOMENTUM
  // ============================================================
  async getMomentum(userId: string): Promise<LoopOSMomentum | null> {
    const { data, error } = await this.supabase
      .from('loopos_momentum')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as LoopOSMomentum | null
  }

  async createMomentum(momentum: LoopOSMomentumInsert): Promise<LoopOSMomentum> {
    const { data, error } = await this.supabase
      .from('loopos_momentum')
      .insert(momentum)
      .select()
      .single()

    if (error) throw error
    return data as LoopOSMomentum
  }

  async updateMomentum(userId: string, updates: LoopOSMomentumUpdate): Promise<LoopOSMomentum> {
    const { data, error } = await this.supabase
      .from('loopos_momentum')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data as LoopOSMomentum
  }

  // ============================================================
  // EXPORTS
  // ============================================================
  async getExports(userId: string): Promise<LoopOSExport[]> {
    const { data, error } = await this.supabase
      .from('loopos_exports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as LoopOSExport[]
  }

  async createExport(exportData: LoopOSExportInsert): Promise<LoopOSExport> {
    const { data, error } = await this.supabase
      .from('loopos_exports')
      .insert(exportData)
      .select()
      .single()

    if (error) throw error
    return data as LoopOSExport
  }

  // ============================================================
  // NODE EXECUTIONS
  // ============================================================
  async getNodeExecutions(nodeId: string): Promise<LoopOSNodeExecution[]> {
    const { data, error } = await this.supabase
      .from('loopos_node_executions')
      .select('*')
      .eq('node_id', nodeId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as LoopOSNodeExecution[]
  }

  async createNodeExecution(execution: LoopOSNodeExecutionInsert): Promise<LoopOSNodeExecution> {
    const { data, error } = await this.supabase
      .from('loopos_node_executions')
      .insert(execution)
      .select()
      .single()

    if (error) throw error
    return data as LoopOSNodeExecution
  }
}

/**
 * Create a new LoopOS database client
 */
export function createLoopOSDatabase(supabase: SupabaseClient): LoopOSDatabase {
  return new LoopOSDatabase(supabase)
}
