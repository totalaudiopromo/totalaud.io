'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrackInfoStep } from './steps/TrackInfoStep'
import { GenreVibeStep } from './steps/GenreVibeStep'
import { GoalsStep } from './steps/GoalsStep'
import { DiscoveryStep } from './steps/DiscoveryStep'
import { ResultsStep } from './steps/ResultsStep'
import { ScoutProgress } from './ScoutProgress'

export type VibeOption = 'energetic' | 'chill' | 'dark' | 'uplifting' | 'experimental'
export type GoalOption = 'playlist' | 'blog' | 'radio' | 'youtube' | 'podcast'

export interface Opportunity {
  id: string
  type: GoalOption
  name: string
  contact: {
    name?: string
    email?: string
    submissionUrl?: string
  }
  relevanceScore: number
  genres: string[]
  pitchTips?: string[]
  source: 'database' | 'scraped' | 'api'
}

export interface ScoutWizardState {
  // Step 1: Track Info
  trackTitle: string
  trackDescription: string
  spotifyUrl: string

  // Step 2: Genre/Vibe
  genres: string[]
  vibe: VibeOption

  // Step 3: Goals
  goals: GoalOption[]
  targetRegions: string[]

  // Step 4: Discovery Status
  status: 'idle' | 'discovering' | 'complete' | 'error'
  progress: number
  error?: string

  // Step 5: Results
  opportunities: Opportunity[]
}

const initialState: ScoutWizardState = {
  trackTitle: '',
  trackDescription: '',
  spotifyUrl: '',
  genres: [],
  vibe: 'energetic',
  goals: [],
  targetRegions: ['UK'],
  status: 'idle',
  progress: 0,
  opportunities: [],
}

const TOTAL_STEPS = 5

export function ScoutWizard() {
  const [step, setStep] = useState(0)
  const [state, setState] = useState<ScoutWizardState>(initialState)

  const updateState = useCallback((updates: Partial<ScoutWizardState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleNext = useCallback(() => {
    setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1))
  }, [])

  const handleBack = useCallback(() => {
    setStep((s) => Math.max(0, s - 1))
  }, [])

  const handleReset = useCallback(() => {
    setStep(0)
    setState(initialState)
  }, [])

  // Validation for each step
  const canProceed = (): boolean => {
    switch (step) {
      case 0: // Track Info
        return state.trackTitle.trim().length > 0
      case 1: // Genre/Vibe
        return state.genres.length > 0
      case 2: // Goals
        return state.goals.length > 0
      case 3: // Discovery
        return state.status === 'complete'
      case 4: // Results
        return true
      default:
        return false
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Progress indicator */}
      <div className="border-b border-slate-800/50 px-6 py-3">
        <ScoutProgress currentStep={step} totalSteps={TOTAL_STEPS} />
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-2xl"
          >
            {step === 0 && <TrackInfoStep state={state} updateState={updateState} />}
            {step === 1 && <GenreVibeStep state={state} updateState={updateState} />}
            {step === 2 && <GoalsStep state={state} updateState={updateState} />}
            {step === 3 && (
              <DiscoveryStep state={state} updateState={updateState} onComplete={handleNext} />
            )}
            {step === 4 && <ResultsStep state={state} onReset={handleReset} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation footer */}
      {step < 3 && (
        <footer className="flex items-center justify-between border-t border-slate-800/50 px-6 py-4">
          <div>
            {step > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="rounded-full border border-slate-700 bg-slate-900/60 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.15em] text-slate-300 transition-colors hover:border-slate-500 hover:text-slate-100"
              >
                Back
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed()}
            className={`rounded-full px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition-all ${
              canProceed()
                ? 'border border-sky-500 bg-sky-500/20 text-sky-100 hover:border-sky-400 hover:bg-sky-500/30'
                : 'cursor-not-allowed border border-slate-700 bg-slate-800/50 text-slate-500'
            }`}
          >
            {step === 2 ? 'Start Scout' : 'Continue'}
          </button>
        </footer>
      )}
    </div>
  )
}
