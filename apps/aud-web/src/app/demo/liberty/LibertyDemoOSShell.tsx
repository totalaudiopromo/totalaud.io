'use client'

/**
 * Liberty Demo OS Shell
 * Switches between OS views and handles TAP export for Liberty demo
 */

import { useDemo } from '@/components/demo/DemoOrchestrator'
import { useDirector } from '@/components/demo/director/DirectorProvider'
import { useEffect, useState } from 'react'
import type { DirectorCallbacks } from '@/components/demo/director/DirectorEngine'

// Liberty-specific OS components
import { AnalogueOSPage } from './os/AnalogueOSPage'
import { XPOSPage } from './os/XPOSPage'
import { LoopOSPage } from './os/LoopOSPage'

// Reuse artist demo OS pages for ASCII and Aqua (they're content-agnostic)
import { AsciiOSPage } from '../artist/os/AsciiOSPage'
import { AquaOSPage } from '../artist/os/AquaOSPage'

// TAP Export overlay
import { TAPExportOverlay } from './TAPExportOverlay'

export function LibertyDemoOSShell() {
  const demo = useDemo()
  const director = useDirector()
  const [tapExportState, setTapExportState] = useState<{
    isExporting: boolean
    status: 'idle' | 'exporting' | 'success' | 'error'
    message: string | null
  }>({
    isExporting: false,
    status: 'idle',
    message: null,
  })

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

      onTriggerTapExport: async (payload, durationMs) => {
        // Show exporting state
        setTapExportState({
          isExporting: true,
          status: 'exporting',
          message: 'Exporting campaign to Total Audio Promo...',
        })

        try {
          // Call stub API
          const response = await fetch('/api/demo/tap-export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              demoMode: 'liberty',
              timestamp: new Date().toISOString(),
              ...payload,
            }),
          })

          const data = await response.json()

          if (data.success) {
            setTapExportState({
              isExporting: true,
              status: 'success',
              message: 'Campaign exported to TAP (Preview Mode)',
            })

            // Auto-hide after duration
            setTimeout(() => {
              setTapExportState({
                isExporting: false,
                status: 'idle',
                message: null,
              })
            }, durationMs)
          } else {
            throw new Error(data.error || 'Export failed')
          }
        } catch (error) {
          console.error('TAP export failed:', error)
          setTapExportState({
            isExporting: true,
            status: 'error',
            message: 'Export failed (demo stub)',
          })

          // Auto-hide error after 2s
          setTimeout(() => {
            setTapExportState({
              isExporting: false,
              status: 'idle',
              message: null,
            })
          }, 2000)
        }
      },
    }

    director.engine.setCallbacks(callbacks)
  }, [demo, director])

  // Clean up TAP export overlay when director stops
  useEffect(() => {
    if (!director.isPlaying && !director.isEnabled) {
      setTapExportState({
        isExporting: false,
        status: 'idle',
        message: null,
      })
    }
  }, [director.isPlaying, director.isEnabled])

  // Render current OS
  const { osSlug } = demo.activeStep

  return (
    <>
      <div className="w-full h-screen">
        {osSlug === 'analogue' && <AnalogueOSPage />}
        {osSlug === 'ascii' && <AsciiOSPage />}
        {osSlug === 'xp' && <XPOSPage />}
        {osSlug === 'loopos' && <LoopOSPage />}
        {osSlug === 'aqua' && <AquaOSPage />}
      </div>

      {/* TAP Export overlay */}
      {tapExportState.isExporting && (
        <TAPExportOverlay
          status={tapExportState.status}
          message={tapExportState.message || ''}
        />
      )}
    </>
  )
}
