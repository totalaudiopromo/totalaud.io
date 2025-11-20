import { supabase } from './client'
import type { Workspace, WorkspaceMember, WorkspaceRole } from './types'

export const workspaceDb = {
  async create(userId: string, name: string, slug: string): Promise<Workspace> {
    const { data, error } = await supabase
      .from('loopos_workspaces')
      .insert({ name, slug })
      .select()
      .single()

    if (error) throw error

    // Add creator as owner
    await supabase.from('loopos_workspace_members').insert({
      workspace_id: data.id,
      user_id: userId,
      role: 'owner',
    })

    return data
  },

  async list(userId: string): Promise<Workspace[]> {
    const { data, error } = await supabase
      .from('loopos_workspaces')
      .select(
        `
        *,
        loopos_workspace_members!inner(user_id)
      `
      )
      .eq('loopos_workspace_members.user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async get(workspaceId: string): Promise<Workspace> {
    const { data, error } = await supabase
      .from('loopos_workspaces')
      .select('*')
      .eq('id', workspaceId)
      .single()

    if (error) throw error
    return data
  },

  async update(
    workspaceId: string,
    updates: Partial<Pick<Workspace, 'name' | 'slug'>>
  ): Promise<Workspace> {
    const { data, error } = await supabase
      .from('loopos_workspaces')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', workspaceId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(workspaceId: string): Promise<void> {
    const { error } = await supabase.from('loopos_workspaces').delete().eq('id', workspaceId)

    if (error) throw error
  },

  async addMember(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole
  ): Promise<WorkspaceMember> {
    const { data, error } = await supabase
      .from('loopos_workspace_members')
      .insert({ workspace_id: workspaceId, user_id: userId, role })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async removeMember(workspaceId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('loopos_workspace_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)

    if (error) throw error
  },

  async listMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const { data, error } = await supabase
      .from('loopos_workspace_members')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  },

  async getMemberRole(workspaceId: string, userId: string): Promise<WorkspaceRole | null> {
    const { data, error } = await supabase
      .from('loopos_workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .single()

    if (error) return null
    return data.role
  },
}
