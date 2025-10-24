/**
 * User Preferences Hook
 *
 * Manages user-specific UI preferences with automatic sync to Supabase.
 * Provides optimistic updates and real-time synchronization.
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@aud-web/lib/supabase'

export interface UserPreferences {
  id: string
  user_id: string
  show_onboarding_overlay: boolean
  onboarding_completed_at: string | null
  preferred_view: 'flow' | 'dashboard'
  demo_mode: boolean
  auto_sync_enabled: boolean
  reduced_motion: boolean
  mute_sounds: boolean
  preferred_theme: 'ascii' | 'xp' | 'aqua' | 'daw' | 'analogue' | 'ableton' | 'punk'
  created_at: string
  updated_at: string
}

interface UseUserPrefsReturn {
  prefs: UserPreferences | null
  loading: boolean
  error: Error | null
  updatePrefs: (updates: Partial<UserPreferences>) => Promise<void>
  dismissOnboarding: () => Promise<void>
  toggleView: () => Promise<void>
  toggleDemoMode: () => Promise<void>
  toggleReducedMotion: () => Promise<void>
  toggleMuteSounds: () => Promise<void>
}

/**
 * Hook to manage user preferences
 *
 * @param userId - User ID (optional, will use authenticated user if not provided)
 * @returns User preferences and update functions
 */
export function useUserPrefs(userId?: string): UseUserPrefsReturn {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch or create user preferences
  const fetchPrefs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Get authenticated user if no userId provided
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const uid = userId || user?.id

      // If no user, use localStorage fallback for demo mode
      if (!uid) {
        const localPrefs = localStorage.getItem('userPrefs')
        if (localPrefs) {
          setPrefs(JSON.parse(localPrefs))
        } else {
          const defaultPrefs: UserPreferences = {
            id: 'local',
            user_id: 'local',
            show_onboarding_overlay: true,
            onboarding_completed_at: null,
            preferred_view: 'flow',
            demo_mode: true,
            auto_sync_enabled: false,
            reduced_motion: false,
            mute_sounds: false,
            preferred_theme: 'ascii',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          localStorage.setItem('userPrefs', JSON.stringify(defaultPrefs))
          setPrefs(defaultPrefs)
        }
        setLoading(false)
        return
      }

      // Try to get existing preferences
      const { data: existing, error: fetchError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle()

      if (fetchError) throw fetchError

      // Create default preferences if they don't exist
      if (!existing) {
        const { data: created, error: createError } = await supabase
          .from('user_preferences')
          .insert({
            user_id: uid,
            show_onboarding_overlay: true,
            preferred_view: 'flow',
            demo_mode: false,
            auto_sync_enabled: true,
            reduced_motion: false,
            mute_sounds: false,
            preferred_theme: 'ascii',
          })
          .select()
          .single()

        if (createError) throw createError
        setPrefs(created)
      } else {
        setPrefs(existing)
      }
    } catch (err) {
      console.error('[useUserPrefs] Error fetching preferences:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch preferences'))
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Initial fetch
  useEffect(() => {
    fetchPrefs()
  }, [fetchPrefs])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!prefs?.user_id) return

    const channel = supabase
      .channel(`user-prefs-${prefs.user_id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_preferences',
          filter: `user_id=eq.${prefs.user_id}`,
        },
        (payload) => {
          setPrefs(payload.new as UserPreferences)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [prefs?.user_id])

  // Update preferences
  const updatePrefs = useCallback(
    async (updates: Partial<UserPreferences>) => {
      if (!prefs) return

      try {
        // Optimistic update
        const updated = { ...prefs, ...updates, updated_at: new Date().toISOString() }
        setPrefs(updated)

        // If demo mode (no auth), save to localStorage
        if (prefs.user_id === 'local' || prefs.demo_mode) {
          localStorage.setItem('userPrefs', JSON.stringify(updated))
          return
        }

        const { error: updateError } = await supabase
          .from('user_preferences')
          .update(updates)
          .eq('user_id', prefs.user_id)

        if (updateError) throw updateError
      } catch (err) {
        console.error('[useUserPrefs] Error updating preferences:', err)
        // Revert optimistic update on error
        await fetchPrefs()
        throw err
      }
    },
    [prefs, fetchPrefs]
  )

  // Dismiss onboarding overlay
  const dismissOnboarding = useCallback(async () => {
    await updatePrefs({
      show_onboarding_overlay: false,
      onboarding_completed_at: new Date().toISOString(),
    })
  }, [updatePrefs])

  // Toggle between flow and dashboard view
  const toggleView = useCallback(async () => {
    if (!prefs) return
    await updatePrefs({
      preferred_view: prefs.preferred_view === 'flow' ? 'dashboard' : 'flow',
    })
  }, [prefs, updatePrefs])

  // Toggle demo mode
  const toggleDemoMode = useCallback(async () => {
    if (!prefs) return
    await updatePrefs({ demo_mode: !prefs.demo_mode })
  }, [prefs, updatePrefs])

  // Toggle reduced motion
  const toggleReducedMotion = useCallback(async () => {
    if (!prefs) return
    await updatePrefs({ reduced_motion: !prefs.reduced_motion })
  }, [prefs, updatePrefs])

  // Toggle mute sounds
  const toggleMuteSounds = useCallback(async () => {
    if (!prefs) return
    await updatePrefs({ mute_sounds: !prefs.mute_sounds })
  }, [prefs, updatePrefs])

  return {
    prefs,
    loading,
    error,
    updatePrefs,
    dismissOnboarding,
    toggleView,
    toggleDemoMode,
    toggleReducedMotion,
    toggleMuteSounds,
  }
}
