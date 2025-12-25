'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DemoStep, DemoStepId } from './DemoScript'
import { DEMO_STEPS } from './DemoScript'
import { DemoOverlay } from './DemoOverlay'
import { useOS } from '@/components/os/navigation'
import { DirectorProvider } from './director/DirectorProvider'

interface DemoContextValue {
  activeStep: DemoStep
  nextStep: () => void
  prevStep: () => void
  goToStep: (id: DemoStepId) => void
  isDemoMode: boolean
  exitDemo: () => void
}

const DemoContext = createContext<DemoContextValue | null>(null)

export function useDemo(): DemoContextValue {
  const value = useContext(DemoContext)
  if (!value) {
    throw new Error('useDemo must be used within a DemoOrchestrator')
  }
  return value
}

export function useOptionalDemo(): DemoContextValue | null {
  return useContext(DemoContext)
}

export function DemoOrchestrator({ children }: { children: React.ReactNode }) {
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const router = useRouter()
  const { currentOS } = useOS()

  const activeStep = DEMO_STEPS[activeStepIndex]

  const baseNextStep = useCallback(() => {
    setActiveStepIndex((previous) => {
      if (previous >= DEMO_STEPS.length - 1) return previous
      return previous + 1
    })
  }, [])

  const prevStep = useCallback(() => {
    setActiveStepIndex((previous) => {
      if (previous <= 0) return previous
      return previous - 1
    })
  }, [])

  const goToStep = useCallback((id: DemoStepId) => {
    const index = DEMO_STEPS.findIndex((step) => step.id === id)
    if (index === -1) return
    setActiveStepIndex(index)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined')
      return // Expose a simple global flag for demo-aware components
    ;(window as any).__TA_DEMO__ = true

    return () => {
      if (typeof window === 'undefined') return
      // Clean up the flag on unmount so normal routes are unaffected
       
      delete (window as any).__TA_DEMO__
    }
  }, [])

  useEffect(() => {
    if (!activeStep.autoAdvance) return

    const timeoutId = window.setTimeout(() => {
      baseNextStep()
    }, 3500)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [activeStep.autoAdvance, baseNextStep])

  const value: DemoContextValue = useMemo(
    () => ({
      activeStep,
      isDemoMode: true,
      nextStep: () => {
        if (activeStep.id === 'end') {
          router.push('/os/core')
          return
        }
        baseNextStep()
      },
      prevStep,
      goToStep,
      exitDemo: () => {
        router.push('/os')
      },
    }),
    [activeStep, baseNextStep, goToStep, prevStep, router]
  )

  return (
    <DemoContext.Provider value={value}>
      <DirectorProvider>
        {children}
        <DemoOverlay />
      </DirectorProvider>
    </DemoContext.Provider>
  )
}
