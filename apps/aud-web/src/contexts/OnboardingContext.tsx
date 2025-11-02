/**
 * OnboardingContext
 * Phase 14.1: Manages first-run onboarding state
 *
 * Features:
 * - localStorage persistence for hasSeenOnboarding flag
 * - startOnboarding() and endOnboarding() methods
 * - Auto-launches on first visit
 */

'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface OnboardingContextValue {
  hasSeenOnboarding: boolean
  isOnboardingActive: boolean
  startOnboarding: () => void
  endOnboarding: () => void
  currentStep: number
  setCurrentStep: (step: number) => void
  totalSteps: number
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined)

const STORAGE_KEY = 'totalaud-onboarding-complete'
const TOTAL_STEPS = 5

interface OnboardingProviderProps {
  children: React.ReactNode
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true) // Default to true for SSR
  const [isOnboardingActive, setIsOnboardingActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  // Check localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const seen = localStorage.getItem(STORAGE_KEY)
    const hasSeen = seen === 'true'
    setHasSeenOnboarding(hasSeen)

    // Auto-launch onboarding if not seen before
    if (!hasSeen) {
      // Delay by 500ms to allow page to settle
      setTimeout(() => {
        setIsOnboardingActive(true)
      }, 500)
    }
  }, [])

  const startOnboarding = useCallback(() => {
    setIsOnboardingActive(true)
    setCurrentStep(0)
  }, [])

  const endOnboarding = useCallback(() => {
    setIsOnboardingActive(false)
    setCurrentStep(0)

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'true')
      setHasSeenOnboarding(true)
    }
  }, [])

  const value: OnboardingContextValue = {
    hasSeenOnboarding,
    isOnboardingActive,
    startOnboarding,
    endOnboarding,
    currentStep,
    setCurrentStep,
    totalSteps: TOTAL_STEPS,
  }

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}
