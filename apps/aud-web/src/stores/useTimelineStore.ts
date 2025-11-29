/**
 * Timeline Store
 *
 * Phase 3: MVP Pivot - Timeline Store
 *
 * A Zustand store for managing timeline events across 5 swim lanes.
 * Persists events to localStorage.
 *
 * Integrates with TAP Tracker for optional campaign logging.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  TimelineEvent,
  NewTimelineEvent,
  TimelineEventUpdate,
  LaneType,
  TrackerSyncStatus,
} from '@/types/timeline'
import { SAMPLE_EVENTS, generateEventId, getLaneColour } from '@/types/timeline'
import type { Opportunity } from '@/types/scout'

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

  // Actions
  addEvent: (event: NewTimelineEvent) => string
  updateEvent: (id: string, updates: TimelineEventUpdate) => void
  deleteEvent: (id: string) => void
  selectEvent: (id: string | null) => void
  clearSampleEvents: () => void
  resetToSamples: () => void

  // Scout integration
  addFromOpportunity: (opportunity: Opportunity, lane?: LaneType) => string
  isOpportunityInTimeline: (opportunityId: string) => boolean

  // TAP Tracker integration
  syncToTracker: (eventId: string) => Promise<void>
  getTrackerSyncStatus: (eventId: string) => TrackerSyncStatus
  isEventSynced: (eventId: string) => boolean
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

      // Actions
      addEvent: (event) => {
        const id = generateEventId()
        const now = new Date().toISOString()
        const newEvent: TimelineEvent = {
          ...event,
          id,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          events: [...state.events, newEvent],
        }))
        return id
      },

      updateEvent: (id, updates) =>
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id ? { ...event, ...updates, updatedAt: new Date().toISOString() } : event
          ),
        })),

      deleteEvent: (id) =>
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
          selectedEventId: state.selectedEventId === id ? null : state.selectedEventId,
        })),

      selectEvent: (id) => set({ selectedEventId: id }),

      clearSampleEvents: () =>
        set((state) => ({
          events: state.events.filter((event) => event.source !== 'sample'),
        })),

      resetToSamples: () =>
        set({
          events: SAMPLE_EVENTS,
          selectedEventId: null,
        }),

      // Scout integration
      addFromOpportunity: (opportunity, lane = 'promo') => {
        const { addEvent } = get()

        // Create event from opportunity
        const newEvent: NewTimelineEvent = {
          lane,
          title: `Pitch: ${opportunity.name}`,
          date: new Date().toISOString(), // Default to today, user can adjust
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

      // TAP Tracker integration
      syncToTracker: async (eventId: string) => {
        const state = get()
        const event = state.events.find((e) => e.id === eventId)

        if (!event) {
          console.error('[Timeline Store] Event not found:', eventId)
          return
        }

        // Don't sync sample events
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

        // Already synced?
        if (event.trackerCampaignId) {
          set((s) => ({
            trackerSyncStatusById: { ...s.trackerSyncStatusById, [eventId]: 'synced' },
          }))
          return
        }

        // Set syncing state
        set((s) => ({
          trackerSyncStatusById: { ...s.trackerSyncStatusById, [eventId]: 'syncing' },
          trackerSyncErrorById: { ...s.trackerSyncErrorById, [eventId]: '' },
        }))

        try {
          // Note: We don't send platform/genre/target_type because TAP Tracker
          // has database check constraints that require specific values
          // (e.g., "BBC Radio", "Commercial Radio" instead of "radio").
          // Users can set these manually in the Tracker dashboard.

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

          // Update event with tracker info
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
        } catch (error) {
          console.error('[Timeline Store] Tracker sync error:', error)
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
        // If event already has trackerCampaignId, it's synced
        if (event?.trackerCampaignId) return 'synced'
        return state.trackerSyncStatusById[eventId] || 'idle'
      },

      isEventSynced: (eventId: string): boolean => {
        const state = get()
        const event = state.events.find((e) => e.id === eventId)
        return !!event?.trackerCampaignId
      },
    }),
    {
      name: 'totalaud-timeline-store',
      version: 2, // Bump version due to new tracker fields
      // Persist all events
      partialize: (state) => ({
        events: state.events,
      }),
    }
  )
)

// ============================================================================
// Selectors
// ============================================================================

/**
 * Get events for a specific lane.
 */
export const selectEventsByLane = (state: TimelineState, lane: LaneType): TimelineEvent[] => {
  return state.events.filter((event) => event.lane === lane)
}

/**
 * Get the currently selected event.
 */
export const selectSelectedEvent = (state: TimelineState): TimelineEvent | null => {
  if (!state.selectedEventId) return null
  return state.events.find((event) => event.id === state.selectedEventId) ?? null
}

/**
 * Get events count by lane.
 */
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

/**
 * Get events from Scout (added from opportunities).
 */
export const selectScoutEvents = (state: TimelineState): TimelineEvent[] => {
  return state.events.filter((event) => event.source === 'scout')
}

/**
 * Get events synced to TAP Tracker.
 */
export const selectSyncedEvents = (state: TimelineState): TimelineEvent[] => {
  return state.events.filter((event) => !!event.trackerCampaignId)
}

/**
 * Get tracker sync status for an event.
 */
export const selectTrackerSyncStatus = (
  state: TimelineState,
  eventId: string
): TrackerSyncStatus => {
  const event = state.events.find((e) => e.id === eventId)
  if (event?.trackerCampaignId) return 'synced'
  return state.trackerSyncStatusById[eventId] || 'idle'
}

/**
 * Get tracker sync error for an event.
 */
export const selectTrackerSyncError = (state: TimelineState, eventId: string): string | null => {
  return state.trackerSyncErrorById[eventId] || null
}
