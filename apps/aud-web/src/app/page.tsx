'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useOnboardingPhase } from '@aud-web/hooks/useOnboardingPhase'
import {
  OperatorTerminal,
  OSSelector,
  TransitionSequence,
} from '@aud-web/components/features/onboarding'
import { FlowStudio } from '@aud-web/components/features/flow'
import type { OSTheme } from '@aud-web/hooks/useOSSelection'
import { AnimatePresence } from 'framer-motion'

function HomePageContent() {
  const searchParams = useSearchParams()
  const { phase, next, setPhase } = useOnboardingPhase()
  const [selectedTheme, setSelectedTheme] = useState<OSTheme>('operator')
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)

  // Check if user has already completed onboarding
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem('onboarding_completed')
      const skipParam = searchParams.get('skip_onboarding')

      if (completed === 'true' || skipParam === 'true') {
        setHasCompletedOnboarding(true)
        setPhase('signal')
      }
    }
  }, [searchParams, setPhase])

  // Mark onboarding as complete when reaching signal phase
  useEffect(() => {
    if (phase === 'signal' && !hasCompletedOnboarding) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('onboarding_completed', 'true')
        setHasCompletedOnboarding(true)
      }
    }
  }, [phase, hasCompletedOnboarding])

  const handleOSConfirm = (theme: OSTheme) => {
    setSelectedTheme(theme)
    next()
  }

  return (
    <AnimatePresence mode="wait">
      {phase === 'operator' && <OperatorTerminal key="operator" onComplete={next} />}
      {phase === 'selection' && <OSSelector key="selection" onConfirm={handleOSConfirm} />}
      {phase === 'transition' && (
        <TransitionSequence key="transition" theme={selectedTheme} onComplete={next} />
      )}
      {phase === 'signal' && <FlowStudio key="signal" />}
    </AnimatePresence>
  )
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-white bg-[#0a0d10]">
          <div className="animate-pulse font-mono lowercase">loading flow studio...</div>
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  )
}
