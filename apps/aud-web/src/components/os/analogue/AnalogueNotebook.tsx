'use client'

import React, { useMemo } from 'react'
import { useOptionalCompanion } from '@/components/companion/useCompanion'
import { useReducedMotion } from 'framer-motion'

interface AnalogueNotebookProps {
  children: React.ReactNode
}

/**
 * AnalogueNotebook
 * Centered journal surface with subtle paper texture and lines
 */
export function AnalogueNotebook({ children }: AnalogueNotebookProps) {
  const prefersReducedMotion = useReducedMotion()
  const companion = useOptionalCompanion()

  const rotation = useMemo(() => {
    if (prefersReducedMotion) return 0
    const tilt = (Math.random() * 2 - 1) * 1.5
    return Math.round(tilt * 10) / 10
  }, [prefersReducedMotion])

  return (
    <div className="relative flex-1">
      {/* Shadow under notebook */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-4 bottom-4 h-10 rounded-[32px] opacity-60 blur-xl"
        style={{
          background: 'radial-gradient(circle at center, rgba(0,0,0,0.65) 0, transparent 60%)',
        }}
      />

      <div
        className="relative mx-auto max-w-xl rounded-[32px] border border-[#e8dcc8] bg-[#faf3e8] px-6 py-5 shadow-[0_26px_60px_rgba(15,23,42,0.65)]"
        style={{
          transform: `rotate(${rotation}deg)`,
          boxShadow:
            '0 22px 60px rgba(15,23,42,0.7), 0 0 0 1px rgba(148,124,92,0.35), inset 0 0 0 1px rgba(255,255,255,0.6)',
          backgroundImage:
            'linear-gradient(to bottom, rgba(0,0,0,0.02) 0, transparent 40%), repeating-linear-gradient(to bottom, #f0e4d1 0, #f0e4d1 1px, transparent 1px, transparent 26px)',
        }}
      >
        {/* Left margin line */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-4 left-[64px] w-px bg-gradient-to-b from-[#d6b29a] via-[#d6b29a] to-transparent opacity-90"
        />

        {/* Binding hint */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-3 left-[40px] w-4 rounded-full border border-[#e4d4c0] bg-[#f5ecdd]/90 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)]"
        >
          <div className="absolute inset-x-1 top-1 h-1 rounded-full bg-white/90 opacity-70" />
        </div>

        <div className="relative z-10 pl-20">
          {companion?.activeCompanion && (
            <div className="pointer-events-none absolute -right-1 -top-6 text-right text-[10px] uppercase tracking-[0.18em] text-[#b1844f]/70">
              <span className="block">Companion</span>
              <span
                className="block font-semibold"
                style={{
                  color: companion.activeCompanion.accent,
                }}
              >
                {companion.activeCompanion.name}
              </span>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}
