/**
 * Scout Calm Toolbar
 *
 * Balanced toolbar - shows filters but not overwhelming
 */

'use client'

import { useCallback, useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useScoutStore,
  selectFilteredOpportunities,
  selectOpportunityCountByType,
} from '@/stores/useScoutStore'
import type { OpportunityType } from '@/types/scout'
import { TYPE_LABELS, TYPE_COLOURS } from '@/types/scout'

const TYPES: OpportunityType[] = ['playlist', 'radio', 'blog', 'press', 'curator']

export function ScoutCalmToolbar() {
  const filters = useScoutStore((state) => state.filters)
  const setFilter = useScoutStore((state) => state.setFilter)
  const resetFilters = useScoutStore((state) => state.resetFilters)
  const totalOpportunities = useScoutStore((state) => state.opportunities.length)
  const filteredCount = useScoutStore(selectFilteredOpportunities).length
  const countByType = useScoutStore(selectOpportunityCountByType)

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

  const hasActiveFilters = filters.type || filters.genres.length > 0 || filters.searchQuery

  const handleTypeFilter = useCallback(
    (type: OpportunityType | null) => {
      setFilter('type', type)
    },
    [setFilter]
  )

  return (
    <div className="px-5 py-3 border-b border-white/[0.05] bg-[#0F1113]/80 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        {/* Type tabs */}
        <div className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-hide">
          {/* All tab */}
          <button
            onClick={() => handleTypeFilter(null)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm
              transition-all duration-150 whitespace-nowrap
              ${
                !filters.type
                  ? 'bg-white/[0.08] text-white/90 font-medium'
                  : 'text-white/40 hover:text-white/60'
              }
            `}
          >
            All
            <span className="text-[10px] text-white/30 tabular-nums">{totalOpportunities}</span>
          </button>

          {TYPES.map((type) => {
            const colour = TYPE_COLOURS[type]
            const count = countByType[type] || 0
            const isActive = filters.type === type

            return (
              <button
                key={type}
                onClick={() => handleTypeFilter(type)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm
                  transition-all duration-150 whitespace-nowrap
                  ${isActive ? 'bg-white/[0.08] font-medium' : 'text-white/40 hover:text-white/60'}
                `}
                style={{ color: isActive ? colour.text : undefined }}
              >
                {TYPE_LABELS[type]}
                {count > 0 && <span className="text-[10px] opacity-50 tabular-nums">{count}</span>}
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search..."
              className="
                w-40 px-3 py-1.5 text-sm
                bg-white/[0.03] border border-white/[0.06]
                rounded-md text-white placeholder-white/25
                focus:outline-none focus:border-white/[0.12] focus:w-56
                transition-all duration-200
              "
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/50 text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Clear + Count */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-white/30 hover:text-white/50 transition-colors"
            >
              Clear
            </button>
          )}

          <span className="text-xs text-white/25 tabular-nums">{filteredCount}</span>
        </div>
      </div>
    </div>
  )
}
