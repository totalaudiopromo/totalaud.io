/**
 * User Preferences Hook
 *
 * Stage 8: Studio Personalisation & Collaboration
 * Manages user-specific preferences with automatic sync to Supabase.
 * Provides optimistic updates and real-time synchronization.
 *
 * Updated to use new `user_prefs` table schema.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { getSupabaseClient } from '@/lib/supabaseClient'
import type { UserPrefs } from '@/lib/supabaseClient'

interface UseUserPrefsReturn {
  prefs: UserPrefs | null
  isLoading: boolean
  error: Error | null
  updatePrefs: (
    updates: Partial<Omit<UserPrefs, 'user_id' | 'created_at' | 'updated_at'>>
  ) => Promise<void>
  refetch: () => Promise<void>
}

/**
 * Hook to manage user preferences with Supabase sync
 *
 * Features:
 * - Auto-fetch prefs on mount
 * - Auto-create default prefs if none exist
 * - Optimistic updates (instant UI)
 * - Debounced Supabase sync (500ms)
 * - Real-time subscription for cross-device sync
 *
 * @param userId - User ID (required)
 * @returns User preferences state and update function
 */
export function useUserPrefs(userId: string | null): UseUserPrefsReturn {
  const [prefs, setPrefs] = useState<UserPrefs | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = getSupabaseClient()
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pendingUpdatesRef = useRef<Partial<UserPrefs>>({})

  // Fetch preferences from Supabase
  const fetchPrefs = useCallback(async () => {
    if (!userId) {
      setPrefs(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Try to get existing preferences
      const { data: existing, error: fetchError } = await supabase
        .from('user_prefs')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (fetchError) throw fetchError

      // Create default preferences if they don't exist
      if (!existing) {
        const defaultPrefs: Omit<UserPrefs, 'created_at' | 'updated_at'> = {
          user_id: userId,
          theme: 'operator', // Default to Operator theme (keyboard-first, fast lane)
          comfort_mode: false,
          calm_mode: false,
          sound_muted: false,
          mute_sounds: false,
          reduced_motion: false,
          show_onboarding_overlay: true,
          preferred_view: 'console',
          tone: 'balanced',
        }

        const { data: created, error: createError } = (await supabase
          .from('user_prefs')
          .insert(defaultPrefs)
          .select()
          .single()) as { data: UserPrefs | null; error: any }

        if (createError) throw createError
        setPrefs(created)
      } else {
        setPrefs(existing)
      }
    } catch (err) {
      console.error('[useUserPrefs] Error fetching preferences:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch preferences'))
    } finally {
      setIsLoading(false)
    }
  }, [userId, supabase])

  // Initial fetch
  useEffect(() => {
    fetchPrefs()
  }, [fetchPrefs])

  // Subscribe to real-time updates (for cross-device sync)
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`user-prefs:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_prefs',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Only update if the change came from another device
          // (don't overwrite our optimistic updates)
          setPrefs((current) => {
            if (!current) return payload.new as UserPrefs

            // Check if this update is from us (same updated_at)
            const isSelfUpdate = current.updated_at === (payload.new as UserPrefs).updated_at
            if (isSelfUpdate) return current

            return payload.new as UserPrefs
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  // Flush pending updates to Supabase
  const flushUpdates = useCallback(async () => {
    if (!userId || Object.keys(pendingUpdatesRef.current).length === 0) return

    try {
      const updates = { ...pendingUpdatesRef.current }
      pendingUpdatesRef.current = {}

      const { error: updateError } = (await supabase
        .from('user_prefs')
        .update(updates as Partial<Omit<UserPrefs, 'user_id' | 'created_at' | 'updated_at'>>)
        .eq('user_id', userId)) as { error: any }

      if (updateError) throw updateError
    } catch (err) {
      console.error('[useUserPrefs] Error syncing preferences:', err)
      // Revert optimistic update on error
      await fetchPrefs()
      throw err
    }
  }, [userId, supabase, fetchPrefs])

  // Update preferences (optimistic + debounced sync)
  const updatePrefs = useCallback(
    async (updates: Partial<Omit<UserPrefs, 'user_id' | 'created_at' | 'updated_at'>>) => {
      if (!prefs || !userId) return

      try {
        // Optimistic update (instant UI)
        const optimisticUpdate = {
          ...prefs,
          ...updates,
          updated_at: new Date().toISOString(),
        }
        setPrefs(optimisticUpdate)

        // Queue update for Supabase (debounced 500ms)
        pendingUpdatesRef.current = {
          ...pendingUpdatesRef.current,
          ...updates,
        }

        // Clear existing timer
        if (updateTimerRef.current) {
          clearTimeout(updateTimerRef.current)
        }

        // Set new timer
        updateTimerRef.current = setTimeout(() => {
          flushUpdates()
        }, 500)
      } catch (err) {
        console.error('[useUserPrefs] Error updating preferences:', err)
        setError(err instanceof Error ? err : new Error('Failed to update preferences'))
        throw err
      }
    },
    [prefs, userId, flushUpdates]
  )

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current)
        // Flush any pending updates immediately
        flushUpdates()
      }
    }
  }, [flushUpdates])

  return {
    prefs,
    isLoading,
    error,
    updatePrefs,
    refetch: fetchPrefs,
  }
}
