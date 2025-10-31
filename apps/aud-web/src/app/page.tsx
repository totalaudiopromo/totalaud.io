'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useOnboardingPhase } from '@aud-web/hooks/useOnboardingPhase'
import { OperatorTerminal, OSSelector } from '@aud-web/components/features/onboarding'
import { SystemInitOverlay } from '@aud-web/components/ui/SystemInitOverlay'
import type { OSTheme } from '@aud-web/hooks/useOSSelection'
import { AnimatePresence } from 'framer-motion'

function HomePageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
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
        // Redirect to console instead of showing FlowStudio
        router.push('/console')
      }
    }
  }, [searchParams, router])

  // Redirect to console when reaching signal phase (onboarding complete)
  useEffect(() => {
    if (phase === 'signal') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('onboarding_completed', 'true')
      }
      // Redirect to unified console dashboard
      router.push('/console')
    }
  }, [phase, router])

  const handleOSConfirm = (theme: OSTheme) => {
    setSelectedTheme(theme)
    next()
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {phase === 'operator' && <OperatorTerminal key="operator" onComplete={next} />}
        {phase === 'selection' && <OSSelector key="selection" onConfirm={handleOSConfirm} />}
      </AnimatePresence>

      {/* System Init Overlay - Cinematic transition after theme selection */}
      <SystemInitOverlay isVisible={phase === 'transition'} onComplete={next} />
    </>
  )
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-white bg-[#0F1113]">
          <div
            className="animate-pulse lowercase"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
              letterSpacing: '0.4px',
              color: 'rgba(255, 255, 255, 0.4)',
            }}
          >
            initialising...
          </div>
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  )
}
