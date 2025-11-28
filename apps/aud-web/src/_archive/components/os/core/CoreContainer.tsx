'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useOptionalAmbient } from '@/components/ambient/useAmbient'
import { useOptionalMood } from '@/components/mood/useMood'
import { useOptionalPersona } from '@/components/persona/usePersona'

interface CoreContainerProps {
  children: React.ReactNode
}

export function CoreContainer({ children }: CoreContainerProps) {
  const ambient = useOptionalAmbient()
  const mood = useOptionalMood()
  const persona = useOptionalPersona()
  const prefersReducedMotion = useReducedMotion()

  const ambientIntensity = ambient?.effectiveIntensity ?? 0
  const moodScore = mood?.score ?? 0
  const personaAccent = persona?.persona?.aesthetic?.accent ?? '#22c55e'

  const vignetteOpacity = 0.5 + ambientIntensity * 0.2
  const haloScale = 0.4 + moodScore * 0.4

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-black text-slate-50">
      {/* Deep space background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at top, rgba(15,23,42,0.9), transparent 60%), radial-gradient(circle at bottom, rgba(15,23,42,0.9), transparent 60%)',
        }}
      />

      {/* Ambient halo influenced by mood + persona */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-40"
        style={{
          background: `radial-gradient(circle at center, ${personaAccent}33, transparent 65%)`,
          filter: 'blur(40px)',
        }}
        animate={
          prefersReducedMotion
            ? undefined
            : {
                scale: [haloScale, haloScale * 1.05, haloScale],
                opacity: [0.18, 0.3, 0.18],
              }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : {
                duration: 24,
                repeat: Infinity,
                ease: 'easeInOut',
              }
        }
      />

      {/* Vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, transparent 0, rgba(0,0,0,1) 70%)',
          opacity: vignetteOpacity,
          mixBlendMode: 'multiply',
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col px-6 py-4 lg:px-10 lg:py-6">
        {children}
      </div>
    </div>
  )
}
