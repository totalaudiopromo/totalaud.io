import { supabase } from './client'

export interface DesignerScene {
  id: string
  workspace_id: string
  user_id: string
  name: string
  type: string
  prompt?: string | null
  data: Record<string, unknown>
  is_active: boolean
  version: number
  created_at: string
  updated_at: string
}

/**
 * Get all scenes for a workspace
 */
export async function list(workspaceId: string): Promise<DesignerScene[]> {
  const { data, error } = await supabase
    .from('loopos_designer_scenes')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get a single scene by ID
 */
export async function get(sceneId: string): Promise<DesignerScene | null> {
  const { data, error } = await supabase
    .from('loopos_designer_scenes')
    .select('*')
    .eq('id', sceneId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }

  return data
}

/**
 * Get the currently active scene for a workspace
 */
export async function getActive(workspaceId: string): Promise<DesignerScene | null> {
  const { data, error } = await supabase
    .from('loopos_designer_scenes')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('is_active', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }

  return data
}

/**
 * Create a new designer scene
 */
export async function create(
  workspaceId: string,
  userId: string,
  scene: {
    name: string
    type: string
    prompt?: string
    data: Record<string, unknown>
  }
): Promise<DesignerScene> {
  const { data, error } = await supabase
    .from('loopos_designer_scenes')
    .insert({
      workspace_id: workspaceId,
      user_id: userId,
      name: scene.name,
      type: scene.type,
      prompt: scene.prompt || null,
      data: scene.data,
      is_active: false,
      version: 1,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update an existing scene
 */
export async function update(
  sceneId: string,
  updates: Partial<Pick<DesignerScene, 'name' | 'type' | 'prompt' | 'data' | 'is_active'>>
): Promise<DesignerScene> {
  const { data, error } = await supabase
    .from('loopos_designer_scenes')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sceneId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Set a scene as active (deactivates all other scenes in the workspace)
 */
export async function setActive(sceneId: string, workspaceId: string): Promise<DesignerScene> {
  // First, deactivate all scenes in the workspace
  await supabase
    .from('loopos_designer_scenes')
    .update({ is_active: false })
    .eq('workspace_id', workspaceId)

  // Then activate the target scene
  const { data, error } = await supabase
    .from('loopos_designer_scenes')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('id', sceneId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a scene
 */
export async function remove(sceneId: string): Promise<void> {
  const { error } = await supabase.from('loopos_designer_scenes').delete().eq('id', sceneId)

  if (error) throw error
}

/**
 * Get scenes by type
 */
export async function listByType(workspaceId: string, type: string): Promise<DesignerScene[]> {
  const { data, error } = await supabase
    .from('loopos_designer_scenes')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('type', type)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get recent scenes (limit to last N)
 */
export async function listRecent(
  workspaceId: string,
  limit: number = 10
): Promise<DesignerScene[]> {
  const { data, error } = await supabase
    .from('loopos_designer_scenes')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}
