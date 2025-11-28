/**
 * Timeline Store
 *
 * Phase 3: MVP Pivot - Timeline Store
 *
 * A Zustand store for managing timeline events across 5 swim lanes.
 * Persists events to localStorage.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  TimelineEvent,
  NewTimelineEvent,
  TimelineEventUpdate,
  LaneType,
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
          opportunityId: opportunity.id,
          source: 'scout',
        }

        return addEvent(newEvent)
      },

      isOpportunityInTimeline: (opportunityId) => {
        const { events } = get()
        return events.some((event) => event.opportunityId === opportunityId)
      },
    }),
    {
      name: 'totalaud-timeline-store',
      version: 1,
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
