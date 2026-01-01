/**
 * Timeline Types
 *
 * Phase 3: MVP Pivot - Timeline Store
 *
 * Types for timeline events across 3 swim lanes:
 * - Pre-release (preparation)
 * - Release (launch day)
 * - Post-release (promotion, content, analytics)
 *
 * Integrates with TAP Tracker for optional campaign logging.
 */

// ============================================================================
// Lane Types
// ============================================================================

export type LaneType = 'pre-release' | 'release' | 'post-release'

export interface Lane {
  id: LaneType
  label: string
  colour: string
}

/**
 * Lane definitions with colours matching the existing design system.
 */
export const LANES: Lane[] = [
  { id: 'pre-release', label: 'Pre-release', colour: '#6366F1' },
  { id: 'release', label: 'Release', colour: '#3AA9BE' },
  { id: 'post-release', label: 'Post-release', colour: '#10B981' },
]

/**
 * Lookup map for lane data by ID.
 */
export const LANE_MAP: Record<LaneType, Lane> = LANES.reduce(
  (acc, lane) => {
    acc[lane.id] = lane
    return acc
  },
  {} as Record<LaneType, Lane>
)

// ============================================================================
// Event Types
// ============================================================================

export interface TimelineEvent {
  id: string
  lane: LaneType
  title: string
  date: string // ISO string for persistence
  colour: string
  description?: string
  /** Link to opportunity or external resource */
  url?: string
  /** Tags for categorisation and filtering */
  tags?: string[]
  /** Reference to source opportunity (from Scout) */
  opportunityId?: string
  /** Source of the event */
  source: 'manual' | 'scout' | 'sample'
  createdAt: string
  updatedAt: string

  // TAP Tracker integration (optional)
  /** ID of the campaign in TAP Tracker */
  trackerCampaignId?: string
  /** When this event was synced to TAP Tracker */
  trackerSyncedAt?: string

  // Signal Threads integration (Phase 2)
  /** ID of the signal thread this event belongs to */
  threadId?: string | null
}

// ============================================================================
// TAP Tracker Sync Types
// ============================================================================

export type TrackerSyncStatus = 'idle' | 'syncing' | 'synced' | 'error'

/**
 * State for tracking sync status of individual events
 */
export interface TrackerSyncState {
  status: TrackerSyncStatus
  error?: string
  campaignId?: string
  syncedAt?: string
}

/**
 * For creating new events (without id and timestamps).
 */
export type NewTimelineEvent = Omit<TimelineEvent, 'id' | 'createdAt' | 'updatedAt'>

/**
 * For updating events (all fields optional except id).
 */
export type TimelineEventUpdate = Partial<Omit<TimelineEvent, 'id' | 'createdAt'>>

// ============================================================================
// Sample Events
// ============================================================================

/**
 * Sample events for demo purposes.
 * These are loaded as initial state but can be cleared.
 */
export const SAMPLE_EVENTS: TimelineEvent[] = [
  {
    id: 'sample-1',
    lane: 'pre-release',
    title: 'Finalise master',
    date: new Date(2025, 0, 15).toISOString(),
    colour: '#6366F1',
    description: 'Send to mastering engineer',
    source: 'sample',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    lane: 'pre-release',
    title: 'Submit to distributors',
    date: new Date(2025, 0, 22).toISOString(),
    colour: '#6366F1',
    description: 'DistroKid / TuneCore submission',
    source: 'sample',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample-3',
    lane: 'release',
    title: 'Release Day',
    date: new Date(2025, 1, 14).toISOString(),
    colour: '#3AA9BE',
    description: 'Single drops on all platforms',
    source: 'sample',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample-4',
    lane: 'post-release',
    title: 'Radio pitching',
    date: new Date(2025, 0, 28).toISOString(),
    colour: '#10B981',
    description: 'BBC Radio 1, 6 Music outreach',
    source: 'sample',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample-5',
    lane: 'post-release',
    title: 'Playlist pitching',
    date: new Date(2025, 1, 1).toISOString(),
    colour: '#10B981',
    description: 'Spotify editorial submissions',
    source: 'sample',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample-6',
    lane: 'post-release',
    title: 'Music video shoot',
    date: new Date(2025, 1, 7).toISOString(),
    colour: '#10B981',
    description: 'One-day shoot in London',
    source: 'sample',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample-7',
    lane: 'post-release',
    title: 'Social teasers',
    date: new Date(2025, 1, 10).toISOString(),
    colour: '#10B981',
    description: '15s clips for TikTok/Reels',
    source: 'sample',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample-8',
    lane: 'post-release',
    title: 'Week 1 review',
    date: new Date(2025, 1, 21).toISOString(),
    colour: '#10B981',
    description: 'Analyse streaming data',
    source: 'sample',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get the default colour for a lane.
 */
export function getLaneColour(lane: LaneType): string {
  return LANE_MAP[lane]?.colour ?? '#6B7280'
}

/**
 * Generate a unique event ID.
 */
export function generateEventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}
