'use client'

import { useState, useCallback } from 'react'

export type OnboardingPhase = 'operator' | 'selection' | 'transition' | 'signal'

interface UseOnboardingPhaseReturn {
  phase: OnboardingPhase
  setPhase: (phase: OnboardingPhase) => void
  next: () => void
  reset: () => void
}

/**
 * Manages the four-phase onboarding sequence:
 * operator → selection → transition → signal
 */
export function useOnboardingPhase(): UseOnboardingPhaseReturn {
  const [phase, setPhase] = useState<OnboardingPhase>('operator')

  const next = useCallback(() => {
    setPhase((currentPhase) => {
      if (currentPhase === 'operator') return 'selection'
      if (currentPhase === 'selection') return 'transition'
      if (currentPhase === 'transition') return 'signal'
      return currentPhase
    })
  }, [])

  const reset = useCallback(() => {
    setPhase('operator')
  }, [])

  return {
    phase,
    setPhase,
    next,
    reset,
  }
}
