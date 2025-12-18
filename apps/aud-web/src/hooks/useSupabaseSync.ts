/**
 * Supabase Sync Hook
 *
 * Phase 10: Data Persistence
 *
 * Provides utilities for syncing Zustand stores with Supabase.
 * - Debounced sync on changes
 * - Optimistic updates
 * - Fallback to localStorage when unauthenticated
 */

'use client'

import { useEffect, useRef, useCallback } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'
import type { User } from '@supabase/supabase-js'

const log = logger.scope('SupabaseSync')

// Debounce delay for syncing (500ms)
const SYNC_DEBOUNCE_MS = 500

/**
 * Hook to get current authenticated user
 */
export function useSupabaseUser() {
  const supabase = createBrowserSupabaseClient()

  const getUser = useCallback(async (): Promise<User | null> => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  }, [supabase])

  return { supabase, getUser }
}

/**
 * Debounced sync utility
 */
export function useDebouncedSync<T>(
  syncFn: (data: T) => Promise<void>,
  delay: number = SYNC_DEBOUNCE_MS
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingDataRef = useRef<T | null>(null)

  const debouncedSync = useCallback(
    (data: T) => {
      pendingDataRef.current = data

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(async () => {
        if (pendingDataRef.current !== null) {
          try {
            await syncFn(pendingDataRef.current)
          } catch (error) {
            log.error('Sync error', error)
          }
        }
      }, delay)
    },
    [syncFn, delay]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedSync
}

/**
 * Ideas sync types
 */
export interface SyncedIdea {
  id: string
  user_id: string
  content: string
  tag: string
  position_x: number
  position_y: number
  is_starter: boolean
  created_at: string
  updated_at: string
}

/**
 * Timeline events sync types
 */
export interface SyncedTimelineEvent {
  id: string
  user_id: string
  lane: string
  title: string
  event_date: string
  colour: string
  description: string | null
  url: string | null
  tags: string[]
  source: string
  opportunity_id: string | null
  tracker_campaign_id: string | null
  tracker_synced_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Pitch draft sync types
 */
export interface SyncedPitchDraft {
  id: string
  user_id: string
  name: string
  pitch_type: string
  sections: Array<{
    id: string
    title: string
    content: string
    placeholder: string
  }>
  created_at: string
  updated_at: string
}

/**
 * Workspace preferences sync types
 */
export interface SyncedWorkspacePreferences {
  id: string
  user_id: string
  ideas_view_mode: string
  ideas_sort_mode: string
  ideas_has_seen_starters: boolean
  last_active_mode: string
  created_at: string
  updated_at: string
}
