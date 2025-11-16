'use client'

/**
 * Demo OS Shell
 * Switches between OS views based on active demo step
 */

import { useDemo } from '@/components/demo/DemoOrchestrator'
import { useDirector } from '@/components/demo/director/DirectorProvider'
import { useEffect } from 'react'
import type { DirectorCallbacks } from '@/components/demo/director/DirectorEngine'

// Stub OS components
import { AnalogueOSPage } from './os/AnalogueOSPage'
import { AsciiOSPage } from './os/AsciiOSPage'
import { XPOSPage } from './os/XPOSPage'
import { LoopOSPage } from './os/LoopOSPage'
import { AquaOSPage } from './os/AquaOSPage'

export function DemoOSShell() {
  const demo = useDemo()
  const director = useDirector()

  // Set up director callbacks
  useEffect(() => {
    const callbacks: DirectorCallbacks = {
      onSetOS: (osSlug) => {
        const stepId = `${osSlug}-intro` as any
        demo.goToStep(stepId)
      },

      onShowNote: (text) => {
        demo.setNote(text)
      },

      // Additional callbacks will be provided by OS components
      // via context or refs (implemented in next steps)
    }

    director.engine.setCallbacks(callbacks)
  }, [demo, director])

  // Render current OS
  const { osSlug } = demo.activeStep

  return (
    <div className="w-full h-screen">
      {osSlug === 'analogue' && <AnalogueOSPage />}
      {osSlug === 'ascii' && <AsciiOSPage />}
      {osSlug === 'xp' && <XPOSPage />}
      {osSlug === 'loopos' && <LoopOSPage />}
      {osSlug === 'aqua' && <AquaOSPage />}
    </div>
  )
}
