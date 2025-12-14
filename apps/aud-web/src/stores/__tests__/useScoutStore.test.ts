/**
 * Scout Store Tests
 * Testing opportunity filtering, fetching, and Timeline integration
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useScoutStore, selectFilteredOpportunities } from '../useScoutStore'
import type { Opportunity } from '@/types/scout'

// Mock opportunities
const mockOpportunities: Opportunity[] = [
  {
    id: '1',
    name: 'BBC Radio 6 Music',
    type: 'radio',
    genres: ['indie', 'rock'],
    vibes: ['edgy', 'alternative'],
    audienceSize: 'huge',
    description: 'National BBC radio station',
    source: 'curated',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Indie Vibes',
    type: 'playlist',
    genres: ['indie', 'pop'],
    vibes: ['chill', 'mellow'],
    audienceSize: 'medium',
    description: 'Curated indie playlist',
    source: 'curated',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    name: 'The Quietus',
    type: 'blog',
    genres: ['experimental', 'electronic'],
    vibes: ['avant-garde'],
    audienceSize: 'large',
    description: 'In-depth music journalism',
    source: 'curated',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
]

describe('useScoutStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useScoutStore())
    act(() => {
      result.current.setOpportunities([])
      result.current.resetFilters()
    })
  })

  describe('Basic State Management', () => {
    it('should initialize with empty opportunities', () => {
      const { result } = renderHook(() => useScoutStore())
      expect(result.current.opportunities).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('should set opportunities', () => {
      const { result } = renderHook(() => useScoutStore())

      act(() => {
        result.current.setOpportunities(mockOpportunities)
      })

      expect(result.current.opportunities).toEqual(mockOpportunities)
      expect(result.current.opportunities).toHaveLength(3)
    })

    it('should set loading state', () => {
      const { result } = renderHook(() => useScoutStore())

      act(() => {
        result.current.setLoading(true)
      })

      expect(result.current.loading).toBe(true)
    })

    it('should set error state', () => {
      const { result } = renderHook(() => useScoutStore())
      const errorMessage = 'Failed to fetch'

      act(() => {
        result.current.setError(errorMessage)
      })

      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('Filtering', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useScoutStore())
      act(() => {
        result.current.setOpportunities(mockOpportunities)
      })
    })

    it('should filter by type', () => {
      const { result } = renderHook(() => useScoutStore())

      act(() => {
        result.current.setFilter('type', 'radio')
      })

      const filtered = selectFilteredOpportunities(result.current)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].type).toBe('radio')
    })

    it('should filter by genre', () => {
      const { result } = renderHook(() => useScoutStore())

      act(() => {
        result.current.setFilter('genres', ['indie'])
      })

      const filtered = selectFilteredOpportunities(result.current)
      expect(filtered).toHaveLength(2) // Radio and Playlist both have 'indie'
      expect(filtered.every((o) => o.genres.includes('indie'))).toBe(true)
    })

    it('should filter by vibe', () => {
      const { result } = renderHook(() => useScoutStore())

      act(() => {
        result.current.setFilter('vibes', ['chill'])
      })

      const filtered = selectFilteredOpportunities(result.current)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].vibes.includes('chill')).toBe(true)
    })

    it('should filter by audience size', () => {
      const { result } = renderHook(() => useScoutStore())

      act(() => {
        result.current.setFilter('audienceSize', 'huge')
      })

      const filtered = selectFilteredOpportunities(result.current)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].audienceSize).toBe('huge')
    })

    it('should filter by search query', () => {
      const { result } = renderHook(() => useScoutStore())

      act(() => {
        result.current.setFilter('searchQuery', 'BBC')
      })

      const filtered = selectFilteredOpportunities(result.current)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toContain('BBC')
    })

    it('should combine multiple filters', () => {
      const { result } = renderHook(() => useScoutStore())

      act(() => {
        result.current.setFilter('type', 'playlist')
        result.current.setFilter('genres', ['indie'])
      })

      const filtered = selectFilteredOpportunities(result.current)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].type).toBe('playlist')
      expect(filtered[0].genres.includes('indie')).toBe(true)
    })

    it('should reset filters', () => {
      const { result } = renderHook(() => useScoutStore())

      act(() => {
        result.current.setFilter('type', 'radio')
        result.current.setFilter('genres', ['indie'])
        result.current.resetFilters()
      })

      expect(result.current.filters.type).toBe(null)
      expect(result.current.filters.genres).toEqual([])
      expect(result.current.filters.vibes).toEqual([])
      expect(result.current.filters.audienceSize).toBe(null)
      expect(result.current.filters.searchQuery).toBe('')
    })
  })

  describe('Selection', () => {
    it('should select an opportunity', () => {
      const { result } = renderHook(() => useScoutStore())

      act(() => {
        result.current.setOpportunities(mockOpportunities)
        result.current.selectOpportunity('1')
      })

      expect(result.current.selectedOpportunityId).toBe('1')
    })

    it('should deselect opportunity', () => {
      const { result } = renderHook(() => useScoutStore())

      act(() => {
        result.current.selectOpportunity('1')
        result.current.selectOpportunity(null)
      })

      expect(result.current.selectedOpportunityId).toBe(null)
    })
  })

  describe('Timeline Integration', () => {
    it('should mark opportunity as added to timeline', () => {
      const { result } = renderHook(() => useScoutStore())

      act(() => {
        result.current.markAddedToTimeline('1')
      })

      expect(result.current.addedToTimeline.has('1')).toBe(true)
    })

    it('should track multiple opportunities added to timeline', () => {
      const { result } = renderHook(() => useScoutStore())

      act(() => {
        result.current.markAddedToTimeline('1')
        result.current.markAddedToTimeline('2')
      })

      expect(result.current.addedToTimeline.has('1')).toBe(true)
      expect(result.current.addedToTimeline.has('2')).toBe(true)
      expect(result.current.addedToTimeline.size).toBe(2)
    })
  })

  describe('Persistence', () => {
    it('should persist filters to localStorage', () => {
      const { result } = renderHook(() => useScoutStore())

      act(() => {
        result.current.setFilter('type', 'radio')
        result.current.setFilter('genres', ['indie', 'rock'])
      })

      // Simulate page reload by creating new hook
      const { result: newResult } = renderHook(() => useScoutStore())

      expect(newResult.current.filters.type).toBe('radio')
      expect(newResult.current.filters.genres).toEqual(['indie', 'rock'])
    })

    it('should persist addedToTimeline set', () => {
      const { result } = renderHook(() => useScoutStore())

      act(() => {
        result.current.markAddedToTimeline('1')
        result.current.markAddedToTimeline('2')
      })

      // Simulate page reload
      const { result: newResult } = renderHook(() => useScoutStore())

      expect(newResult.current.addedToTimeline.has('1')).toBe(true)
      expect(newResult.current.addedToTimeline.has('2')).toBe(true)
    })
  })
})
