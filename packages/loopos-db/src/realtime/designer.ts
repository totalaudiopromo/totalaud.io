/**
 * LoopOS Phase 8: Realtime Designer Collaboration
 * Real-time updates for AI Designer Mode scenes
 */

import { supabase } from '../client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface DesignerScene {
  id: string
  workspace_id: string
  user_id: string
  name: string
  scene_type: string
  scene_data: Record<string, any>
  locked_by: string | null
  locked_at: string | null
  created_at: string
  updated_at: string
}

export interface DesignerCallbacks {
  onCreate?: (scene: DesignerScene) => void
  onUpdate?: (scene: DesignerScene, oldScene: DesignerScene) => void
  onDelete?: (sceneId: string) => void
  onLock?: (sceneId: string, userId: string, displayName: string) => void
  onUnlock?: (sceneId: string) => void
}

export const designerDb = {
  /**
   * Create a designer scene
   */
  async createScene(
    workspaceId: string,
    userId: string,
    name: string,
    sceneType: string,
    sceneData: Record<string, any>
  ): Promise<DesignerScene> {
    const { data, error } = await supabase
      .from('loopos_designer_scenes')
      .insert({
        workspace_id: workspaceId,
        user_id: userId,
        name,
        scene_type: sceneType,
        scene_data: sceneData,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * List all scenes in a workspace
   */
  async listScenes(workspaceId: string): Promise<DesignerScene[]> {
    const { data, error } = await supabase
      .from('loopos_designer_scenes')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  /**
   * Get a single scene
   */
  async getScene(sceneId: string): Promise<DesignerScene | null> {
    const { data, error } = await supabase
      .from('loopos_designer_scenes')
      .select('*')
      .eq('id', sceneId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data
  },

  /**
   * Update scene data
   */
  async updateScene(
    sceneId: string,
    sceneData: Record<string, any>
  ): Promise<DesignerScene> {
    const { data, error } = await supabase
      .from('loopos_designer_scenes')
      .update({ scene_data: sceneData })
      .eq('id', sceneId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Delete a scene
   */
  async deleteScene(sceneId: string): Promise<void> {
    const { error } = await supabase
      .from('loopos_designer_scenes')
      .delete()
      .eq('id', sceneId)

    if (error) throw error
  },

  /**
   * Lock a scene for editing
   */
  async lockScene(sceneId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('lock_designer_scene', {
      scene_id: sceneId,
    })

    if (error) throw error
    return data as boolean
  },

  /**
   * Unlock a scene
   */
  async unlockScene(sceneId: string): Promise<void> {
    const { error } = await supabase.rpc('unlock_designer_scene', {
      scene_id: sceneId,
    })

    if (error) throw error
  },

  /**
   * Subscribe to scene changes in a workspace
   */
  subscribeToScenes(
    workspaceId: string,
    callbacks: DesignerCallbacks
  ): RealtimeChannel {
    const channel = supabase
      .channel(`workspace:${workspaceId}:designer`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'loopos_designer_scenes',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          if (callbacks.onCreate) {
            callbacks.onCreate(payload.new as DesignerScene)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'loopos_designer_scenes',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          if (callbacks.onUpdate) {
            callbacks.onUpdate(
              payload.new as DesignerScene,
              payload.old as DesignerScene
            )
          }

          // Check for lock changes
          const newScene = payload.new as DesignerScene
          const oldScene = payload.old as DesignerScene

          if (newScene.locked_by && !oldScene.locked_by && callbacks.onLock) {
            callbacks.onLock(newScene.id, newScene.locked_by, '')
          } else if (
            !newScene.locked_by &&
            oldScene.locked_by &&
            callbacks.onUnlock
          ) {
            callbacks.onUnlock(newScene.id)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'loopos_designer_scenes',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          if (callbacks.onDelete) {
            callbacks.onDelete(payload.old.id)
          }
        }
      )
      .subscribe()

    return channel
  },

  /**
   * Broadcast scene viewport changes (for collaborative viewing)
   */
  async broadcastViewport(
    channel: RealtimeChannel,
    userId: string,
    displayName: string,
    sceneId: string,
    viewport: { x: number; y: number; zoom: number }
  ): Promise<void> {
    await channel.send({
      type: 'broadcast',
      event: 'viewport_change',
      payload: {
        user_id: userId,
        display_name: displayName,
        scene_id: sceneId,
        viewport,
        timestamp: Date.now(),
      },
    })
  },

  /**
   * Subscribe to viewport changes
   */
  onViewportChange(
    channel: RealtimeChannel,
    callback: (payload: {
      user_id: string
      display_name: string
      scene_id: string
      viewport: { x: number; y: number; zoom: number }
    }) => void
  ): void {
    channel.on('broadcast', { event: 'viewport_change' }, ({ payload }) => {
      callback(payload)
    })
  },

  /**
   * Unsubscribe from designer scenes
   */
  async unsubscribe(channel: RealtimeChannel): Promise<void> {
    await channel.unsubscribe()
  },
}
