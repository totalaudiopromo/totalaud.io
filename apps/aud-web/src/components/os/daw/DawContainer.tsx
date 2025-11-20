'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useOptionalAmbient } from '@/components/ambient/useAmbient'

interface DawContainerProps {
  children: React.ReactNode
}

/**
 * DawContainer
 * Full-screen dark DAW surface for the OS constellation.
 * Matte black, subtle vertical gradient, no global state.
 */
export function DawContainer({ children }: DawContainerProps) {
  const ambient = useOptionalAmbient()
  const prefersReducedMotion = useReducedMotion()
  const intensity = ambient?.effectiveIntensity ?? 0

  return (
    <div
      className="relative flex h-full min-h-screen flex-col overflow-hidden bg-[#0F1113] text-slate-100"
      style={{
        backgroundImage: 'linear-gradient(to bottom, #0F1113 0%, #121418 55%, #050608 100%)',
      }}
    >
      {/* Cyan OS halo at the top to match the constellation */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-500/25 via-cyan-500/5 to-transparent"
      />

      {/* Slight vignette to keep focus in the centre */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.6),_transparent_55%)] mix-blend-screen"
        style={{
          opacity: 0.32 + intensity * 0.12,
        }}
        animate={
          prefersReducedMotion
            ? undefined
            : {
                opacity: [0.32 + intensity * 0.12, 0.36 + intensity * 0.18],
              }
        }
        transition={{
          duration: 11,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      />

      <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  )
}

