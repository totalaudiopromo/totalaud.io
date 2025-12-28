/**
 * Scout Store Types
 *
 * Type definitions for the Scout Mode store.
 * Manages opportunity discovery and TAP Intel enrichment.
 */

import type { Opportunity, ScoutFilters, EnrichedContact, EnrichmentStatus } from '@/types/scout'

// ============================================================================
// State Interface (Pure Data)
// ============================================================================

export interface ScoutStateData {
  /** All loaded opportunities */
  opportunities: Opportunity[]
  /** Total count from API */
  total: number
  /** Whether initial fetch has completed */
  hasFetched: boolean
  /** Currently selected opportunity ID */
  selectedOpportunityId: string | null
  /** IDs of opportunities added to timeline */
  addedToTimeline: Set<string>
  /** IDs of opportunities that have been pitched */
  pitchedIds: Set<string>
}

// ============================================================================
// Filter State Interface
// ============================================================================

export interface ScoutFilterState {
  /** Current filter configuration */
  filters: ScoutFilters
}

// ============================================================================
// Loading State Interface
// ============================================================================

export interface ScoutLoadingState {
  /** Whether opportunities are loading */
  loading: boolean
  /** Error message if any */
  error: string | null
}

// ============================================================================
// Enrichment State Interface
// ============================================================================

export interface ScoutEnrichmentState {
  /** Enriched contact data by opportunity ID */
  enrichedById: Record<string, EnrichedContact>
  /** Enrichment status by opportunity ID */
  enrichmentStatusById: Record<string, EnrichmentStatus>
  /** Enrichment errors by opportunity ID */
  enrichmentErrorById: Record<string, string>
}

// ============================================================================
// Actions Interface
// ============================================================================

export interface ScoutActions {
  // Data fetching
  fetchOpportunities: () => Promise<void>
  setOpportunities: (opportunities: Opportunity[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Filtering
  setFilter: <K extends keyof ScoutFilters>(key: K, value: ScoutFilters[K]) => void
  resetFilters: () => void

  // Selection
  selectOpportunity: (id: string | null) => void
  markAddedToTimeline: (id: string) => void
  markAsPitched: (id: string) => void

  // TAP Intel
  validateContact: (opportunityId: string) => Promise<void>
  getEnrichmentStatus: (opportunityId: string) => EnrichmentStatus
  getEnrichedData: (opportunityId: string) => EnrichedContact | null
}

// ============================================================================
// Complete Store Interface
// ============================================================================

export type ScoutState = ScoutStateData &
  ScoutFilterState &
  ScoutLoadingState &
  ScoutEnrichmentState &
  ScoutActions

// ============================================================================
// Initial State Factory
// ============================================================================

export const createInitialScoutState = (): ScoutStateData &
  ScoutFilterState &
  ScoutLoadingState &
  ScoutEnrichmentState => ({
  opportunities: [],
  total: 0,
  hasFetched: false,
  selectedOpportunityId: null,
  addedToTimeline: new Set<string>(),
  pitchedIds: new Set<string>(),
  filters: {
    type: null,
    genres: [],
    vibes: [],
    audienceSize: null,
    searchQuery: '',
  },
  loading: false,
  error: null,
  enrichedById: {},
  enrichmentStatusById: {},
  enrichmentErrorById: {},
})
