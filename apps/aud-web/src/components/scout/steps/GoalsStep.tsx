'use client'

import { motion } from 'framer-motion'
import type { ScoutWizardState, GoalOption } from '../ScoutWizard'

interface GoalsStepProps {
  state: ScoutWizardState
  updateState: (updates: Partial<ScoutWizardState>) => void
}

const GOALS: { id: GoalOption; label: string; description: string; icon: string }[] = [
  {
    id: 'playlist',
    label: 'Playlist Curators',
    description: 'Spotify, Apple Music, and independent playlist placements',
    icon: '📻',
  },
  {
    id: 'blog',
    label: 'Music Blogs',
    description: 'Reviews, features, and premiere opportunities',
    icon: '✍️',
  },
  {
    id: 'radio',
    label: 'Radio Stations',
    description: 'BBC, community radio, and online stations',
    icon: '📡',
  },
  {
    id: 'youtube',
    label: 'YouTube Channels',
    description: 'Music channels, reaction videos, and tastemakers',
    icon: '▶️',
  },
  {
    id: 'podcast',
    label: 'Podcasts',
    description: 'Music podcasts and interview opportunities',
    icon: '🎙️',
  },
]

const REGIONS = ['UK', 'US', 'Europe', 'Global']

export function GoalsStep({ state, updateState }: GoalsStepProps) {
  const toggleGoal = (goal: GoalOption) => {
    const current = state.goals
    if (current.includes(goal)) {
      updateState({ goals: current.filter((g) => g !== goal) })
    } else {
      updateState({ goals: [...current, goal] })
    }
  }

  const toggleRegion = (region: string) => {
    const current = state.targetRegions
    if (current.includes(region)) {
      // Don't allow removing all regions
      if (current.length > 1) {
        updateState({ targetRegions: current.filter((r) => r !== region) })
      }
    } else {
      updateState({ targetRegions: [...current, region] })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Step 3 of 5</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-100">
          What are you looking for?
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Tell Scout what kinds of opportunities you want to discover.
        </p>
      </div>

      {/* Goals selection */}
      <div className="space-y-3">
        <label className="block text-[11px] font-medium uppercase tracking-[0.15em] text-slate-400">
          Opportunity types <span className="text-rose-400">*</span>
          <span className="ml-2 normal-case tracking-normal text-slate-500">
            (select at least one)
          </span>
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          {GOALS.map((goal) => {
            const isSelected = state.goals.includes(goal.id)
            return (
              <motion.button
                key={goal.id}
                type="button"
                onClick={() => toggleGoal(goal.id)}
                className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? 'border-sky-500 bg-sky-500/10'
                    : 'border-slate-700 bg-slate-900/50 hover:border-slate-500'
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <span className="text-xl">{goal.icon}</span>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      isSelected ? 'text-sky-100' : 'text-slate-200'
                    }`}
                  >
                    {goal.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">{goal.description}</p>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Region selection */}
      <div className="space-y-3">
        <label className="block text-[11px] font-medium uppercase tracking-[0.15em] text-slate-400">
          Target regions
        </label>
        <div className="flex flex-wrap gap-2">
          {REGIONS.map((region) => {
            const isSelected = state.targetRegions.includes(region)
            return (
              <button
                key={region}
                type="button"
                onClick={() => toggleRegion(region)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-all ${
                  isSelected
                    ? 'border border-emerald-500 bg-emerald-500/20 text-emerald-100'
                    : 'border border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-500'
                }`}
              >
                {region}
              </button>
            )
          })}
        </div>
      </div>

      {/* Summary */}
      {state.goals.length > 0 && (
        <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/30 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
            Scout will search for
          </p>
          <p className="mt-1 text-sm text-slate-300">
            {state.goals.map((g) => GOALS.find((x) => x.id === g)?.label).join(', ')} in{' '}
            {state.targetRegions.join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}
