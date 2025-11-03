/**
 * useAssetFilters Hook
 * Phase 15.2-B: Multi-File UX + Agent Integration Layer
 *
 * Purpose:
 * - Manages filter/search/tag state for asset list
 * - Debounced search (400ms)
 * - Persists last filter to localStorage
 * - Type-safe filter state management
 *
 * Usage:
 * const {
 *   searchQuery,
 *   selectedKind,
 *   selectedTag,
 *   selectedCampaign,
 *   setSearchQuery,
 *   setSelectedKind,
 *   setSelectedTag,
 *   setSelectedCampaign,
 *   clearFilters
 * } = useAssetFilters()
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { logger } from '@/lib/logger'

const log = logger.scope('useAssetFilters')

const STORAGE_KEY = 'asset_filters'

export type AssetKind = 'audio' | 'image' | 'document' | 'archive' | 'link' | 'other' | null

export interface AssetFilters {
  searchQuery: string
  selectedKind: AssetKind
  selectedTag: string | null
  selectedCampaign: string | null
}

export interface UseAssetFiltersReturn extends AssetFilters {
  debouncedSearchQuery: string
  setSearchQuery: (query: string) => void
  setSelectedKind: (kind: AssetKind) => void
  setSelectedTag: (tag: string | null) => void
  setSelectedCampaign: (campaignId: string | null) => void
  clearFilters: () => void
  hasActiveFilters: boolean
}

/**
 * Load filters from localStorage
 */
function loadFiltersFromStorage(): Partial<AssetFilters> {
  if (typeof window === 'undefined') return {}

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return {}

    const parsed = JSON.parse(stored)
    log.debug('Loaded filters from localStorage', parsed)

    return parsed
  } catch (error) {
    log.warn('Failed to load filters from localStorage', error)
    return {}
  }
}

/**
 * Save filters to localStorage
 */
function saveFiltersToStorage(filters: AssetFilters): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
    log.debug('Saved filters to localStorage', filters)
  } catch (error) {
    log.warn('Failed to save filters to localStorage', error)
  }
}

/**
 * useAssetFilters Hook
 * Manages asset filter state with persistence and debouncing
 */
export function useAssetFilters(): UseAssetFiltersReturn {
  // Load initial state from localStorage
  const savedFilters = loadFiltersFromStorage()

  const [searchQuery, setSearchQueryState] = useState<string>(savedFilters.searchQuery || '')
  const [selectedKind, setSelectedKindState] = useState<AssetKind>(
    savedFilters.selectedKind || null
  )
  const [selectedTag, setSelectedTagState] = useState<string | null>(
    savedFilters.selectedTag || null
  )
  const [selectedCampaign, setSelectedCampaignState] = useState<string | null>(
    savedFilters.selectedCampaign || null
  )

  // Debounced search query (400ms)
  const debouncedSearchQuery = useDebounce(searchQuery, 400)

  /**
   * Update search query
   */
  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query)
    log.debug('Search query updated', { query })
  }, [])

  /**
   * Update selected kind filter
   */
  const setSelectedKind = useCallback((kind: AssetKind) => {
    setSelectedKindState(kind)
    log.debug('Kind filter updated', { kind })
  }, [])

  /**
   * Update selected tag filter
   */
  const setSelectedTag = useCallback((tag: string | null) => {
    setSelectedTagState(tag)
    log.debug('Tag filter updated', { tag })
  }, [])

  /**
   * Update selected campaign filter
   */
  const setSelectedCampaign = useCallback((campaignId: string | null) => {
    setSelectedCampaignState(campaignId)
    log.debug('Campaign filter updated', { campaignId })
  }, [])

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setSearchQueryState('')
    setSelectedKindState(null)
    setSelectedTagState(null)
    setSelectedCampaignState(null)

    log.debug('Filters cleared')
  }, [])

  /**
   * Check if any filters are active
   */
  const hasActiveFilters =
    searchQuery !== '' || selectedKind !== null || selectedTag !== null || selectedCampaign !== null

  /**
   * Persist filters to localStorage on change
   */
  useEffect(() => {
    const filters: AssetFilters = {
      searchQuery,
      selectedKind,
      selectedTag,
      selectedCampaign,
    }

    saveFiltersToStorage(filters)
  }, [searchQuery, selectedKind, selectedTag, selectedCampaign])

  return {
    searchQuery,
    debouncedSearchQuery,
    selectedKind,
    selectedTag,
    selectedCampaign,
    setSearchQuery,
    setSelectedKind,
    setSelectedTag,
    setSelectedCampaign,
    clearFilters,
    hasActiveFilters,
  }
}
