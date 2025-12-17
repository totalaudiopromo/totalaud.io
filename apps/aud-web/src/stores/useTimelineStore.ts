/**
 * Timeline Store
 *
 * Phase 10: Data Persistence
 *
 * A Zustand store for managing timeline events across 5 swim lanes with:
 * - Supabase sync for authenticated users
 * - localStorage fallback for unauthenticated users
 * - TAP Tracker integration for campaign logging
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'
import type {
  TimelineEvent,
  NewTimelineEvent,
  TimelineEventUpdate,
  LaneType,
  TrackerSyncStatus,
} from '@/types/timeline'
import { SAMPLE_EVENTS, generateEventId, getLaneColour } from '@/types/timeline'
import type { Opportunity } from '@/types/scout'
import type { SyncedTimelineEvent } from '@/hooks/useSupabaseSync'
import type { Database } from '@total-audio/schemas-database'

type TimelineEventRowUpdate = Database['public']['Tables']['user_timeline_events']['Update']

const log = logger.scope('TimelineStore')

// ============================================================================
// Store Interface
// ============================================================================

interface TimelineState {
  // Data
  events: TimelineEvent[]
  loading: boolean
  error: string | null

  // View state
  selectedEventId: string | null

  // TAP Tracker sync state (per-event)
  trackerSyncStatusById: Record<string, TrackerSyncStatus>
  trackerSyncErrorById: Record<string, string>

  // Supabase sync state
  isLoading: boolean
  isSyncing: boolean
  syncError: string | null
  lastSyncedAt: string | null

  // Actions
  addEvent: (event: NewTimelineEvent) => Promise<string>
  updateEvent: (id: string, updates: TimelineEventUpdate) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
  selectEvent: (id: string | null) => void
  clearSampleEvents: () => Promise<void>
  resetToSamples: () => void

  // Scout integration
  addFromOpportunity: (opportunity: Opportunity, lane?: LaneType) => Promise<string>
  isOpportunityInTimeline: (opportunityId: string) => boolean

  // TAP Tracker integration
  syncToTracker: (eventId: string) => Promise<void>
  getTrackerSyncStatus: (eventId: string) => TrackerSyncStatus
  isEventSynced: (eventId: string) => boolean

  // Supabase sync actions
  loadFromSupabase: () => Promise<void>
  syncToSupabase: () => Promise<void>
}

// ============================================================================
// Conversion Functions
// ============================================================================

// Type for raw database row (with nullable fields matching actual schema)
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
  created_at: string
  updated_at: string
}

function toSupabaseEvent(
  event: TimelineEvent,
  userId: string
): Omit<SyncedTimelineEvent, 'created_at' | 'updated_at'> {
  return {
    id: event.id,
    user_id: userId,
    lane: event.lane,
    title: event.title,
    event_date: event.date,
    colour: event.colour,
    description: event.description ?? null,
    url: event.url ?? null,
    tags: event.tags ?? [],
    source: event.source,
    opportunity_id: event.opportunityId ?? null,
    tracker_campaign_id: event.trackerCampaignId ?? null,
    tracker_synced_at: event.trackerSyncedAt ?? null,
  }
}

function fromSupabaseEvent(data: DatabaseTimelineEvent): TimelineEvent {
  return {
    id: data.id,
    lane: data.lane as LaneType,
    title: data.title,
    date: data.event_date,
    colour: data.colour ?? '#3AA9BE', // Default to accent colour
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

// ============================================================================
// Store Implementation
// ============================================================================

export const useTimelineStore = create<TimelineState>()(
  persist(
    (set, get) => ({
      // Initial state
      events: SAMPLE_EVENTS,
      loading: false,
      error: null,
      selectedEventId: null,

      // TAP Tracker sync state
      trackerSyncStatusById: {},
      trackerSyncErrorById: {},

      // Supabase sync state
      isLoading: false,
      isSyncing: false,
      syncError: null,
      lastSyncedAt: null,

      // ========== CRUD Actions ==========

      addEvent: async (event) => {
        const id = generateEventId()
        const now = new Date().toISOString()
        const newEvent: TimelineEvent = {
          ...event,
          id,
          createdAt: now,
          updatedAt: now,
        }

        // Optimistic update
        set((state) => ({
          events: [...state.events, newEvent],
        }))

        // Sync to Supabase if authenticated
        try {
          const supabase = createBrowserSupabaseClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('user_timeline_events') as any).insert({
              ...toSupabaseEvent(newEvent, user.id),
              created_at: now,
              updated_at: now,
            })

            if (error) {
              // Don't show error for common cases (table not existing, RLS)
              // These are expected when database isn't fully set up
              const isSetupError = error.code === '42P01' || error.message?.includes('permission')
              if (!isSetupError) {
                log.warn('Sync error (non-critical)', { error: error.message })
              }
              // Still persist locally - that's working fine
            }
          }
          // If not authenticated, local storage handles it - no error needed
        } catch (error) {
          // Network or other errors - log quietly, local storage still works
          log.warn('Sync unavailable', { error })
        }

        return id
      },

      updateEvent: async (id, updates) => {
        const now = new Date().toISOString()

        // Optimistic update
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id ? { ...event, ...updates, updatedAt: now } : event
          ),
        }))

        // Sync to Supabase if authenticated
        try {
          const supabase = createBrowserSupabaseClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            // Convert updates to Supabase format
            const supabaseUpdates: TimelineEventRowUpdate = { updated_at: now }
            if (updates.lane) supabaseUpdates.lane = updates.lane
            if (updates.title) supabaseUpdates.title = updates.title
            if (updates.date) supabaseUpdates.event_date = updates.date
            if (updates.colour) supabaseUpdates.colour = updates.colour
            if (updates.description !== undefined) supabaseUpdates.description = updates.description
            if (updates.url !== undefined) supabaseUpdates.url = updates.url
            if (updates.tags) supabaseUpdates.tags = updates.tags

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('user_timeline_events') as any)
              .update(supabaseUpdates)
              .eq('id', id)
              .eq('user_id', user.id)

            if (error) {
              log.error('Update error', error)
              set({ syncError: error.message })
            }
          }
        } catch (error) {
          log.error('Sync error', error)
        }
      },

      deleteEvent: async (id) => {
        // Optimistic update
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
          selectedEventId: state.selectedEventId === id ? null : state.selectedEventId,
        }))

        // Sync to Supabase if authenticated
        try {
          const supabase = createBrowserSupabaseClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('user_timeline_events') as any)
              .delete()
              .eq('id', id)
              .eq('user_id', user.id)

            if (error) {
              log.error('Delete error', error)
              set({ syncError: error.message })
            }
          }
        } catch (error) {
          log.error('Sync error', error)
        }
      },

      selectEvent: (id) => set({ selectedEventId: id }),

      clearSampleEvents: async () => {
        const sampleIds = get()
          .events.filter((e) => e.source === 'sample')
          .map((e) => e.id)

        set((state) => ({
          events: state.events.filter((event) => event.source !== 'sample'),
        }))

        // Delete samples from Supabase if they were synced
        try {
          const supabase = createBrowserSupabaseClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user && sampleIds.length > 0) {
            const { error } = await supabase
              .from('user_timeline_events')
              .delete()
              .eq('user_id', user.id)
              .in('id', sampleIds)

            if (error) {
              log.error('Clear samples error', error)
            }
          }
        } catch (error) {
          log.error('Sync error', error)
        }
      },

      resetToSamples: () =>
        set({
          events: SAMPLE_EVENTS,
          selectedEventId: null,
        }),

      // ========== Scout Integration ==========

      addFromOpportunity: async (opportunity, lane = 'promo') => {
        const { addEvent } = get()

        const newEvent: NewTimelineEvent = {
          lane,
          title: `Pitch: ${opportunity.name}`,
          date: new Date().toISOString(),
          colour: getLaneColour(lane),
          description: opportunity.description ?? `${opportunity.type} outreach`,
          url: opportunity.link,
          tags: [opportunity.type, ...(opportunity.genres?.slice(0, 2) ?? [])],
          opportunityId: opportunity.id,
          source: 'scout',
        }

        return addEvent(newEvent)
      },

      isOpportunityInTimeline: (opportunityId) => {
        const { events } = get()
        return events.some((event) => event.opportunityId === opportunityId)
      },

      // ========== TAP Tracker Integration ==========

      syncToTracker: async (eventId: string) => {
        const state = get()
        const event = state.events.find((e) => e.id === eventId)

        if (!event) {
          log.error('Event not found', { eventId })
          return
        }

        if (event.source === 'sample') {
          set((s) => ({
            trackerSyncStatusById: { ...s.trackerSyncStatusById, [eventId]: 'error' },
            trackerSyncErrorById: {
              ...s.trackerSyncErrorById,
              [eventId]: 'Cannot sync sample events',
            },
          }))
          return
        }

        if (event.trackerCampaignId) {
          set((s) => ({
            trackerSyncStatusById: { ...s.trackerSyncStatusById, [eventId]: 'synced' },
          }))
          return
        }

        set((s) => ({
          trackerSyncStatusById: { ...s.trackerSyncStatusById, [eventId]: 'syncing' },
          trackerSyncErrorById: { ...s.trackerSyncErrorById, [eventId]: '' },
        }))

        try {
          const response = await fetch('/api/tap/tracker/campaigns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: event.title,
              status: 'active',
              notes: `Lane: ${event.lane}${event.description ? ` — ${event.description}` : ''}`,
              start_date: event.date,
            }),
          })

          const data = await response.json()

          if (!response.ok || !data.success) {
            throw new Error(data.error?.message || 'Failed to sync to Tracker')
          }

          const campaignId = data.data?.campaign?.id
          const syncedAt = new Date().toISOString()

          set((s) => ({
            events: s.events.map((e) =>
              e.id === eventId
                ? {
                    ...e,
                    trackerCampaignId: campaignId,
                    trackerSyncedAt: syncedAt,
                    updatedAt: syncedAt,
                  }
                : e
            ),
            trackerSyncStatusById: { ...s.trackerSyncStatusById, [eventId]: 'synced' },
          }))

          // Also update in Supabase
          const supabase = createBrowserSupabaseClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase.from('user_timeline_events') as any)
              .update({
                tracker_campaign_id: campaignId,
                tracker_synced_at: syncedAt,
                updated_at: syncedAt,
              })
              .eq('id', eventId)
              .eq('user_id', user.id)
          }
        } catch (error) {
          log.error('Tracker sync error', error)
          set((s) => ({
            trackerSyncStatusById: { ...s.trackerSyncStatusById, [eventId]: 'error' },
            trackerSyncErrorById: {
              ...s.trackerSyncErrorById,
              [eventId]: error instanceof Error ? error.message : 'Sync failed',
            },
          }))
        }
      },

      getTrackerSyncStatus: (eventId: string): TrackerSyncStatus => {
        const state = get()
        const event = state.events.find((e) => e.id === eventId)
        if (event?.trackerCampaignId) return 'synced'
        return state.trackerSyncStatusById[eventId] || 'idle'
      },

      isEventSynced: (eventId: string): boolean => {
        const state = get()
        const event = state.events.find((e) => e.id === eventId)
        return !!event?.trackerCampaignId
      },

      // ========== Supabase Sync Actions ==========

      loadFromSupabase: async () => {
        set({ isLoading: true, syncError: null })

        try {
          const supabase = createBrowserSupabaseClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (!user) {
            set({ isLoading: false })
            return
          }

          const { data, error } = await supabase
            .from('user_timeline_events')
            .select('*')
            .eq('user_id', user.id)
            .order('event_date', { ascending: true })

          if (error) {
            log.error('Load error', error)
            set({ isLoading: false, syncError: error.message })
            return
          }

          if (data && data.length > 0) {
            const events = data.map(fromSupabaseEvent)
            set({
              events,
              isLoading: false,
              lastSyncedAt: new Date().toISOString(),
            })
          } else {
            set({ isLoading: false })
          }
        } catch (error) {
          log.error('Load error', error)
          set({
            isLoading: false,
            syncError: error instanceof Error ? error.message : 'Failed to load',
          })
        }
      },

      syncToSupabase: async () => {
        const state = get()
        if (state.isSyncing) return

        set({ isSyncing: true, syncError: null })

        try {
          const supabase = createBrowserSupabaseClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (!user) {
            set({ isSyncing: false })
            return
          }

          // Upsert all non-sample events
          const eventsToSync = state.events.filter((e) => e.source !== 'sample')
          const supabaseEvents = eventsToSync.map((event) => ({
            ...toSupabaseEvent(event, user.id),
            created_at: event.createdAt,
            updated_at: event.updatedAt,
          }))

          if (supabaseEvents.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('user_timeline_events') as any).upsert(
              supabaseEvents,
              { onConflict: 'id' }
            )

            if (error) {
              log.error('Sync error', error)
              set({ isSyncing: false, syncError: error.message })
              return
            }
          }

          set({
            isSyncing: false,
            lastSyncedAt: new Date().toISOString(),
          })
        } catch (error) {
          log.error('Sync error', error)
          set({
            isSyncing: false,
            syncError: error instanceof Error ? error.message : 'Sync failed',
          })
        }
      },
    }),
    {
      name: 'totalaud-timeline-store',
      version: 3, // Bump version for sync fields
      partialize: (state) => ({
        events: state.events,
      }),
    }
  )
)

// ============================================================================
// Selectors
// ============================================================================

export const selectEventsByLane = (state: TimelineState, lane: LaneType): TimelineEvent[] => {
  return state.events.filter((event) => event.lane === lane)
}

export const selectSelectedEvent = (state: TimelineState): TimelineEvent | null => {
  if (!state.selectedEventId) return null
  return state.events.find((event) => event.id === state.selectedEventId) ?? null
}

export const selectEventCountByLane = (state: TimelineState): Record<LaneType, number> => {
  return state.events.reduce(
    (acc, event) => {
      acc[event.lane] = (acc[event.lane] || 0) + 1
      return acc
    },
    {
      'pre-release': 0,
      release: 0,
      promo: 0,
      content: 0,
      analytics: 0,
    } as Record<LaneType, number>
  )
}

export const selectScoutEvents = (state: TimelineState): TimelineEvent[] => {
  return state.events.filter((event) => event.source === 'scout')
}

export const selectSyncedEvents = (state: TimelineState): TimelineEvent[] => {
  return state.events.filter((event) => !!event.trackerCampaignId)
}

export const selectTrackerSyncStatus = (
  state: TimelineState,
  eventId: string
): TrackerSyncStatus => {
  const event = state.events.find((e) => e.id === eventId)
  if (event?.trackerCampaignId) return 'synced'
  return state.trackerSyncStatusById[eventId] || 'idle'
}

export const selectTrackerSyncError = (state: TimelineState, eventId: string): string | null => {
  return state.trackerSyncErrorById[eventId] || null
}

export const selectSyncStatus = (state: TimelineState) => ({
  isLoading: state.isLoading,
  isSyncing: state.isSyncing,
  error: state.syncError,
  lastSyncedAt: state.lastSyncedAt,
})
