/**
 * Timeline Realtime Hook
 *
 * Connects the Timeline store to Supabase Realtime for multi-device sync.
 * Use this hook in components that display timeline events to enable live updates.
 *
 * @example
 * ```tsx
 * function TimelineView() {
 *   const userId = useCurrentUserId()
 *   useTimelineRealtime(userId)
 *
 *   // Events will now sync across devices in real-time
 *   const { events } = useTimelineStore()
 *   // ...
 * }
 * ```
 */

import { useCallback } from 'react'
import { useTimelineStore } from '@/stores/useTimelineStore'
import { useSupabaseRealtime, type RealtimeStatus } from './useSupabaseRealtime'
import { logger } from '@/lib/logger'
import type { TimelineEvent, LaneType } from '@/types/timeline'

const log = logger.scope('TimelineRealtime')

// Database row type (matches Supabase schema)
interface DatabaseTimelineEvent {
  id: string
  user_id: string
  lane: string
  title: string
  event_date: string
  colour: string | null
  description: string | null
  url: string | null
  tags: string[] | null
  source: string
  opportunity_id: string | null
  tracker_campaign_id: string | null
  tracker_synced_at: string | null
  thread_id: string | null
  created_at: string
  updated_at: string
}

// Convert database row to local TimelineEvent
function fromDatabaseEvent(data: DatabaseTimelineEvent): TimelineEvent {
  return {
    id: data.id,
    lane: data.lane as LaneType,
    title: data.title,
    date: data.event_date,
    colour: data.colour ?? '#3AA9BE',
    description: data.description ?? undefined,
    url: data.url ?? undefined,
    tags: data.tags ?? undefined,
    source: data.source as 'manual' | 'scout' | 'sample',
    opportunityId: data.opportunity_id ?? undefined,
    trackerCampaignId: data.tracker_campaign_id ?? undefined,
    trackerSyncedAt: data.tracker_synced_at ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

/**
 * Hook to enable realtime sync for timeline events
 *
 * @param userId - Current user ID (from auth)
 * @param options - Optional configuration
 * @returns Realtime connection status
 */
export function useTimelineRealtime(
  userId: string | null | undefined,
  options?: { debug?: boolean; disabled?: boolean }
): RealtimeStatus {
  const store = useTimelineStore()

  // Handle remote insert (from another device)
  const handleInsert = useCallback(
    (record: DatabaseTimelineEvent) => {
      const currentEvents = store.events
      const event = fromDatabaseEvent(record)

      // Only add if not already present (prevents duplicates from optimistic updates)
      if (!currentEvents.find((e) => e.id === event.id)) {
        log.debug('Remote insert', { id: event.id })
        useTimelineStore.setState((state) => ({
          events: [...state.events, event],
        }))
      }
    },
    [store.events]
  )

  // Handle remote update (from another device)
  const handleUpdate = useCallback((record: DatabaseTimelineEvent) => {
    const event = fromDatabaseEvent(record)
    log.debug('Remote update', { id: event.id })

    useTimelineStore.setState((state) => ({
      events: state.events.map((e) => (e.id === event.id ? event : e)),
    }))
  }, [])

  // Handle remote delete (from another device)
  const handleDelete = useCallback((oldRecord: DatabaseTimelineEvent) => {
    log.debug('Remote delete', { id: oldRecord.id })

    useTimelineStore.setState((state) => ({
      events: state.events.filter((e) => e.id !== oldRecord.id),
      selectedEventId: state.selectedEventId === oldRecord.id ? null : state.selectedEventId,
    }))
  }, [])

  return useSupabaseRealtime<DatabaseTimelineEvent>({
    table: 'user_timeline_events',
    userId,
    onInsert: handleInsert,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
    debug: options?.debug,
    disabled: options?.disabled,
  })
}
