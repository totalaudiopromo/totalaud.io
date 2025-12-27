/**
 * Workspace Preferences Hook
 *
 * Syncs user preferences (view mode, sort mode, etc.) to Supabase.
 * Falls back to localStorage for unauthenticated users.
 *
 * Used by Ideas store to persist preferences across devices.
 */

'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useAuth } from './useAuth'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { useIdeasStore, type ViewMode, type SortMode } from '@/stores/useIdeasStore'
import { logger } from '@/lib/logger'

const log = logger.scope('Workspace Preferences')

interface WorkspacePreferences {
  ideas_view_mode: ViewMode
  ideas_sort_mode: SortMode
  ideas_has_seen_starters: boolean
  last_active_mode: 'ideas' | 'scout' | 'timeline' | 'pitch'
}

/**
 * Hook to sync workspace preferences to Supabase
 */
export function useWorkspacePreferences() {
  const { isAuthenticated, user } = useAuth()
  const hasSyncedRef = useRef(false)

  // Get store state and actions
  const viewMode = useIdeasStore((state) => state.viewMode)
  const sortMode = useIdeasStore((state) => state.sortMode)
  const hasSeenStarters = useIdeasStore((state) => state.hasSeenStarters)
  const setViewMode = useIdeasStore((state) => state.setViewMode)
  const setSortMode = useIdeasStore((state) => state.setSortMode)

  // Load preferences from Supabase on auth
  useEffect(() => {
    if (!isAuthenticated || !user || hasSyncedRef.current) return

    const loadPreferences = async () => {
      try {
        const supabase = createBrowserSupabaseClient()

        const { data, error } = await supabase
          .from('user_workspace_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          // PGRST116 = no rows found, which is fine
          log.error('Failed to load preferences', error)
          return
        }

        if (data) {
          // Apply preferences to store (only if different)
          if (data.ideas_view_mode && data.ideas_view_mode !== viewMode) {
            setViewMode(data.ideas_view_mode as ViewMode)
          }
          if (data.ideas_sort_mode && data.ideas_sort_mode !== sortMode) {
            setSortMode(data.ideas_sort_mode as SortMode)
          }
          log.debug('Loaded preferences from Supabase', {
            viewMode: data.ideas_view_mode,
            sortMode: data.ideas_sort_mode,
          })
        }

        hasSyncedRef.current = true
      } catch (error) {
        log.error('Error loading preferences', error)
      }
    }

    loadPreferences()
  }, [isAuthenticated, user, viewMode, sortMode, setViewMode, setSortMode])

  // Save preferences to Supabase when they change
  const savePreferences = useCallback(
    async (updates: Partial<WorkspacePreferences>) => {
      if (!isAuthenticated || !user) return

      try {
        const supabase = createBrowserSupabaseClient()

        // Use upsert to handle both insert and update
        const { error } = await supabase.from('user_workspace_preferences').upsert(
          {
            user_id: user.id,
            ...updates,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )

        if (error) {
          log.error('Failed to save preferences', error)
        } else {
          log.debug('Saved preferences', updates)
        }
      } catch (error) {
        log.error('Error saving preferences', error)
      }
    },
    [isAuthenticated, user]
  )

  // Subscribe to store changes and sync
  useEffect(() => {
    if (!isAuthenticated || !user) return

    // Debounce saves to avoid too many API calls
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const unsubscribe = useIdeasStore.subscribe((state) => {
      // Clear any pending save
      if (timeoutId) clearTimeout(timeoutId)

      // Debounce the save
      timeoutId = setTimeout(() => {
        savePreferences({
          ideas_view_mode: state.viewMode,
          ideas_sort_mode: state.sortMode,
          ideas_has_seen_starters: state.hasSeenStarters,
        })
      }, 1000) // Wait 1 second after last change
    })

    return () => {
      unsubscribe()
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isAuthenticated, user, savePreferences])

  return {
    savePreferences,
    isAuthenticated,
  }
}
