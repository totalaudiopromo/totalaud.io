'use client'

import type { ScoutWizardState, GoalOption } from '../ScoutWizard'

interface GoalsStepProps {
  state: ScoutWizardState
  updateState: (updates: Partial<ScoutWizardState>) => void
}

const GOALS: { id: GoalOption; label: string; description: string }[] = [
  {
    id: 'playlist',
    label: 'Playlist Curators',
    description: 'Spotify, Apple Music, and independent playlist placements',
  },
  {
    id: 'blog',
    label: 'Music Blogs',
    description: 'Reviews, features, and premiere opportunities',
  },
  {
    id: 'radio',
    label: 'Radio Stations',
    description: 'BBC, community radio, and online stations',
  },
  {
    id: 'youtube',
    label: 'YouTube Channels',
    description: 'Music channels, reaction videos, and tastemakers',
  },
  {
    id: 'podcast',
    label: 'Podcasts',
    description: 'Music podcasts and interview opportunities',
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
      if (current.length > 1) {
        updateState({ targetRegions: current.filter((r) => r !== region) })
      }
    } else {
      updateState({ targetRegions: [...current, region] })
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#6B7280]">
          Step 3 of 5
        </p>
        <h2 className="mt-3 text-[18px] font-semibold tracking-[-0.01em] text-[#E8EAED]">
          What are you looking for?
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-[#A9B3BF]">
          Tell Scout what kinds of opportunities you want to discover.
        </p>
      </div>

      {/* Goals selection */}
      <div className="space-y-3">
        <label className="block text-[13px] font-medium text-[#A9B3BF]">
          Opportunity types <span className="text-[#C45252]">*</span>
          <span className="ml-2 font-normal text-[#6B7280]">(select at least one)</span>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          {GOALS.map((goal) => {
            const isSelected = state.goals.includes(goal.id)
            return (
              <button
                key={goal.id}
                type="button"
                onClick={() => toggleGoal(goal.id)}
                className={`rounded-[6px] border p-4 text-left transition-all duration-[120ms] ${
                  isSelected
                    ? 'border-[#3AA9BE] bg-[rgba(58,169,190,0.08)]'
                    : 'border-[#1F2327] bg-[#131619] hover:border-[#2A2E33]'
                }`}
              >
                <p
                  className={`text-[14px] font-medium ${
                    isSelected ? 'text-[#3AA9BE]' : 'text-[#E8EAED]'
                  }`}
                >
                  {goal.label}
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-[#6B7280]">
                  {goal.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Region selection */}
      <div className="space-y-3">
        <label className="block text-[13px] font-medium text-[#A9B3BF]">Target regions</label>
        <div className="flex flex-wrap gap-2">
          {REGIONS.map((region) => {
            const isSelected = state.targetRegions.includes(region)
            return (
              <button
                key={region}
                type="button"
                onClick={() => toggleRegion(region)}
                className={`rounded-[4px] px-3 py-1.5 text-[13px] font-medium transition-all duration-[120ms] ${
                  isSelected
                    ? 'border border-[#49A36C] bg-[rgba(73,163,108,0.15)] text-[#49A36C]'
                    : 'border border-[#1F2327] bg-[#1A1D21] text-[#A9B3BF] hover:border-[#2A2E33]'
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
        <div className="rounded-[6px] border border-[#1F2327] bg-[#131619] px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#6B7280]">
            Scout will search for
          </p>
          <p className="mt-1 text-[14px] text-[#A9B3BF]">
            {state.goals.map((g) => GOALS.find((x) => x.id === g)?.label).join(', ')} in{' '}
            {state.targetRegions.join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}
