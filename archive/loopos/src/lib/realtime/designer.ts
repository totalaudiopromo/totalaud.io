/**
 * Designer Collaboration - Real-time scene synchronisation
 * Manages collaborative editing of AI-generated visual scenes
 */

import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@total-audio/loopos-db'
import type { Scene } from '@/lib/designer/types'

export interface DesignerScene {
  id: string
  workspace_id: string
  user_id: string
  name: string
  type: string
  prompt?: string
  data: Scene
  is_active: boolean
  version: number
  created_at: string
  updated_at: string
}

export type DesignerEventType =
  | 'scene_updated'
  | 'scene_created'
  | 'scene_deleted'
  | 'scene_activated'

export interface DesignerEvent {
  type: DesignerEventType
  sceneId: string
  userId: string
  workspaceId: string
  version?: number
  timestamp: string
  data?: Partial<DesignerScene>
}

export interface SceneUpdateEvent extends DesignerEvent {
  type: 'scene_updated'
  data: {
    data: Scene
    version: number
  }
}

export interface SceneCreateEvent extends DesignerEvent {
  type: 'scene_created'
  data: DesignerScene
}

export interface SceneDeleteEvent extends DesignerEvent {
  type: 'scene_deleted'
}

export interface SceneActivateEvent extends DesignerEvent {
  type: 'scene_activated'
}

/**
 * Create a designer collaboration channel
 */
export function createDesignerChannel(workspaceId: string): RealtimeChannel {
  const channelName = `loopos:designer:workspace:${workspaceId}`

  return supabase.channel(channelName)
}

/**
 * Broadcast scene updated event
 */
export async function broadcastSceneUpdated(
  channel: RealtimeChannel,
  event: Omit<SceneUpdateEvent, 'type' | 'timestamp'>
): Promise<void> {
  await channel.send({
    type: 'broadcast',
    event: 'scene_updated',
    payload: {
      ...event,
      type: 'scene_updated',
      timestamp: new Date().toISOString(),
    },
  })
}

/**
 * Broadcast scene created event
 */
export async function broadcastSceneCreated(
  channel: RealtimeChannel,
  event: Omit<SceneCreateEvent, 'type' | 'timestamp'>
): Promise<void> {
  await channel.send({
    type: 'broadcast',
    event: 'scene_created',
    payload: {
      ...event,
      type: 'scene_created',
      timestamp: new Date().toISOString(),
    },
  })
}

/**
 * Broadcast scene deleted event
 */
export async function broadcastSceneDeleted(
  channel: RealtimeChannel,
  event: Omit<SceneDeleteEvent, 'type' | 'timestamp'>
): Promise<void> {
  await channel.send({
    type: 'broadcast',
    event: 'scene_deleted',
    payload: {
      ...event,
      type: 'scene_deleted',
      timestamp: new Date().toISOString(),
    },
  })
}

/**
 * Broadcast scene activated event (user switched to viewing this scene)
 */
export async function broadcastSceneActivated(
  channel: RealtimeChannel,
  event: Omit<SceneActivateEvent, 'type' | 'timestamp'>
): Promise<void> {
  await channel.send({
    type: 'broadcast',
    event: 'scene_activated',
    payload: {
      ...event,
      type: 'scene_activated',
      timestamp: new Date().toISOString(),
    },
  })
}

/**
 * Check if an incoming scene event should be applied
 */
export function shouldApplySceneEvent(
  event: DesignerEvent,
  currentVersion: number,
  currentUserId: string
): boolean {
  // Ignore events from self
  if (event.userId === currentUserId) {
    return false
  }

  // If no version in event, apply it
  if (!event.version) {
    return true
  }

  // Apply if event version is newer or equal
  return event.version >= currentVersion
}

/**
 * Subscribe to database changes for designer scenes
 */
export function subscribeToSceneChanges(
  workspaceId: string,
  onInsert?: (scene: DesignerScene) => void,
  onUpdate?: (scene: DesignerScene) => void,
  onDelete?: (sceneId: string) => void
): RealtimeChannel {
  return supabase
    .channel(`db:loopos_designer_scenes:workspace:${workspaceId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'loopos_designer_scenes',
        filter: `workspace_id=eq.${workspaceId}`,
      },
      (payload) => {
        if (onInsert && payload.new) {
          onInsert(payload.new as DesignerScene)
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
        if (onUpdate && payload.new) {
          onUpdate(payload.new as DesignerScene)
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
        if (onDelete && payload.old) {
          onDelete((payload.old as DesignerScene).id)
        }
      }
    )
    .subscribe()
}
