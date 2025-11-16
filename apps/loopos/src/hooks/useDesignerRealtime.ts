'use client'

import { useEffect, useState, useCallback } from 'react'
import { designerDb, type DesignerScene } from '@total-audio/loopos-db'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { toast } from 'sonner'

export interface SceneLock {
  scene_id: string
  user_id: string
  display_name: string
}

export interface SceneViewport {
  scene_id: string
  user_id: string
  display_name: string
  viewport: { x: number; y: number; zoom: number }
}

export function useDesignerRealtime(
  workspaceId: string | null,
  userId: string | null,
  onSceneChange?: {
    onCreate?: (scene: DesignerScene) => void
    onUpdate?: (scene: DesignerScene, oldScene: DesignerScene) => void
    onDelete?: (sceneId: string) => void
  }
) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const [locks, setLocks] = useState<Map<string, SceneLock>>(new Map())
  const [viewports, setViewports] = useState<Map<string, SceneViewport>>(
    new Map()
  )

  // Subscribe to scene changes
  useEffect(() => {
    if (!workspaceId) return

    const designerChannel = designerDb.subscribeToScenes(workspaceId, {
      onCreate: (scene) => {
        if (onSceneChange?.onCreate) {
          onSceneChange.onCreate(scene)
        }
        if (scene.user_id !== userId) {
          toast.info('New scene created', {
            description: scene.name,
          })
        }
      },
      onUpdate: (scene, oldScene) => {
        if (onSceneChange?.onUpdate) {
          onSceneChange.onUpdate(scene, oldScene)
        }
      },
      onDelete: (sceneId) => {
        if (onSceneChange?.onDelete) {
          onSceneChange.onDelete(sceneId)
        }
        // Clear locks and viewports for deleted scene
        setLocks((prev) => {
          const next = new Map(prev)
          next.delete(sceneId)
          return next
        })
        setViewports((prev) => {
          const next = new Map(prev)
          Array.from(next.entries()).forEach(([key, value]) => {
            if (value.scene_id === sceneId) {
              next.delete(key)
            }
          })
          return next
        })
      },
      onLock: (sceneId, lockUserId, displayName) => {
        if (lockUserId === userId) return
        setLocks((prev) => {
          const next = new Map(prev)
          next.set(sceneId, {
            scene_id: sceneId,
            user_id: lockUserId,
            display_name: displayName,
          })
          return next
        })
        toast.warning(`${displayName} is editing this scene`)
      },
      onUnlock: (sceneId) => {
        setLocks((prev) => {
          const next = new Map(prev)
          next.delete(sceneId)
          return next
        })
      },
    })

    // Subscribe to viewport changes
    designerDb.onViewportChange(designerChannel, (payload) => {
      if (payload.user_id === userId) return
      setViewports((prev) => {
        const next = new Map(prev)
        next.set(payload.user_id, {
          scene_id: payload.scene_id,
          user_id: payload.user_id,
          display_name: payload.display_name,
          viewport: payload.viewport,
        })
        return next
      })
    })

    setChannel(designerChannel)

    return () => {
      designerDb.unsubscribe(designerChannel)
    }
  }, [workspaceId, userId, onSceneChange])

  // Lock a scene for editing
  const lockScene = useCallback(
    async (sceneId: string): Promise<boolean> => {
      try {
        const success = await designerDb.lockScene(sceneId)
        if (!success) {
          toast.error('Scene is locked by another user')
        }
        return success
      } catch (error) {
        console.error('Failed to lock scene:', error)
        toast.error('Failed to lock scene')
        return false
      }
    },
    []
  )

  // Unlock a scene
  const unlockScene = useCallback(async (sceneId: string): Promise<void> => {
    try {
      await designerDb.unlockScene(sceneId)
    } catch (error) {
      console.error('Failed to unlock scene:', error)
    }
  }, [])

  // Broadcast viewport position
  const broadcastViewport = useCallback(
    async (
      sceneId: string,
      displayName: string,
      viewport: { x: number; y: number; zoom: number }
    ) => {
      if (!channel || !userId) return
      await designerDb.broadcastViewport(
        channel,
        userId,
        displayName,
        sceneId,
        viewport
      )
    },
    [channel, userId]
  )

  // Check if a scene is locked
  const isLocked = useCallback(
    (sceneId: string): boolean => {
      const lock = locks.get(sceneId)
      return lock !== undefined && lock.user_id !== userId
    },
    [locks, userId]
  )

  // Get lock info for a scene
  const getLock = useCallback(
    (sceneId: string): SceneLock | null => {
      return locks.get(sceneId) || null
    },
    [locks]
  )

  // Get viewports for a scene
  const getViewportsForScene = useCallback(
    (sceneId: string): SceneViewport[] => {
      return Array.from(viewports.values()).filter(
        (v) => v.scene_id === sceneId
      )
    },
    [viewports]
  )

  return {
    lockScene,
    unlockScene,
    broadcastViewport,
    isLocked,
    getLock,
    getViewportsForScene,
    allViewports: Array.from(viewports.values()),
  }
}
