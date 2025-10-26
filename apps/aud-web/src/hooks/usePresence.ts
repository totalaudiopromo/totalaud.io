/**
 * usePresence Hook
 *
 * Stage 8: Studio Personalisation & Collaboration
 * React hook for managing realtime presence in campaigns.
 *
 * Usage:
 * ```tsx
 * const { collaborators, updatePresence, isConnected } = usePresence(
 *   campaignId,
 *   userId,
 *   { theme: 'ascii', mode: 'plan', calm_mode: false }
 * )
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  PresenceManager,
  Collaborator,
  PresenceState,
  createPresenceManager,
} from '@/lib/realtimePresence'

interface UsePresenceOptions {
  theme: 'ascii' | 'xp' | 'aqua' | 'daw' | 'analogue'
  mode: 'plan' | 'track' | 'learn'
  calm_mode: boolean
  user_email?: string
  user_name?: string
  onCollaboratorJoin?: (collaborator: Collaborator) => void
  onCollaboratorLeave?: (userId: string) => void
}

export function usePresence(
  campaignId: string | null,
  userId: string | null,
  options: UsePresenceOptions
) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const presenceManagerRef = useRef<PresenceManager | null>(null)

  // Connect to presence channel
  useEffect(() => {
    if (!campaignId || !userId) {
      setIsConnected(false)
      return
    }

    const manager = createPresenceManager(campaignId, userId)
    presenceManagerRef.current = manager

    // Setup callbacks
    manager.on('sync', (collaboratorsList) => {
      setCollaborators(collaboratorsList)
    })

    manager.on('join', (collaborator) => {
      if (options.onCollaboratorJoin) {
        options.onCollaboratorJoin(collaborator)
      }
    })

    manager.on('leave', (leftUserId) => {
      if (options.onCollaboratorLeave) {
        options.onCollaboratorLeave(leftUserId)
      }
    })

    // Connect
    manager
      .connect({
        theme: options.theme,
        mode: options.mode,
        calm_mode: options.calm_mode,
        user_email: options.user_email,
        user_name: options.user_name,
      })
      .then(() => {
        setIsConnected(true)
      })
      .catch((error) => {
        console.error('Failed to connect presence:', error)
        setIsConnected(false)
      })

    // Cleanup on unmount
    return () => {
      manager.disconnect()
      presenceManagerRef.current = null
      setIsConnected(false)
    }
  }, [campaignId, userId]) // Only reconnect if campaign or user changes

  // Update presence state (theme, mode, calm_mode changes)
  const updatePresence = useCallback(
    async (
      updates: Partial<Omit<PresenceState, 'user_id' | 'joined_at' | 'last_active'>>
    ) => {
      if (presenceManagerRef.current && isConnected) {
        await presenceManagerRef.current.updatePresence(updates)
      }
    },
    [isConnected]
  )

  // Check if global Calm Mode is active
  const isGlobalCalmModeActive = useCallback((): boolean => {
    return presenceManagerRef.current?.isGlobalCalmModeActive() || false
  }, [])

  // Get collaborators excluding current user
  const otherCollaborators = collaborators.filter((c) => c.user_id !== userId)

  return {
    collaborators,
    otherCollaborators,
    isConnected,
    updatePresence,
    isGlobalCalmModeActive,
  }
}
