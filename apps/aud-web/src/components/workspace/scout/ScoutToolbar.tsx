/**
 * ScoutToolbar Component
 *
 * Phase 3: MVP Pivot - Scout Mode
 *
 * Toolbar with search, type filters, and filter dropdowns.
 * Calm, minimal design matching IdeasToolbar aesthetic.
 */

'use client'

import { useCallback, useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useScoutStore,
  selectFilteredOpportunities,
  selectOpportunityCountByType,
} from '@/stores/useScoutStore'
import type { OpportunityType, AudienceSize } from '@/types/scout'
import {
  TYPE_LABELS,
  TYPE_COLOURS,
  TYPE_ICONS,
  AUDIENCE_SIZE_LABELS,
  GENRE_OPTIONS,
} from '@/types/scout'

// Simple SVG icons
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
)

const ChevronIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9l6 6 6-6" />
  </svg>
)

const TYPES: OpportunityType[] = ['radio', 'playlist', 'blog', 'curator', 'press']
const AUDIENCE_SIZES: AudienceSize[] = ['small', 'medium', 'large']

export function ScoutToolbar() {
  const filters = useScoutStore((state) => state.filters)
  const setFilter = useScoutStore((state) => state.setFilter)
  const resetFilters = useScoutStore((state) => state.resetFilters)
  const totalOpportunities = useScoutStore((state) => state.opportunities.length)
  const filteredOpportunities = useScoutStore(selectFilteredOpportunities)
  const countByType = useScoutStore(selectOpportunityCountByType)

  // Dropdown states
  const [genreOpen, setGenreOpen] = useState(false)
  const [sizeOpen, setSizeOpen] = useState(false)

  // Refs for click outside
  const genreRef = useRef<HTMLDivElement>(null)
  const sizeRef = useRef<HTMLDivElement>(null)

  // Search debounce
  const [localSearch, setLocalSearch] = useState(filters.searchQuery)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setFilter('searchQuery', localSearch)
    }, 150)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [localSearch, setFilter])

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (genreRef.current && !genreRef.current.contains(e.target as Node)) {
        setGenreOpen(false)
      }
      if (sizeRef.current && !sizeRef.current.contains(e.target as Node)) {
        setSizeOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleTypeFilter = useCallback(
    (type: OpportunityType | null) => {
      setFilter('type', type)
    },
    [setFilter]
  )

  const handleGenreToggle = useCallback(
    (genre: string) => {
      const currentGenres = filters.genres
      const newGenres = currentGenres.includes(genre)
        ? currentGenres.filter((g) => g !== genre)
        : [...currentGenres, genre]
      setFilter('genres', newGenres)
    },
    [filters.genres, setFilter]
  )

  const handleSizeFilter = useCallback(
    (size: AudienceSize | null) => {
      setFilter('audienceSize', size)
      setSizeOpen(false)
    },
    [setFilter]
  )

  const hasActiveFilters =
    filters.type !== null ||
    filters.genres.length > 0 ||
    filters.audienceSize !== null ||
    filters.searchQuery.trim() !== ''

  const buttonBase = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 12px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 400,
    color: 'rgba(255, 255, 255, 0.9)',
    cursor: 'pointer',
    transition: 'all 0.16s ease',
    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
  } as const

  const dropdownStyle = {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    marginTop: 4,
    minWidth: 180,
    maxHeight: 280,
    overflowY: 'auto' as const,
    backgroundColor: 'rgba(15, 17, 19, 0.98)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
    padding: 4,
    zIndex: 50,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  }

  const dropdownItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '8px 12px',
    textAlign: 'left' as const,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    transition: 'background-color 0.12s ease',
    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        padding: '10px 12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        backgroundColor: 'rgba(15, 17, 19, 0.95)',
        backdropFilter: 'blur(8px)',
        minHeight: 52,
        flexWrap: 'wrap',
      }}
    >
      {/* Left: Type filter tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexShrink: 1,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          minWidth: 0,
          flex: '1 1 auto',
        }}
      >
        {/* All tab */}
        <button
          onClick={() => handleTypeFilter(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 12px',
            backgroundColor: filters.type === null ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
            border: 'none',
            borderRadius: 4,
            fontSize: 12,
            fontWeight: filters.type === null ? 500 : 400,
            color: filters.type === null ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.85)',
            cursor: 'pointer',
            transition: 'all 0.16s ease',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            whiteSpace: 'nowrap',
          }}
        >
          All
          <span
            style={{
              fontSize: 10,
              padding: '1px 5px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
            }}
          >
            {totalOpportunities}
          </span>
        </button>

        {/* Type tabs */}
        {TYPES.map((type) => {
          const colour = TYPE_COLOURS[type]
          const count = countByType[type] || 0
          const isActive = filters.type === type

          return (
            <button
              key={type}
              onClick={() => handleTypeFilter(type)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '10px 12px',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                border: 'none',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? colour.text : 'rgba(255, 255, 255, 0.85)',
                cursor: 'pointer',
                transition: 'all 0.16s ease',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 10, opacity: isActive ? 1 : 0.6 }}>{TYPE_ICONS[type]}</span>
              {TYPE_LABELS[type]}
              {count > 0 && (
                <span
                  style={{
                    fontSize: 10,
                    padding: '1px 5px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 8,
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Centre: Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flex: '0 1 180px',
          minWidth: 100,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flex: 1,
            padding: '6px 10px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 4,
          }}
        >
          <span style={{ color: 'rgba(255, 255, 255, 0.8)', display: 'flex' }}>
            <SearchIcon />
          </span>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search opportunities..."
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 12,
              color: 'rgba(255, 255, 255, 0.9)',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch('')}
              style={{
                padding: 0,
                backgroundColor: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.8)',
                cursor: 'pointer',
                fontSize: 14,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Right: Filter dropdowns + Clear */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexShrink: 0,
        }}
      >
        {/* Genre dropdown */}
        <div ref={genreRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setGenreOpen(!genreOpen)}
            style={{
              ...buttonBase,
              backgroundColor:
                genreOpen || filters.genres.length > 0
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'transparent',
              color: filters.genres.length > 0 ? '#3AA9BE' : 'rgba(255, 255, 255, 0.6)',
            }}
          >
            Genre
            {filters.genres.length > 0 && (
              <span
                style={{
                  fontSize: 10,
                  padding: '1px 5px',
                  backgroundColor: 'rgba(58, 169, 190, 0.2)',
                  borderRadius: 8,
                  color: '#3AA9BE',
                }}
              >
                {filters.genres.length}
              </span>
            )}
            <ChevronIcon />
          </button>
          <AnimatePresence>
            {genreOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16 }}
                style={dropdownStyle}
              >
                {GENRE_OPTIONS.map((genre) => {
                  const isSelected = filters.genres.includes(genre)
                  return (
                    <button
                      key={genre}
                      onClick={() => handleGenreToggle(genre)}
                      style={{
                        ...dropdownItemStyle,
                        backgroundColor: isSelected ? 'rgba(58, 169, 190, 0.1)' : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isSelected
                          ? 'rgba(58, 169, 190, 0.1)'
                          : 'transparent'
                      }}
                    >
                      <span
                        style={{
                          width: 16,
                          height: 16,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: isSelected ? '#3AA9BE' : 'rgba(255, 255, 255, 0.1)',
                          borderRadius: 3,
                          fontSize: 10,
                          color: isSelected ? '#0F1113' : 'transparent',
                        }}
                      >
                        {isSelected && '✓'}
                      </span>
                      {genre}
                    </button>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Audience size dropdown */}
        <div ref={sizeRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setSizeOpen(!sizeOpen)}
            style={{
              ...buttonBase,
              backgroundColor:
                sizeOpen || filters.audienceSize !== null
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'transparent',
              color: filters.audienceSize !== null ? '#3AA9BE' : 'rgba(255, 255, 255, 0.6)',
            }}
          >
            {filters.audienceSize ? AUDIENCE_SIZE_LABELS[filters.audienceSize] : 'Size'}
            <ChevronIcon />
          </button>
          <AnimatePresence>
            {sizeOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16 }}
                style={{ ...dropdownStyle, minWidth: 140 }}
              >
                <button
                  onClick={() => handleSizeFilter(null)}
                  style={{
                    ...dropdownItemStyle,
                    backgroundColor:
                      filters.audienceSize === null ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      filters.audienceSize === null ? 'rgba(255, 255, 255, 0.06)' : 'transparent'
                  }}
                >
                  Any size
                </button>
                {AUDIENCE_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeFilter(size)}
                    style={{
                      ...dropdownItemStyle,
                      backgroundColor:
                        filters.audienceSize === size ? 'rgba(58, 169, 190, 0.1)' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (filters.audienceSize !== size) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        filters.audienceSize === size ? 'rgba(58, 169, 190, 0.1)' : 'transparent'
                    }}
                  >
                    {AUDIENCE_SIZE_LABELS[size]}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={resetFilters}
            style={{
              ...buttonBase,
              color: 'rgba(255, 255, 255, 0.85)',
              borderColor: 'rgba(255, 255, 255, 0.06)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 1)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'
            }}
          >
            Clear
          </motion.button>
        )}

        {/* Results count */}
        <span
          style={{
            fontSize: 11,
            color: 'rgba(255, 255, 255, 0.8)',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            whiteSpace: 'nowrap',
          }}
        >
          {filteredOpportunities.length} result{filteredOpportunities.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}
