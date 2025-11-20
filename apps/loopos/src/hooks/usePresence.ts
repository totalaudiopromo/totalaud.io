'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { useAuth } from './useAuth'
import {
  createPresenceChannel,
  trackPresence,
  updatePresence,
  leavePresence,
  getPresenceParticipants,
  type PresenceState,
  type PresenceUpdate,
  type PresenceParticipant,
  type PresenceLocation,
} from '@/lib/realtime/presence'

interface UsePresenceOptions {
  workspaceId: string
  location: PresenceLocation
  initialFocusNodeId?: string | null
  initialFocusSceneId?: string | null
}

interface UsePresenceReturn {
  participants: PresenceParticipant[]
  isConnected: boolean
  updatePresence: (updates: PresenceUpdate) => Promise<void>
  participantCount: number
  lastUpdated: string | null
}

/**
 * Hook for managing workspace presence
 * Automatically tracks user presence and provides participant list
 */
export function usePresence(options: UsePresenceOptions): UsePresenceReturn {
  const { user } = useAuth()
  const [participants, setParticipants] = useState<PresenceParticipant[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  const { workspaceId, location, initialFocusNodeId, initialFocusSceneId } = options

  // Get user display name and colour from profile
  const getUserDisplayName = useCallback(() => {
    // TODO: Fetch from loopos_user_profiles table
    // For now, use email or fallback
    return user?.email?.split('@')[0] || 'Anonymous'
  }, [user])

  const getUserColour = useCallback(() => {
    // TODO: Fetch from loopos_user_profiles table
    // For now, use default Slate Cyan
    return '#3AA9BE'
  }, [])

  // Initialize presence tracking
  useEffect(() => {
    if (!user || !workspaceId) return

    const channel = createPresenceChannel(workspaceId)
    channelRef.current = channel

    const initialState: PresenceState = {
      userId: user.id,
      displayName: getUserDisplayName(),
      colour: getUserColour(),
      location,
      focusNodeId: initialFocusNodeId || null,
      focusSceneId: initialFocusSceneId || null,
      lastActiveAt: new Date().toISOString(),
    }

    // Subscribe to presence changes
    channel
      .on('presence', { event: 'sync' }, () => {
        const current = getPresenceParticipants(channel)
        setParticipants(current)
        setLastUpdated(new Date().toISOString())
      })
      .on('presence', { event: 'join' }, () => {
        const current = getPresenceParticipants(channel)
        setParticipants(current)
        setLastUpdated(new Date().toISOString())
      })
      .on('presence', { event: 'leave' }, () => {
        const current = getPresenceParticipants(channel)
        setParticipants(current)
        setLastUpdated(new Date().toISOString())
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          await trackPresence(channel, initialState)
        }
      })

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        leavePresence(channelRef.current)
        setIsConnected(false)
      }
    }
  }, [
    user,
    workspaceId,
    location,
    initialFocusNodeId,
    initialFocusSceneId,
    getUserDisplayName,
    getUserColour,
  ])

  // Update presence function
  const handleUpdatePresence = useCallback(async (updates: PresenceUpdate) => {
    if (!channelRef.current) return

    try {
      await updatePresence(channelRef.current, updates)
    } catch (error) {
      console.error('Failed to update presence:', error)
    }
  }, [])

  return {
    participants,
    isConnected,
    updatePresence: handleUpdatePresence,
    participantCount: participants.length,
    lastUpdated,
  }
}
