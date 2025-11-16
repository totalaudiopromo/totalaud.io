'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { useAuth } from './useAuth'
import {
  createDesignerChannel,
  broadcastSceneUpdated,
  broadcastSceneCreated,
  broadcastSceneDeleted,
  broadcastSceneActivated,
  shouldApplySceneEvent,
  subscribeToSceneChanges,
  type DesignerScene,
  type SceneUpdateEvent,
  type SceneCreateEvent,
  type SceneDeleteEvent,
  type SceneActivateEvent,
} from '@/lib/realtime/designer'

interface UseDesignerRealtimeOptions {
  workspaceId: string
  onSceneUpdate?: (scene: DesignerScene) => void
  onSceneCreate?: (scene: DesignerScene) => void
  onSceneDelete?: (sceneId: string) => void
  onSceneActivate?: (sceneId: string) => void
}

interface UseDesignerRealtimeReturn {
  isConnected: boolean
  broadcastUpdate: (sceneId: string, scene: DesignerScene) => Promise<void>
  broadcastCreate: (scene: DesignerScene) => Promise<void>
  broadcastDelete: (sceneId: string) => Promise<void>
  broadcastActivate: (sceneId: string) => Promise<void>
}

/**
 * Hook for real-time Designer Mode collaboration
 * Manages broadcasting and receiving AI-generated scene updates
 */
export function useDesignerRealtime(
  options: UseDesignerRealtimeOptions
): UseDesignerRealtimeReturn {
  const { user } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const broadcastChannelRef = useRef<RealtimeChannel | null>(null)
  const dbChannelRef = useRef<RealtimeChannel | null>(null)
  const sceneVersionsRef = useRef<Map<string, number>>(new Map())

  const { workspaceId, onSceneUpdate, onSceneCreate, onSceneDelete, onSceneActivate } = options

  // Initialize channels
  useEffect(() => {
    if (!user || !workspaceId) return

    const channel = createDesignerChannel(workspaceId)
    broadcastChannelRef.current = channel

    // Subscribe to broadcasts
    channel
      .on('broadcast', { event: 'scene_updated' }, ({ payload }) => {
        const event = payload as SceneUpdateEvent

        const currentVersion = sceneVersionsRef.current.get(event.sceneId) || 0
        if (!shouldApplySceneEvent(event, currentVersion, user.id)) {
          return
        }

        if (event.version) {
          sceneVersionsRef.current.set(event.sceneId, event.version)
        }

        if (onSceneUpdate && event.data) {
          const updatedScene: DesignerScene = {
            id: event.sceneId,
            workspace_id: event.workspaceId,
            user_id: event.userId,
            name: '',
            type: 'strategy',
            data: event.data.data,
            is_active: false,
            version: event.data.version,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          onSceneUpdate(updatedScene)
        }
      })
      .on('broadcast', { event: 'scene_created' }, ({ payload }) => {
        const event = payload as SceneCreateEvent

        // Ignore own creates
        if (event.userId === user.id) return

        if (onSceneCreate && event.data) {
          onSceneCreate(event.data as DesignerScene)
          if (event.version) {
            sceneVersionsRef.current.set(event.sceneId, event.version)
          }
        }
      })
      .on('broadcast', { event: 'scene_deleted' }, ({ payload }) => {
        const event = payload as SceneDeleteEvent

        // Ignore own deletes
        if (event.userId === user.id) return

        if (onSceneDelete) {
          onSceneDelete(event.sceneId)
          sceneVersionsRef.current.delete(event.sceneId)
        }
      })
      .on('broadcast', { event: 'scene_activated' }, ({ payload }) => {
        const event = payload as SceneActivateEvent

        // Ignore own activations
        if (event.userId === user.id) return

        if (onSceneActivate) {
          onSceneActivate(event.sceneId)
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        }
      })

    // Subscribe to database changes
    const dbChannel = subscribeToSceneChanges(
      workspaceId,
      (scene) => {
        if (onSceneCreate) {
          onSceneCreate(scene)
        }
        sceneVersionsRef.current.set(scene.id, scene.version)
      },
      (scene) => {
        if (onSceneUpdate) {
          onSceneUpdate(scene)
        }
        sceneVersionsRef.current.set(scene.id, scene.version)
      },
      (sceneId) => {
        if (onSceneDelete) {
          onSceneDelete(sceneId)
        }
        sceneVersionsRef.current.delete(sceneId)
      }
    )
    dbChannelRef.current = dbChannel

    // Cleanup
    return () => {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.unsubscribe()
      }
      if (dbChannelRef.current) {
        dbChannelRef.current.unsubscribe()
      }
      setIsConnected(false)
    }
  }, [user, workspaceId, onSceneUpdate, onSceneCreate, onSceneDelete, onSceneActivate])

  // Broadcast update
  const handleBroadcastUpdate = useCallback(
    async (sceneId: string, scene: DesignerScene) => {
      if (!user || !broadcastChannelRef.current) return

      await broadcastSceneUpdated(broadcastChannelRef.current, {
        sceneId,
        userId: user.id,
        workspaceId,
        version: scene.version,
        data: {
          data: scene.data,
          version: scene.version,
        },
      })
    },
    [user, workspaceId]
  )

  // Broadcast create
  const handleBroadcastCreate = useCallback(
    async (scene: DesignerScene) => {
      if (!user || !broadcastChannelRef.current) return

      await broadcastSceneCreated(broadcastChannelRef.current, {
        sceneId: scene.id,
        userId: user.id,
        workspaceId,
        version: scene.version,
        data: scene,
      })
    },
    [user, workspaceId]
  )

  // Broadcast delete
  const handleBroadcastDelete = useCallback(
    async (sceneId: string) => {
      if (!user || !broadcastChannelRef.current) return

      await broadcastSceneDeleted(broadcastChannelRef.current, {
        sceneId,
        userId: user.id,
        workspaceId,
      })
    },
    [user, workspaceId]
  )

  // Broadcast activate (user switched to viewing this scene)
  const handleBroadcastActivate = useCallback(
    async (sceneId: string) => {
      if (!user || !broadcastChannelRef.current) return

      await broadcastSceneActivated(broadcastChannelRef.current, {
        sceneId,
        userId: user.id,
        workspaceId,
      })
    },
    [user, workspaceId]
  )

  return {
    isConnected,
    broadcastUpdate: handleBroadcastUpdate,
    broadcastCreate: handleBroadcastCreate,
    broadcastDelete: handleBroadcastDelete,
    broadcastActivate: handleBroadcastActivate,
  }
}
