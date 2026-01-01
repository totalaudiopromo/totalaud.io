'use client'

import { useCallback, useState, useRef, useEffect } from 'react'
import {
  useScoutStore,
  selectFilteredOpportunities,
  selectOpportunityCountByType,
} from '@/stores/useScoutStore'
import type { OpportunityType } from '@/types/scout'
import { TYPE_LABELS, TYPE_COLOURS, SMART_PRESETS } from '@/types/scout'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

export function ScoutCalmToolbar() {
  const filters = useScoutStore((state) => state.filters)
  const setFilter = useScoutStore((state) => state.setFilter)
  const applyPreset = useScoutStore((state) => state.applyPreset)
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

  const handlePresetClick = useCallback(
    (preset: (typeof SMART_PRESETS)[number]) => {
      applyPreset(preset)
    },
    [applyPreset]
  )

  return (
    <div className="px-5 py-4 border-b border-white/5 bg-[#0F1113]/95 backdrop-blur-md sticky top-0 z-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input - Ambient Style */}
        <div className="relative group max-w-sm w-full md:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4 text-ta-grey/50 group-focus-within:text-ta-cyan transition-colors" />
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search contacts..."
            className="
              w-full md:w-64 pl-9 pr-8 py-2 text-sm
              bg-white/5 border border-white/10
              rounded-xl text-ta-white placeholder:text-ta-grey/50
              focus:outline-none focus:bg-white/10 focus:border-ta-cyan/30 focus:ring-1 focus:ring-ta-cyan/20
              transition-all duration-300
            "
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch('')}
              aria-label="Clear search"
              className="absolute inset-y-0 right-0 pr-2 flex items-center text-ta-grey/50 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          {/* Input focus glow */}
          <div className="absolute inset-0 -z-10 bg-ta-cyan/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 rounded-xl" />
        </div>

        {/* Smart Presets - Simplified Filters */}
        <div
          role="tablist"
          aria-label="Filter opportunities by preset"
          className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0"
        >
          {SMART_PRESETS.map((preset) => {
            const isActive =
              (preset.label === 'All' && !filters.type) || filters.type === preset.filters.type
            const count =
              preset.label === 'All'
                ? totalOpportunities
                : preset.filters.type
                  ? countByType[preset.filters.type] || 0
                  : 0

            return (
              <button
                key={preset.label}
                role="tab"
                aria-selected={isActive}
                aria-controls="scout-grid"
                onClick={() => handlePresetClick(preset)}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 whitespace-nowrap
                  ${
                    isActive
                      ? 'bg-white text-ta-black border-white'
                      : 'bg-transparent text-ta-grey border-white/10 hover:border-white/20 hover:text-white'
                  }
                `}
              >
                {preset.label}
                {count > 0 && (
                  <span
                    aria-label={`${count} ${preset.label} opportunities`}
                    className={`text-[10px] ${isActive ? 'text-ta-black/60' : 'text-ta-grey/60'}`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              aria-label="Reset all filters"
              className="ml-auto md:ml-2 text-xs text-ta-cyan hover:text-ta-cyan/80 whitespace-nowrap px-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
