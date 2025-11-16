'use client'

/**
 * Demo Orchestrator
 * Manages demo state and navigation
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { DEMO_STEPS, type DemoStep, type DemoStepId } from './DemoScript'

interface DemoContextValue {
  isDemoMode: boolean
  activeStep: DemoStep
  activeStepIndex: number
  note: string | null
  goToStep: (stepId: DemoStepId) => void
  nextStep: () => void
  previousStep: () => void
  setNote: (note: string | null) => void
}

const DemoContext = createContext<DemoContextValue | null>(null)

export interface DemoOrchestratorProps {
  children: ReactNode
}

export function DemoOrchestrator({ children }: DemoOrchestratorProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [note, setNote] = useState<string | null>(null)

  const activeStep = DEMO_STEPS[activeStepIndex]

  const goToStep = useCallback((stepId: DemoStepId) => {
    const index = DEMO_STEPS.findIndex((step) => step.id === stepId)
    if (index !== -1) {
      setActiveStepIndex(index)
    }
  }, [])

  const nextStep = useCallback(() => {
    setActiveStepIndex((prev) => Math.min(prev + 1, DEMO_STEPS.length - 1))
  }, [])

  const previousStep = useCallback(() => {
    setActiveStepIndex((prev) => Math.max(prev - 1, 0))
  }, [])

  const value: DemoContextValue = {
    isDemoMode: true,
    activeStep,
    activeStepIndex,
    note,
    goToStep,
    nextStep,
    previousStep,
    setNote,
  }

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemo(): DemoContextValue {
  const context = useContext(DemoContext)
  if (!context) {
    throw new Error('useDemo must be used within DemoOrchestrator')
  }
  return context
}

export function useOptionalDemo(): DemoContextValue | null {
  return useContext(DemoContext)
}
