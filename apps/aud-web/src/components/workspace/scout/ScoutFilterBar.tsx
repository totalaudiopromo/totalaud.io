/**
 * Scout Filter Bar
 *
 * Clean, focused filtering for Scout Mode
 * Uses the actual store filter interface
 */

'use client'

import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScoutStore } from '@/stores/useScoutStore'
import {
  GENRE_OPTIONS,
  TYPE_LABELS,
  AUDIENCE_SIZE_LABELS,
  type OpportunityType,
  type AudienceSize,
} from '@/types/scout'

// Available filter options
const OPPORTUNITY_TYPES: { value: OpportunityType; label: string }[] = [
  { value: 'playlist', label: 'Playlists' },
  { value: 'blog', label: 'Blogs' },
  { value: 'radio', label: 'Radio' },
  { value: 'press', label: 'Press' },
  { value: 'curator', label: 'Curators' },
]

const GENRES = GENRE_OPTIONS.slice(0, 12).map((g) => ({ value: g.toLowerCase(), label: g }))

const AUDIENCE_SIZES: { value: AudienceSize; label: string }[] = [
  { value: 'small', label: 'Emerging' },
  { value: 'medium', label: 'Growing' },
  { value: 'large', label: 'Established' },
]

interface FilterChipProps {
  label: string
  active: boolean
  onClick: () => void
}

function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 text-sm font-medium rounded-md
        transition-colors duration-150
        ${
          active
            ? 'bg-[#3AA9BE]/15 text-[#3AA9BE] border border-[#3AA9BE]/25'
            : 'bg-white/[0.03] text-white/50 border border-white/[0.06] hover:bg-white/[0.05] hover:text-white/70'
        }
      `}
    >
      {label}
    </button>
  )
}

interface ScoutFilterBarProps {
  totalCount?: number
  filteredCount?: number
}

export function ScoutFilterBar({ totalCount, filteredCount }: ScoutFilterBarProps) {
  const filters = useScoutStore((state) => state.filters)
  const setFilter = useScoutStore((state) => state.setFilter)
  const resetFilters = useScoutStore((state) => state.resetFilters)

  const [showGenres, setShowGenres] = useState(false)
  const [showAudience, setShowAudience] = useState(false)

  const hasActiveFilters =
    filters.type || filters.genres.length > 0 || filters.audienceSize || filters.searchQuery

  const handleTypeFilter = useCallback(
    (type: OpportunityType) => {
      setFilter('type', filters.type === type ? null : type)
    },
    [filters.type, setFilter]
  )

  const handleGenreFilter = useCallback(
    (genre: string) => {
      const current = filters.genres
      const updated = current.includes(genre)
        ? current.filter((g) => g !== genre)
        : [...current, genre]
      setFilter('genres', updated)
    },
    [filters.genres, setFilter]
  )

  const handleAudienceFilter = useCallback(
    (size: AudienceSize) => {
      setFilter('audienceSize', filters.audienceSize === size ? null : size)
    },
    [filters.audienceSize, setFilter]
  )

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilter('searchQuery', e.target.value)
    },
    [setFilter]
  )

  return (
    <div className="space-y-4 mb-6">
      {/* Search + Results Count */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search opportunities..."
            value={filters.searchQuery || ''}
            onChange={handleSearchChange}
            className="
              w-full px-4 py-2 text-sm
              bg-white/[0.03] border border-white/[0.08]
              rounded-lg text-white placeholder-white/30
              focus:outline-none focus:border-[#3AA9BE]/40 focus:bg-white/[0.04]
              transition-colors duration-150
            "
          />
        </div>

        {totalCount !== undefined && (
          <span className="text-sm text-white/40">
            {filteredCount !== undefined && filteredCount !== totalCount
              ? `${filteredCount} of ${totalCount}`
              : totalCount}{' '}
            opportunities
          </span>
        )}
      </div>

      {/* Type Filters - Always Visible */}
      <div className="flex flex-wrap gap-2">
        {OPPORTUNITY_TYPES.map((type) => (
          <FilterChip
            key={type.value}
            label={type.label}
            active={filters.type === type.value}
            onClick={() => handleTypeFilter(type.value)}
          />
        ))}

        <div className="w-px h-6 bg-white/10 mx-1 self-center" />

        {/* Genre Toggle */}
        <button
          onClick={() => {
            setShowGenres(!showGenres)
            setShowAudience(false)
          }}
          className={`
            px-3 py-1.5 text-sm font-medium rounded-md
            transition-colors duration-150
            ${
              filters.genres.length > 0 || showGenres
                ? 'bg-[#3AA9BE]/15 text-[#3AA9BE] border border-[#3AA9BE]/25'
                : 'bg-white/[0.03] text-white/50 border border-white/[0.06] hover:bg-white/[0.05]'
            }
          `}
        >
          Genre {filters.genres.length > 0 && `(${filters.genres.length})`}
        </button>

        {/* Audience Toggle */}
        <button
          onClick={() => {
            setShowAudience(!showAudience)
            setShowGenres(false)
          }}
          className={`
            px-3 py-1.5 text-sm font-medium rounded-md
            transition-colors duration-150
            ${
              filters.audienceSize || showAudience
                ? 'bg-[#3AA9BE]/15 text-[#3AA9BE] border border-[#3AA9BE]/25'
                : 'bg-white/[0.03] text-white/50 border border-white/[0.06] hover:bg-white/[0.05]'
            }
          `}
        >
          Size {filters.audienceSize && `· ${AUDIENCE_SIZE_LABELS[filters.audienceSize]}`}
        </button>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="px-3 py-1.5 text-sm text-white/40 hover:text-white/60 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Expandable Genre Filter */}
      <AnimatePresence>
        {showGenres && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 pt-3 border-t border-white/[0.05]">
              {GENRES.map((genre) => (
                <FilterChip
                  key={genre.value}
                  label={genre.label}
                  active={filters.genres.includes(genre.value)}
                  onClick={() => handleGenreFilter(genre.value)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {showAudience && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 pt-3 border-t border-white/[0.05]">
              {AUDIENCE_SIZES.map((size) => (
                <FilterChip
                  key={size.value}
                  label={size.label}
                  active={filters.audienceSize === size.value}
                  onClick={() => handleAudienceFilter(size.value)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
