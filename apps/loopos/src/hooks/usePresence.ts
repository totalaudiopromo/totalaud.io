'use client'

import { useEffect, useState, useCallback } from 'react'
import { presenceDb, type PresenceState, type UserProfile } from '@total-audio/loopos-db'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { toast } from 'sonner'

export function usePresence(workspaceId: string | null, userId: string | null) {
  const [participants, setParticipants] = useState<PresenceState[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user profile
  useEffect(() => {
    if (!userId) return

    const loadProfile = async () => {
      try {
        let userProfile = await presenceDb.getProfile(userId)

        if (!userProfile) {
          // Create profile if it doesn't exist
          const { data: userData } = await presenceDb.supabase.auth.getUser()
          const displayName = userData?.user?.email?.split('@')[0] || 'Anonymous'
          userProfile = await presenceDb.createProfile(userId, displayName)
        }

        setProfile(userProfile)
      } catch (error) {
        console.error('Failed to load profile:', error)
        toast.error('Failed to load user profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [userId])

  // Subscribe to workspace presence
  useEffect(() => {
    if (!workspaceId || !userId || !profile) return

    const presenceChannel = presenceDb.subscribeToWorkspace(
      workspaceId,
      userId,
      {
        display_name: profile.display_name,
        colour: profile.colour,
      },
      {
        onJoin: (state) => {
          setParticipants((prev) => {
            const exists = prev.find((p) => p.user_id === state.user_id)
            if (exists) return prev
            return [...prev, state]
          })
        },
        onLeave: (state) => {
          setParticipants((prev) =>
            prev.filter((p) => p.user_id !== state.user_id)
          )
        },
        onUpdate: (state) => {
          setParticipants((prev) => {
            const index = prev.findIndex((p) => p.user_id === state.user_id)
            if (index === -1) return [...prev, state]
            const next = [...prev]
            next[index] = state
            return next
          })
        },
      }
    )

    setChannel(presenceChannel)

    // Update status to online
    presenceDb.updateStatus('online')

    return () => {
      presenceDb.updateStatus('offline')
      presenceDb.unsubscribe(presenceChannel)
    }
  }, [workspaceId, userId, profile])

  // Update cursor position
  const updateCursor = useCallback(
    async (x: number, y: number) => {
      if (!channel) return
      await presenceDb.updateCursor(channel, x, y)
    },
    [channel]
  )

  // Update current page
  const updatePage = useCallback(
    async (page: string) => {
      if (!channel) return
      await presenceDb.updatePage(channel, page)
    },
    [channel]
  )

  return {
    participants,
    profile,
    loading,
    updateCursor,
    updatePage,
  }
}
