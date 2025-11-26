'use client'

import { useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import type { ScoutWizardState, Opportunity } from '../ScoutWizard'

interface DiscoveryStepProps {
  state: ScoutWizardState
  updateState: (updates: Partial<ScoutWizardState>) => void
  onComplete: () => void
}

export function DiscoveryStep({ state, updateState, onComplete }: DiscoveryStepProps) {
  const runDiscovery = useCallback(async () => {
    updateState({ status: 'discovering', progress: 0 })

    try {
      // Simulate progress updates while the API call runs
      const progressInterval = setInterval(() => {
        updateState({
          progress: Math.min(90, state.progress + Math.random() * 15),
        })
      }, 500)

      const response = await fetch('/api/scout/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackInfo: {
            title: state.trackTitle,
            description: state.trackDescription,
            spotifyUrl: state.spotifyUrl,
          },
          genres: state.genres,
          vibe: state.vibe,
          goals: state.goals,
          targetRegions: state.targetRegions,
          maxResults: 20,
        }),
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error('Discovery failed')
      }

      const data = await response.json()
      const opportunities: Opportunity[] = data.opportunities || []

      updateState({
        status: 'complete',
        progress: 100,
        opportunities,
      })

      // Auto-advance to results after a brief pause
      setTimeout(() => {
        onComplete()
      }, 800)
    } catch (error) {
      updateState({
        status: 'error',
        error: error instanceof Error ? error.message : 'Something went wrong',
      })
    }
  }, [state, updateState, onComplete])

  // Start discovery when component mounts
  useEffect(() => {
    if (state.status === 'idle') {
      runDiscovery()
    }
  }, [state.status, runDiscovery])

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#6B7280]">
          Step 4 of 5
        </p>
        <h2 className="mt-3 text-[18px] font-semibold tracking-[-0.01em] text-[#E8EAED]">
          {state.status === 'discovering' && 'Scout is searching...'}
          {state.status === 'complete' && 'Discovery complete'}
          {state.status === 'error' && 'Something went wrong'}
        </h2>
      </div>

      {/* Progress indicator */}
      {state.status === 'discovering' && (
        <div className="mt-8 w-full max-w-md">
          <div className="mb-2 flex items-center justify-between text-[11px] text-[#6B7280]">
            <span>Searching {state.goals.length} opportunity types...</span>
            <span>{Math.round(state.progress)}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-[2px] bg-[#1F2327]">
            <motion.div
              className="h-full bg-[#3AA9BE]"
              initial={{ width: 0 }}
              animate={{ width: `${state.progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>

          {/* Animated search indicators */}
          <div className="mt-6 space-y-2">
            {state.goals.map((goal, i) => (
              <motion.div
                key={goal}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                className="flex items-center gap-2 text-[13px] text-[#A9B3BF]"
              >
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="inline-block text-[#3AA9BE]"
                >
                  +
                </motion.span>
                <span className="capitalize">{goal} curators...</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Complete state */}
      {state.status === 'complete' && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-8 text-center"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[6px] border border-[#49A36C]/30 bg-[rgba(73,163,108,0.1)]">
            <span className="text-[16px] font-medium text-[#49A36C]">Done</span>
          </div>
          <p className="mt-4 text-[14px] text-[#A9B3BF]">
            Found <span className="font-semibold text-[#49A36C]">{state.opportunities.length}</span>{' '}
            opportunities
          </p>
          <p className="mt-1 text-[12px] text-[#6B7280]">Loading results...</p>
        </motion.div>
      )}

      {/* Error state */}
      {state.status === 'error' && (
        <div className="mt-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[6px] border border-[#C45252]/30 bg-[rgba(196,82,82,0.1)]">
            <span className="text-[16px] font-medium text-[#C45252]">Error</span>
          </div>
          <p className="mt-4 text-[14px] text-[#C45252]">{state.error}</p>
          <button
            type="button"
            onClick={() => updateState({ status: 'idle' })}
            className="mt-4 rounded-[4px] border border-[#1F2327] bg-[#1A1D21] px-4 py-2 text-[13px] font-medium text-[#A9B3BF] transition-all duration-[120ms] hover:border-[#2A2E33] hover:text-[#E8EAED]"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
