'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useOptionalAmbient } from '@/components/ambient/useAmbient'
import { useOptionalMood } from '@/components/mood/useMood'

interface AnalogueContainerProps {
  children: React.ReactNode
}

/**
 * AnalogueContainer
 * Warm, tactile desk background for the Analogue OS surface
 */
export function AnalogueContainer({ children }: AnalogueContainerProps) {
  const ambient = useOptionalAmbient()
  const prefersReducedMotion = useReducedMotion()
  const intensity = ambient?.effectiveIntensity ?? 0
  const mood = useOptionalMood()

  const warmthOverlayOpacity =
    mood?.mood === 'charged'
      ? 0.2
      : mood?.mood === 'focused'
        ? 0.16
        : mood?.mood === 'idle'
          ? 0.08
          : 0.14

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden bg-[#1e1410] text-[#1b130f]"
      style={{
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
      }}
    >
      {/* Desk gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at top left, #3b2417 0, transparent 60%), radial-gradient(circle at bottom right, #2b1e17 0, transparent 55%)',
        }}
      />

      {/* Mood-tinted warmth overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: warmthOverlayOpacity,
          background: 'radial-gradient(circle at bottom, rgba(248,181,102,0.6), transparent 55%)',
          mixBlendMode: 'soft-light',
        }}
      />

      {/* Paper noise + vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[url('/textures/noise.png')] opacity-[0.12] mix-blend-soft-light" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, transparent 0, rgba(0,0,0,0.6) 70%)',
          mixBlendMode: 'multiply',
        }}
        animate={
          prefersReducedMotion
            ? undefined
            : {
                opacity: [0.6, 0.7],
              }
        }
        transition={{
          duration: 18,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      />

      {/* Foreground content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <div className="flex w-full max-w-6xl items-stretch gap-6 lg:gap-10">{children}</div>
      </div>
    </div>
  )
}
