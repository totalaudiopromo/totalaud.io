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
import type { Opportunity, OpportunityType, AudienceSize, ScoutFilters } from '@/types/scout'
import { DEFAULT_FILTERS } from '@/types/scout'

// ============================================================================
// Mock Data (for MVP development) - Must be defined before store
// ============================================================================

const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-1',
    name: 'BBC Radio 6 Music',
    type: 'radio',
    genres: ['Alternative', 'Indie', 'Electronic'],
    vibes: ['Experimental', 'Underground'],
    audienceSize: 'large',
    link: 'https://www.bbc.co.uk/6music',
    contactEmail: 'music@bbc.co.uk',
    contactName: 'Steve Lamacq',
    description:
      'UK national radio station for alternative and indie music. Weekly reach: 2.5M listeners.',
    source: 'airtable',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'opp-2',
    name: 'NME New Music',
    type: 'blog',
    genres: ['Rock', 'Indie', 'Alternative'],
    vibes: ['Energetic', 'Mainstream'],
    audienceSize: 'large',
    link: 'https://www.nme.com',
    contactEmail: 'tips@nme.com',
    contactName: 'Music Editor',
    description: 'Leading UK music publication covering new releases and emerging artists.',
    source: 'manual',
    createdAt: '2025-01-14T09:00:00Z',
    updatedAt: '2025-01-14T09:00:00Z',
  },
  {
    id: 'opp-3',
    name: 'Spotify Fresh Finds',
    type: 'playlist',
    genres: ['Pop', 'Indie', 'Electronic'],
    vibes: ['Uplifting', 'Chill'],
    audienceSize: 'large',
    link: 'https://open.spotify.com/playlist/37i9dQZF1DWWjGdmeTyeJ6',
    description: 'Official Spotify editorial playlist for emerging artists. 500K+ followers.',
    source: 'manual',
    createdAt: '2025-01-13T14:00:00Z',
    updatedAt: '2025-01-13T14:00:00Z',
  },
  {
    id: 'opp-4',
    name: 'Amazing Radio',
    type: 'radio',
    genres: ['Indie', 'Alternative', 'Folk'],
    vibes: ['Underground', 'Emotional'],
    audienceSize: 'medium',
    link: 'https://www.amazingradio.com',
    contactEmail: 'music@amazingradio.com',
    contactName: 'Charlie Ashcroft',
    description: 'Independent radio station championing unsigned and emerging artists.',
    source: 'airtable',
    createdAt: '2025-01-12T11:00:00Z',
    updatedAt: '2025-01-12T11:00:00Z',
  },
  {
    id: 'opp-5',
    name: 'The Line of Best Fit',
    type: 'blog',
    genres: ['Indie', 'Electronic', 'Folk'],
    vibes: ['Chill', 'Emotional'],
    audienceSize: 'medium',
    link: 'https://www.thelineofbestfit.com',
    contactEmail: 'submissions@thelineofbestfit.com',
    description:
      'UK music blog known for discovering new talent. Strong Spotify playlist influence.',
    source: 'manual',
    createdAt: '2025-01-11T16:00:00Z',
    updatedAt: '2025-01-11T16:00:00Z',
  },
  {
    id: 'opp-6',
    name: 'Chilled Cow',
    type: 'curator',
    genres: ['Electronic', 'Ambient', 'Jazz'],
    vibes: ['Chill', 'Dark'],
    audienceSize: 'large',
    link: 'https://www.youtube.com/c/ChilledCow',
    contactEmail: 'submit@chilledcow.com',
    description: 'Lo-fi and chill beats curator. 10M+ YouTube subscribers.',
    source: 'discovery',
    createdAt: '2025-01-10T08:00:00Z',
    updatedAt: '2025-01-10T08:00:00Z',
  },
  {
    id: 'opp-7',
    name: 'DIY Magazine',
    type: 'press',
    genres: ['Rock', 'Indie', 'Pop'],
    vibes: ['Energetic', 'Mainstream'],
    audienceSize: 'medium',
    link: 'https://diymag.com',
    contactEmail: 'music@diymag.com',
    contactName: 'Features Desk',
    description: 'UK music magazine covering new releases, interviews, and live reviews.',
    source: 'manual',
    createdAt: '2025-01-09T13:00:00Z',
    updatedAt: '2025-01-09T13:00:00Z',
  },
  {
    id: 'opp-8',
    name: "Phoebe's Lo-Fi Garden",
    type: 'playlist',
    genres: ['Electronic', 'Ambient', 'Jazz'],
    vibes: ['Chill', 'Emotional'],
    audienceSize: 'small',
    link: 'https://open.spotify.com/playlist/example',
    contactEmail: 'phoebe@lofi.garden',
    contactName: 'Phoebe',
    description:
      'Independent curator focusing on lo-fi, ambient, and chill electronic. 15K followers.',
    source: 'discovery',
    createdAt: '2025-01-08T19:00:00Z',
    updatedAt: '2025-01-08T19:00:00Z',
  },
  {
    id: 'opp-9',
    name: 'XFM Manchester',
    type: 'radio',
    genres: ['Alternative', 'Indie', 'Rock'],
    vibes: ['Energetic', 'Underground'],
    audienceSize: 'small',
    link: 'https://www.xfm.co.uk',
    contactEmail: 'music@xfm.co.uk',
    description: 'Regional alternative radio station. Good for breaking local artists.',
    source: 'airtable',
    createdAt: '2025-01-07T10:00:00Z',
    updatedAt: '2025-01-07T10:00:00Z',
  },
  {
    id: 'opp-10',
    name: 'Indie Shuffle',
    type: 'blog',
    genres: ['Indie', 'Electronic', 'Pop'],
    vibes: ['Uplifting', 'Chill'],
    audienceSize: 'medium',
    link: 'https://www.indieshuffle.com',
    contactEmail: 'submit@indieshuffle.com',
    description: 'Music discovery blog with strong social media presence. Free submission.',
    source: 'manual',
    createdAt: '2025-01-06T15:00:00Z',
    updatedAt: '2025-01-06T15:00:00Z',
  },
]

// ============================================================================
// Store Interface
// ============================================================================

interface ScoutState {
  // Data
  opportunities: Opportunity[]
  loading: boolean
  error: string | null

  // Filters (persisted)
  filters: ScoutFilters

  // Selected opportunity for detail view
  selectedOpportunityId: string | null

  // Track which opportunities have been added to timeline
  addedToTimeline: Set<string>

  // Actions
  setOpportunities: (opportunities: Opportunity[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilter: <K extends keyof ScoutFilters>(key: K, value: ScoutFilters[K]) => void
  resetFilters: () => void
  selectOpportunity: (id: string | null) => void
  markAddedToTimeline: (id: string) => void
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useScoutStore = create<ScoutState>()(
  persist(
    (set) => ({
      // Initial state
      opportunities: MOCK_OPPORTUNITIES,
      loading: false,
      error: null,
      filters: DEFAULT_FILTERS,
      selectedOpportunityId: null,
      addedToTimeline: new Set<string>(),

      // Actions
      setOpportunities: (opportunities) => set({ opportunities }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        })),

      resetFilters: () => set({ filters: DEFAULT_FILTERS }),

      selectOpportunity: (id) => set({ selectedOpportunityId: id }),

      markAddedToTimeline: (id) =>
        set((state) => {
          const newSet = new Set(state.addedToTimeline)
          newSet.add(id)
          return { addedToTimeline: newSet }
        }),
    }),
    {
      name: 'totalaud-scout-store',
      version: 1,
      // Only persist filters and addedToTimeline, not the opportunities data
      partialize: (state) => ({
        filters: state.filters,
        addedToTimeline: Array.from(state.addedToTimeline),
      }),
      // Rehydrate Set from array
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.addedToTimeline)) {
          state.addedToTimeline = new Set(state.addedToTimeline as unknown as string[])
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
