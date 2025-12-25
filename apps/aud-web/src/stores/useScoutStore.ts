/**
 * Scout Mode Store
 *
 * Phase 3: MVP Pivot - Scout Mode
 *
 * A Zustand store for browsing and filtering opportunities.
 * Persists filter preferences to localStorage.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Opportunity,
  OpportunityType,
  AudienceSize,
  ScoutFilters,
  EnrichedContact,
  EnrichmentStatus,
} from '@/types/scout'
import { DEFAULT_FILTERS } from '@/types/scout'
import { logger } from '@/lib/logger'

const log = logger.scope('Scout Store')

// ============================================================================
// API Response Type
// ============================================================================

interface ScoutAPIResponse {
  success: boolean
  opportunities: Opportunity[]
  total: number
  limit: number
  offset: number
}

// ============================================================================
// Store Interface
// ============================================================================

interface ScoutState {
  // Data
  opportunities: Opportunity[]
  loading: boolean
  error: string | null
  total: number
  hasFetched: boolean

  // Filters (persisted)
  filters: ScoutFilters

  // Selected opportunity for detail view
  selectedOpportunityId: string | null

  // Track which opportunities have been added to timeline
  addedToTimeline: Set<string>

  // Track which opportunities have been pitched
  pitchedIds: Set<string>

  // TAP Intel Enrichment State
  enrichedById: Record<string, EnrichedContact>
  enrichmentStatusById: Record<string, EnrichmentStatus>
  enrichmentErrorById: Record<string, string>

  // Actions
  fetchOpportunities: () => Promise<void>
  setOpportunities: (opportunities: Opportunity[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilter: <K extends keyof ScoutFilters>(key: K, value: ScoutFilters[K]) => void
  resetFilters: () => void
  selectOpportunity: (id: string | null) => void
  markAddedToTimeline: (id: string) => void
  markAsPitched: (id: string) => void

  // TAP Intel Actions
  validateContact: (opportunityId: string) => Promise<void>
  getEnrichmentStatus: (opportunityId: string) => EnrichmentStatus
  getEnrichedData: (opportunityId: string) => EnrichedContact | null
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useScoutStore = create<ScoutState>()(
  persist(
    (set, get) => ({
      // Initial state
      opportunities: [],
      loading: false,
      error: null,
      total: 0,
      hasFetched: false,
      filters: DEFAULT_FILTERS,
      selectedOpportunityId: null,
      addedToTimeline: new Set<string>(),
      pitchedIds: new Set<string>(),

      // TAP Intel Enrichment State
      enrichedById: {},
      enrichmentStatusById: {},
      enrichmentErrorById: {},

      // Actions
      fetchOpportunities: async () => {
        const state = get()

        // Don't fetch if already loading
        if (state.loading) return

        set({ loading: true, error: null })

        try {
          // Build query params from filters
          const params = new URLSearchParams()

          if (state.filters.type) {
            params.set('type', state.filters.type)
          }

          // For now, just use the first genre/vibe if multiple selected
          if (state.filters.genres.length > 0) {
            params.set('genre', state.filters.genres[0])
          }

          if (state.filters.vibes.length > 0) {
            params.set('vibe', state.filters.vibes[0])
          }

          if (state.filters.audienceSize) {
            params.set('size', state.filters.audienceSize)
          }

          if (state.filters.searchQuery.trim()) {
            params.set('q', state.filters.searchQuery.trim())
          }

          params.set('limit', '100')

          const response = await fetch(`/api/scout?${params.toString()}`)
          const data = await response.json()

          // Handle authentication error
          if (response.status === 401) {
            set({
              error: 'Sign in to access opportunities',
              loading: false,
              hasFetched: true,
            })
            return
          }

          if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to fetch opportunities')
          }

          set({
            opportunities: data.opportunities,
            total: data.total,
            loading: false,
            hasFetched: true,
          })
        } catch (error) {
          log.error('Fetch error', error)
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch opportunities',
            loading: false,
          })
        }
      },

      setOpportunities: (opportunities) => set({ opportunities }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      setFilter: (key, value) => {
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        }))
        // Re-fetch after filter change
        get().fetchOpportunities()
      },

      resetFilters: () => {
        set({ filters: DEFAULT_FILTERS })
        get().fetchOpportunities()
      },

      selectOpportunity: (id) => set({ selectedOpportunityId: id }),

      markAddedToTimeline: (id) =>
        set((state) => {
          const newSet = new Set(state.addedToTimeline)
          newSet.add(id)
          return { addedToTimeline: newSet }
        }),

      markAsPitched: (id) =>
        set((state) => {
          const newSet = new Set(state.pitchedIds)
          newSet.add(id)
          return { pitchedIds: newSet }
        }),

      // TAP Intel Actions
      validateContact: async (opportunityId: string) => {
        const state = get()
        const opportunity = state.opportunities.find((o) => o.id === opportunityId)

        if (!opportunity) {
          log.error('Opportunity not found', undefined, { opportunityId })
          return
        }

        if (!opportunity.contactEmail) {
          set((s) => ({
            enrichmentStatusById: { ...s.enrichmentStatusById, [opportunityId]: 'error' },
            enrichmentErrorById: { ...s.enrichmentErrorById, [opportunityId]: 'No contact email' },
          }))
          return
        }

        // Set loading state
        set((s) => ({
          enrichmentStatusById: { ...s.enrichmentStatusById, [opportunityId]: 'loading' },
          enrichmentErrorById: { ...s.enrichmentErrorById, [opportunityId]: '' },
        }))

        try {
          const response = await fetch('/api/tap/intel/enrich', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contacts: [
                {
                  id: opportunityId,
                  name: opportunity.contactName || opportunity.name,
                  email: opportunity.contactEmail,
                  outlet: opportunity.name,
                  genre_tags: opportunity.genres,
                },
              ],
            }),
          })

          const data = await response.json()

          if (!response.ok || !data.success) {
            throw new Error(data.error?.message || 'Failed to validate contact')
          }

          const enriched = data.data?.enriched?.[0]

          if (enriched) {
            set((s) => ({
              enrichedById: {
                ...s.enrichedById,
                [opportunityId]: {
                  contactIntelligence: enriched.contactIntelligence,
                  researchConfidence: enriched.researchConfidence,
                  lastResearched: enriched.lastResearched,
                  errors: enriched.errors,
                },
              },
              enrichmentStatusById: { ...s.enrichmentStatusById, [opportunityId]: 'success' },
            }))
          } else {
            throw new Error('No enrichment data returned')
          }
        } catch (error) {
          log.error('Enrichment error', error)
          set((s) => ({
            enrichmentStatusById: { ...s.enrichmentStatusById, [opportunityId]: 'error' },
            enrichmentErrorById: {
              ...s.enrichmentErrorById,
              [opportunityId]: error instanceof Error ? error.message : 'Validation failed',
            },
          }))
        }
      },

      getEnrichmentStatus: (opportunityId: string): EnrichmentStatus => {
        return get().enrichmentStatusById[opportunityId] || 'idle'
      },

      getEnrichedData: (opportunityId: string): EnrichedContact | null => {
        return get().enrichedById[opportunityId] || null
      },
    }),
    {
      name: 'totalaud-scout-store',
      version: 3, // Bump version for pitchedIds
      // Only persist filters and addedToTimeline/pitchedIds, not the opportunities data
      partialize: (state) => ({
        filters: state.filters,
        addedToTimeline: Array.from(state.addedToTimeline),
        pitchedIds: Array.from(state.pitchedIds),
      }),
      // Rehydrate Sets from arrays
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.addedToTimeline)) {
          state.addedToTimeline = new Set(state.addedToTimeline as unknown as string[])
        }
        if (state && Array.isArray(state.pitchedIds)) {
          state.pitchedIds = new Set(state.pitchedIds as unknown as string[])
        }
      },
    }
  )
)

// ============================================================================
// Selectors
// ============================================================================

/**
 * Get filtered opportunities based on current filter state.
 */
export const selectFilteredOpportunities = (state: ScoutState): Opportunity[] => {
  let filtered = state.opportunities

  // Type filter
  if (state.filters.type !== null) {
    filtered = filtered.filter((o) => o.type === state.filters.type)
  }

  // Genre filter (match any selected genre)
  if (state.filters.genres.length > 0) {
    filtered = filtered.filter((o) => o.genres.some((g) => state.filters.genres.includes(g)))
  }

  // Vibe filter (match any selected vibe)
  if (state.filters.vibes.length > 0) {
    filtered = filtered.filter((o) => o.vibes.some((v) => state.filters.vibes.includes(v)))
  }

  // Audience size filter
  if (state.filters.audienceSize !== null) {
    filtered = filtered.filter((o) => o.audienceSize === state.filters.audienceSize)
  }

  // Search query (name, description, contact name)
  if (state.filters.searchQuery.trim()) {
    const query = state.filters.searchQuery.toLowerCase()
    filtered = filtered.filter(
      (o) =>
        o.name.toLowerCase().includes(query) ||
        o.description?.toLowerCase().includes(query) ||
        o.contactName?.toLowerCase().includes(query)
    )
  }

  return filtered
}

/**
 * Get count of opportunities by type.
 */
export const selectOpportunityCountByType = (
  state: ScoutState
): Record<OpportunityType, number> => {
  return state.opportunities.reduce(
    (acc, o) => {
      acc[o.type] = (acc[o.type] || 0) + 1
      return acc
    },
    { radio: 0, playlist: 0, blog: 0, curator: 0, press: 0 } as Record<OpportunityType, number>
  )
}

/**
 * Get the currently selected opportunity.
 */
export const selectSelectedOpportunity = (state: ScoutState): Opportunity | null => {
  if (!state.selectedOpportunityId) return null
  return state.opportunities.find((o) => o.id === state.selectedOpportunityId) ?? null
}

/**
 * Check if an opportunity has been added to timeline.
 */
export const selectIsAddedToTimeline = (state: ScoutState, id: string): boolean => {
  return state.addedToTimeline.has(id)
}

/**
 * Check if an opportunity has been pitched.
 */
export const selectIsPitched = (state: ScoutState, id: string): boolean => {
  return state.pitchedIds.has(id)
}

/**
 * Get enrichment data for an opportunity.
 */
export const selectEnrichedContact = (state: ScoutState, id: string): EnrichedContact | null => {
  return state.enrichedById[id] || null
}

/**
 * Get enrichment status for an opportunity.
 */
export const selectEnrichmentStatus = (state: ScoutState, id: string): EnrichmentStatus => {
  return state.enrichmentStatusById[id] || 'idle'
}

/**
 * Get enrichment error for an opportunity.
 */
export const selectEnrichmentError = (state: ScoutState, id: string): string | null => {
  return state.enrichmentErrorById[id] || null
}
