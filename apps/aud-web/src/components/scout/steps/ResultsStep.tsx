'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import type { ScoutWizardState, Opportunity, GoalOption } from '../ScoutWizard'
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
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Step 5 of 5</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-100">
            Your opportunities
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Found {state.opportunities.length} matches for "{state.trackTitle}"
          </p>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400 hover:border-slate-500 hover:text-slate-200"
        >
          New search
        </button>
      </div>

      {/* Type filter tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
            filterType === 'all'
              ? 'bg-slate-700 text-slate-100'
              : 'bg-slate-800/50 text-slate-400 hover:text-slate-200'
          }`}
        >
          All ({state.opportunities.length})
        </button>
        {Object.entries(typeStats).map(([type, count]) => (
          <button
            key={type}
            type="button"
            onClick={() => setFilterType(type as GoalOption)}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
              filterType === type
                ? 'bg-slate-700 text-slate-100'
                : 'bg-slate-800/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            {TYPE_LABELS[type as GoalOption]} ({count})
          </button>
        ))}
      </div>

      {/* Selection controls */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={selectedIds.size > 0 ? deselectAll : selectAll}
            className="text-[11px] text-sky-400 hover:text-sky-300"
          >
            {selectedIds.size > 0 ? 'Deselect all' : 'Select all'}
          </button>
          {selectedIds.size > 0 && (
            <span className="text-[11px] text-slate-400">{selectedIds.size} selected</span>
          )}
        </div>

        {selectedIds.size > 0 && <ExportOptions opportunities={selectedOpportunities} />}
      </div>

      {/* Results list */}
      {filteredOpportunities.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-slate-400">No opportunities found</p>
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
