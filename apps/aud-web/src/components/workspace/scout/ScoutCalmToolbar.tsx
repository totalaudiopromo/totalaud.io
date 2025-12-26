'use client'

import { useCallback, useState } from 'react'
import {
  useScoutStore,
  selectFilteredOpportunities,
  selectOpportunityCountByType,
} from '@/stores/useScoutStore'
import type { OpportunityType } from '@/types/scout'
import { TYPE_LABELS, TYPE_COLOURS } from '@/types/scout'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useSearchDebounce } from '@/hooks/useSearchDebounce'

const TYPES: OpportunityType[] = ['playlist', 'radio', 'blog', 'press', 'curator']

export function ScoutCalmToolbar() {
  const filters = useScoutStore((state) => state.filters)
  const setFilter = useScoutStore((state) => state.setFilter)
  const resetFilters = useScoutStore((state) => state.resetFilters)
  const totalOpportunities = useScoutStore((state) => state.opportunities.length)
  const filteredCount = useScoutStore(selectFilteredOpportunities).length
  const countByType = useScoutStore(selectOpportunityCountByType)

  const [localSearch, setLocalSearch] = useSearchDebounce(
    (searchValue) => setFilter('searchQuery', searchValue),
    filters.searchQuery,
    150
  )

  const hasActiveFilters = filters.type || filters.genres.length > 0 || filters.searchQuery

  const handleTypeFilter = useCallback(
    (type: OpportunityType | null) => {
      setFilter('type', type)
    },
    [setFilter]
  )

  return (
    <div className="px-5 py-4 border-b border-white/5 bg-[#0F1113]/95 backdrop-blur-md sticky top-0 z-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input - Ambient Style */}
        <div className="relative group max-w-sm w-full md:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4 text-tap-grey/50 group-focus-within:text-tap-cyan transition-colors" />
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search contacts..."
            className="
              w-full md:w-64 pl-9 pr-8 py-2 text-sm
              bg-white/5 border border-white/10
              rounded-xl text-tap-white placeholder:text-tap-grey/50
              focus:outline-none focus:bg-white/10 focus:border-tap-cyan/30 focus:ring-1 focus:ring-tap-cyan/20
              transition-all duration-300
            "
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch('')}
              className="absolute inset-y-0 right-0 pr-2 flex items-center text-tap-grey/50 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
          {/* Input focus glow */}
          <div className="absolute inset-0 -z-10 bg-tap-cyan/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 rounded-xl" />
        </div>

        {/* Filters & Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0">
          <button
            onClick={() => handleTypeFilter(null)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200
              ${
                !filters.type
                  ? 'bg-white text-tap-black border-white'
                  : 'bg-transparent text-tap-grey border-white/10 hover:border-white/20 hover:text-white'
              }
            `}
          >
            All
            <span
              className={`text-[10px] ${!filters.type ? 'text-tap-black/60' : 'text-tap-grey/60'}`}
            >
              {totalOpportunities}
            </span>
          </button>

          <div className="w-px h-4 bg-white/10 mx-1" />

          {TYPES.map((type) => {
            const colour = TYPE_COLOURS[type]
            const count = countByType[type] || 0
            const isActive = filters.type === type

            return (
              <button
                key={type}
                onClick={() => handleTypeFilter(type)}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 whitespace-nowrap
                  ${
                    isActive
                      ? `border-opacity-100 bg-opacity-10`
                      : 'bg-transparent border-transparent text-tap-grey hover:bg-white/5 hover:text-white'
                  }
                `}
                style={{
                  borderColor: isActive ? colour.border : 'transparent',
                  backgroundColor: isActive ? `${colour.bg}10` : undefined,
                  color: isActive ? colour.text : undefined,
                }}
              >
                {TYPE_LABELS[type]}
                {count > 0 && <span className="opacity-60 text-[10px]">{count}</span>}
              </button>
            )
          })}

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="ml-auto md:ml-2 text-xs text-tap-cyan hover:text-tap-cyan/80 whitespace-nowrap px-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
