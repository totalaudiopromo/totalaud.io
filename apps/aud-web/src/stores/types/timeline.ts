/**
 * Timeline Store Types
 *
 * Type definitions for the Timeline Mode store.
 * Separated from implementation for testability and reuse.
 */

import type { Opportunity } from '@/types/scout'

// ============================================================================
// Domain Types
// ============================================================================

export type LaneType = 'pre-release' | 'release' | 'promo' | 'content' | 'analytics'
export type EventSource = 'manual' | 'scout' | 'sample'
export type TrackerSyncStatus = 'idle' | 'syncing' | 'synced' | 'error'

export interface TimelineEvent {
  id: string
  lane: LaneType
  title: string
  date: string
  colour: string
  description?: string
  url?: string
  tags?: string[]
  source: EventSource
  opportunityId?: string
  trackerCampaignId?: string
  trackerSyncedAt?: string
  createdAt: string
  updatedAt: string
}

export interface NewTimelineEvent {
  lane: LaneType
  title: string
  date: string
  colour: string
  description?: string
  url?: string
  tags?: string[]
  source: EventSource
  opportunityId?: string
}

export interface TimelineEventUpdate {
  lane?: LaneType
  title?: string
  date?: string
  colour?: string
  description?: string
  url?: string
  tags?: string[]
}

// ============================================================================
// State Interface (Pure Data)
// ============================================================================

export interface TimelineStateData {
  /** All timeline events */
  events: TimelineEvent[]
  /** Loading state */
  loading: boolean
  /** Error message */
  error: string | null
  /** Currently selected event ID */
  selectedEventId: string | null
}

// ============================================================================
// Tracker Sync State
// ============================================================================

export interface TimelineTrackerState {
  /** Sync status per event */
  trackerSyncStatusById: Record<string, TrackerSyncStatus>
  /** Sync errors per event */
  trackerSyncErrorById: Record<string, string>
}

// ============================================================================
// Supabase Sync State
// ============================================================================

export interface TimelineSyncState {
  /** Whether data is loading from Supabase */
  isLoading: boolean
  /** Whether data is syncing to Supabase */
  isSyncing: boolean
  /** Sync error message */
  syncError: string | null
  /** Last successful sync timestamp */
  lastSyncedAt: string | null
}

// ============================================================================
// Actions Interface
// ============================================================================

export interface TimelineActions {
  // CRUD
  addEvent: (event: NewTimelineEvent) => Promise<string>
  updateEvent: (id: string, updates: TimelineEventUpdate) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
  selectEvent: (id: string | null) => void
  clearSampleEvents: () => Promise<void>
  resetToSamples: () => void

  // Scout Integration
  addFromOpportunity: (opportunity: Opportunity, lane?: LaneType) => Promise<string>
  isOpportunityInTimeline: (opportunityId: string) => boolean

  // Tracker Integration
  syncToTracker: (eventId: string) => Promise<void>
  getTrackerSyncStatus: (eventId: string) => TrackerSyncStatus
  isEventSynced: (eventId: string) => boolean

  // Supabase Sync
  loadFromSupabase: () => Promise<void>
  syncToSupabase: () => Promise<void>
}

// ============================================================================
// Complete Store Interface
// ============================================================================

export type TimelineState = TimelineStateData &
  TimelineTrackerState &
  TimelineSyncState &
  TimelineActions

// ============================================================================
// Initial State Factory
// ============================================================================

export const createInitialTimelineState = (): TimelineStateData &
  TimelineTrackerState &
  TimelineSyncState => ({
  events: [],
  loading: false,
  error: null,
  selectedEventId: null,
  trackerSyncStatusById: {},
  trackerSyncErrorById: {},
  isLoading: false,
  isSyncing: false,
  syncError: null,
  lastSyncedAt: null,
})
