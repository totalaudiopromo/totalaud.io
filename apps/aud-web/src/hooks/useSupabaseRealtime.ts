/**
 * Supabase Realtime Hook
 *
 * Provides real-time subscriptions for multi-device synchronisation.
 * Handles connection lifecycle, reconnection, and event callbacks.
 *
 * @example
 * ```tsx
 * // Subscribe to idea changes
 * useSupabaseRealtime({
 *   table: 'user_ideas',
 *   userId,
 *   onInsert: (idea) => addIdeaLocally(idea),
 *   onUpdate: (idea) => updateIdeaLocally(idea),
 *   onDelete: (id) => removeIdeaLocally(id),
 * })
 * ```
 */

import { useEffect, useRef, useCallback } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'
import type { RealtimeChannel } from '@supabase/supabase-js'

// Realtime payload type (simplified for flexibility)
interface RealtimePayload<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: T | null
  old: T | null
}

const log = logger.scope('Realtime')

// Supported tables for realtime subscriptions
export type RealtimeTable =
  | 'user_ideas'
  | 'user_timeline_events'
  | 'signal_threads'
  | 'artist_identities'
  | 'user_pitch_sessions'

export interface RealtimeConfig<T> {
  /** Table to subscribe to */
  table: RealtimeTable
  /** User ID to filter events (required for RLS) */
  userId: string | null | undefined
  /** Called when a new row is inserted */
  onInsert?: (record: T) => void
  /** Called when a row is updated */
  onUpdate?: (record: T) => void
  /** Called when a row is deleted */
  onDelete?: (oldRecord: T) => void
  /** Enable debug logging */
  debug?: boolean
  /** Disable the subscription (for conditional use) */
  disabled?: boolean
}

export interface RealtimeStatus {
  /** Whether the subscription is connected */
  isConnected: boolean
  /** Connection error if any */
  error: string | null
  /** Last event received timestamp */
  lastEventAt: string | null
}

/**
 * Hook for real-time Supabase subscriptions
 *
 * Automatically handles:
 * - Connection lifecycle (subscribe on mount, unsubscribe on unmount)
 * - Reconnection on network changes
 * - User ID filtering for RLS
 * - Duplicate event prevention
 */
export function useSupabaseRealtime<T>(config: RealtimeConfig<T>): RealtimeStatus {
  const { table, userId, onInsert, onUpdate, onDelete, debug = false, disabled = false } = config

  const channelRef = useRef<RealtimeChannel | null>(null)
  const statusRef = useRef<RealtimeStatus>({
    isConnected: false,
    error: null,
    lastEventAt: null,
  })

  // Track processed event IDs to prevent duplicates
  const processedEventsRef = useRef<Set<string>>(new Set())

  const handlePayload = useCallback(
    (payload: RealtimePayload<T>) => {
      // Generate unique event ID for deduplication
      const eventId = `${payload.eventType}-${JSON.stringify(payload.new || payload.old)}`

      // Skip if already processed (prevents duplicate handling)
      if (processedEventsRef.current.has(eventId)) {
        if (debug) log.debug('Skipping duplicate event', { eventId })
        return
      }

      // Add to processed set (auto-cleanup after 5 seconds)
      processedEventsRef.current.add(eventId)
      setTimeout(() => processedEventsRef.current.delete(eventId), 5000)

      statusRef.current.lastEventAt = new Date().toISOString()

      if (debug) {
        log.debug('Realtime event', {
          table,
          type: payload.eventType,
          record: payload.new || payload.old,
        })
      }

      switch (payload.eventType) {
        case 'INSERT':
          if (onInsert && payload.new) {
            onInsert(payload.new as T)
          }
          break
        case 'UPDATE':
          if (onUpdate && payload.new) {
            onUpdate(payload.new as T)
          }
          break
        case 'DELETE':
          if (onDelete && payload.old) {
            onDelete(payload.old as T)
          }
          break
      }
    },
    [table, onInsert, onUpdate, onDelete, debug]
  )

  useEffect(() => {
    // Skip if disabled or no user
    if (disabled || !userId) {
      if (debug) log.debug('Realtime disabled', { disabled, userId })
      return
    }

    const supabase = createBrowserSupabaseClient()

    // Create unique channel name
    const channelName = `${table}:${userId}:${Date.now()}`

    if (debug) log.info('Creating realtime subscription', { table, channelName })

    // Subscribe to the table with user filter
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: `user_id=eq.${userId}`,
        },
        (payload) => handlePayload(payload as unknown as RealtimePayload<T>)
      )
      .subscribe((status) => {
        if (debug) log.debug('Subscription status', { status })

        if (status === 'SUBSCRIBED') {
          statusRef.current.isConnected = true
          statusRef.current.error = null
          log.info('Realtime connected', { table })
        } else if (status === 'CHANNEL_ERROR') {
          statusRef.current.isConnected = false
          statusRef.current.error = 'Channel error'
          log.error('Realtime channel error', { table })
        } else if (status === 'TIMED_OUT') {
          statusRef.current.isConnected = false
          statusRef.current.error = 'Connection timed out'
          log.warn('Realtime timeout', { table })
        } else if (status === 'CLOSED') {
          statusRef.current.isConnected = false
          log.info('Realtime closed', { table })
        }
      })

    channelRef.current = channel

    // Cleanup on unmount
    return () => {
      if (debug) log.debug('Cleaning up realtime subscription', { table })
      supabase.removeChannel(channel)
      channelRef.current = null
      statusRef.current.isConnected = false
    }
  }, [table, userId, disabled, debug, handlePayload])

  return statusRef.current
}

/**
 * Hook for subscribing to multiple tables
 *
 * Useful for pages that need to sync multiple data types
 */
export function useMultiTableRealtime(
  userId: string | null | undefined,
  configs: Array<{
    table: RealtimeTable
    onInsert?: (record: Record<string, unknown>) => void
    onUpdate?: (record: Record<string, unknown>) => void
    onDelete?: (oldRecord: Record<string, unknown>) => void
  }>
): void {
  const supabaseRef = useRef(createBrowserSupabaseClient())
  const channelsRef = useRef<RealtimeChannel[]>([])

  useEffect(() => {
    if (!userId) return

    const supabase = supabaseRef.current

    // Create a channel for each table
    const channels = configs.map((config, index) => {
      const channelName = `multi:${config.table}:${userId}:${Date.now()}-${index}`

      return supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: config.table,
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            switch (payload.eventType) {
              case 'INSERT':
                if (config.onInsert && payload.new) {
                  config.onInsert(payload.new as Record<string, unknown>)
                }
                break
              case 'UPDATE':
                if (config.onUpdate && payload.new) {
                  config.onUpdate(payload.new as Record<string, unknown>)
                }
                break
              case 'DELETE':
                if (config.onDelete && payload.old) {
                  config.onDelete(payload.old as Record<string, unknown>)
                }
                break
            }
          }
        )
        .subscribe()
    })

    channelsRef.current = channels

    // Cleanup
    return () => {
      channels.forEach((channel) => supabase.removeChannel(channel))
      channelsRef.current = []
    }
  }, [userId, configs])
}

/**
 * Helper to create a realtime-enabled store
 *
 * Use this in your Zustand store to add realtime sync
 */
export function createRealtimeSync<T extends { id: string }>(
  getCurrentItems: () => T[],
  setItems: (items: T[]) => void
) {
  return {
    onInsert: (record: T) => {
      const items = getCurrentItems()
      // Only add if not already present (prevents duplicates from optimistic updates)
      if (!items.find((item) => item.id === record.id)) {
        setItems([...items, record])
      }
    },
    onUpdate: (record: T) => {
      const items = getCurrentItems()
      setItems(items.map((item) => (item.id === record.id ? record : item)))
    },
    onDelete: (oldRecord: T) => {
      const items = getCurrentItems()
      setItems(items.filter((item) => item.id !== oldRecord.id))
    },
  }
}
