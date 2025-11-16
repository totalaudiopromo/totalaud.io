import { supabase } from './client'
import type { Node, NodeType, Note } from './types'

export const nodesDb = {
  async create(
    workspaceId: string,
    userId: string,
    data: {
      type: NodeType
      title: string
      content: string
      colour: string
      position_x: number
      position_y: number
      metadata?: Record<string, unknown>
    }
  ): Promise<Node> {
    const { data: node, error } = await supabase
      .from('loopos_nodes')
      .insert({
        workspace_id: workspaceId,
        user_id: userId,
        ...data,
      })
      .select()
      .single()

    if (error) throw error
    return node
  },

  async list(workspaceId: string): Promise<Node[]> {
    const { data, error } = await supabase
      .from('loopos_nodes')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async get(nodeId: string): Promise<Node> {
    const { data, error } = await supabase
      .from('loopos_nodes')
      .select('*')
      .eq('id', nodeId)
      .single()

    if (error) throw error
    return data
  },

  async update(
    nodeId: string,
    updates: Partial<Omit<Node, 'id' | 'workspace_id' | 'user_id' | 'created_at'>>
  ): Promise<Node> {
    const { data, error } = await supabase
      .from('loopos_nodes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', nodeId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(nodeId: string): Promise<void> {
    const { error } = await supabase.from('loopos_nodes').delete().eq('id', nodeId)

    if (error) throw error
  },
}

export const notesDb = {
  async create(
    workspaceId: string,
    userId: string,
    data: {
      node_id?: string
      content: string
    }
  ): Promise<Note> {
    const { data: note, error } = await supabase
      .from('loopos_notes')
      .insert({
        workspace_id: workspaceId,
        user_id: userId,
        ...data,
      })
      .select()
      .single()

    if (error) throw error
    return note
  },

  async list(workspaceId: string, nodeId?: string): Promise<Note[]> {
    let query = supabase
      .from('loopos_notes')
      .select('*')
      .eq('workspace_id', workspaceId)

    if (nodeId) {
      query = query.eq('node_id', nodeId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async update(noteId: string, content: string): Promise<Note> {
    const { data, error } = await supabase
      .from('loopos_notes')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', noteId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(noteId: string): Promise<void> {
    const { error } = await supabase.from('loopos_notes').delete().eq('id', noteId)

    if (error) throw error
  },
}
