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

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

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
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)

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

  const handleSave = useCallback(async () => {
    if (selectedIds.size === 0) return

    setSaveStatus('saving')
    setSaveError(null)

    try {
      const response = await fetch('/api/scout/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunities: selectedOpportunities.map((opp) => ({
            contactId: opp.id.startsWith('mock-') ? null : opp.id,
            searchTrackTitle: state.trackTitle,
            searchGenres: state.genres,
            searchGoals: state.goals,
            searchVibe: state.vibe,
            type: opp.type,
            name: opp.name,
            contactName: opp.contact.name,
            contactEmail: opp.contact.email,
            contactSubmissionUrl: opp.contact.submissionUrl,
            relevanceScore: opp.relevanceScore,
            genres: opp.genres,
            pitchTips: opp.pitchTips,
            source: opp.source,
          })),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save')
      }

      setSaveStatus('saved')
      // Reset to idle after showing success
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Save error:', error)
      setSaveError(error instanceof Error ? error.message : 'Failed to save opportunities')
      setSaveStatus('error')
    }
  }, [selectedIds, selectedOpportunities, state])

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

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            {/* Save button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className={`flex items-center gap-1.5 rounded-[4px] px-3 py-1.5 text-[12px] font-medium transition-all duration-[120ms] ${
                saveStatus === 'saved'
                  ? 'border border-[#49A36C]/40 bg-[rgba(73,163,108,0.08)] text-[#49A36C]'
                  : saveStatus === 'error'
                    ? 'border border-[#C45252]/40 bg-[rgba(196,82,82,0.08)] text-[#C45252]'
                    : 'border border-[#49A36C]/40 bg-[rgba(73,163,108,0.08)] text-[#49A36C] hover:border-[#49A36C]/60 hover:bg-[rgba(73,163,108,0.12)]'
              }`}
            >
              {saveStatus === 'saving' && <span className="inline-block animate-spin">+</span>}
              {saveStatus === 'saved' && <span>+</span>}
              {saveStatus === 'error' && <span>!</span>}
              <span>
                {saveStatus === 'saving'
                  ? 'Saving...'
                  : saveStatus === 'saved'
                    ? 'Saved'
                    : saveStatus === 'error'
                      ? 'Error'
                      : 'Save selected'}
              </span>
            </button>

            <ExportOptions opportunities={selectedOpportunities} />
          </div>
        )}
      </div>

      {/* Save error message */}
      {saveError && (
        <div className="rounded-[4px] border border-[#C45252]/30 bg-[rgba(196,82,82,0.08)] px-3 py-2 text-[12px] text-[#C45252]">
          {saveError}
        </div>
      )}

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
