'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import type { ScoutWizardState, GoalOption } from '../ScoutWizard'
import { OpportunityCard } from '../results/OpportunityCard'
import { ExportOptions } from '../results/ExportOptions'

interface ResultsStepProps {
  state: ScoutWizardState
  onReset: () => void
}

const TYPE_LABELS: Record<GoalOption, string> = {
  playlist: 'Playlists',
  blog: 'Blogs',
  radio: 'Radio',
  youtube: 'YouTube',
  podcast: 'Podcasts',
}

export function ResultsStep({ state, onReset }: ResultsStepProps) {
  const [filterType, setFilterType] = useState<GoalOption | 'all'>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const filteredOpportunities = state.opportunities.filter(
    (opp) => filterType === 'all' || opp.type === filterType
  )

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(filteredOpportunities.map((o) => o.id)))
  }, [filteredOpportunities])

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  // Group opportunities by type for stats
  const typeStats = state.opportunities.reduce(
    (acc, opp) => {
      acc[opp.type] = (acc[opp.type] || 0) + 1
      return acc
    },
    {} as Record<GoalOption, number>
  )

  const selectedOpportunities = state.opportunities.filter((o) => selectedIds.has(o.id))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#6B7280]">
            Step 5 of 5
          </p>
          <h2 className="mt-3 text-[18px] font-semibold tracking-[-0.01em] text-[#E8EAED]">
            Your opportunities
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-[#A9B3BF]">
            Found {state.opportunities.length} matches for "{state.trackTitle}"
          </p>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="rounded-[4px] border border-[#1F2327] bg-[#1A1D21] px-3 py-1.5 text-[12px] font-medium text-[#A9B3BF] transition-all duration-[120ms] hover:border-[#2A2E33] hover:text-[#E8EAED]"
        >
          New search
        </button>
      </div>

      {/* Type filter tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`rounded-[4px] px-3 py-1.5 text-[13px] font-medium transition-all duration-[120ms] ${
            filterType === 'all'
              ? 'border border-[#3AA9BE] bg-[rgba(58,169,190,0.1)] text-[#3AA9BE]'
              : 'border border-[#1F2327] bg-[#1A1D21] text-[#A9B3BF] hover:border-[#2A2E33]'
          }`}
        >
          All ({state.opportunities.length})
        </button>
        {Object.entries(typeStats).map(([type, count]) => (
          <button
            key={type}
            type="button"
            onClick={() => setFilterType(type as GoalOption)}
            className={`rounded-[4px] px-3 py-1.5 text-[13px] font-medium transition-all duration-[120ms] ${
              filterType === type
                ? 'border border-[#3AA9BE] bg-[rgba(58,169,190,0.1)] text-[#3AA9BE]'
                : 'border border-[#1F2327] bg-[#1A1D21] text-[#A9B3BF] hover:border-[#2A2E33]'
            }`}
          >
            {TYPE_LABELS[type as GoalOption]} ({count})
          </button>
        ))}
      </div>

      {/* Selection controls */}
      <div className="flex items-center justify-between border-b border-[#1F2327] pb-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={selectedIds.size > 0 ? deselectAll : selectAll}
            className="text-[13px] text-[#3AA9BE] transition-colors duration-[120ms] hover:text-[#4FBDD0]"
          >
            {selectedIds.size > 0 ? 'Deselect all' : 'Select all'}
          </button>
          {selectedIds.size > 0 && (
            <span className="text-[12px] text-[#6B7280]">{selectedIds.size} selected</span>
          )}
        </div>

        {selectedIds.size > 0 && <ExportOptions opportunities={selectedOpportunities} />}
      </div>

      {/* Results list */}
      {filteredOpportunities.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-[14px] text-[#6B7280]">No opportunities found</p>
        </div>
      ) : (
        <motion.div
          className="space-y-3"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.05,
              },
            },
          }}
        >
          {filteredOpportunities.map((opportunity) => (
            <motion.div
              key={opportunity.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <OpportunityCard
                opportunity={opportunity}
                isSelected={selectedIds.has(opportunity.id)}
                onToggleSelect={() => toggleSelect(opportunity.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
