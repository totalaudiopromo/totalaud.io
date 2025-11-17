'use client'

import React, { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useThemeAudio } from '@/hooks/useThemeAudio'

interface DawToggleProps {
  label: string
  initialOn?: boolean
}

export function DAWToggle({ label, initialOn }: DawToggleProps) {
  const { play } = useThemeAudio()
  const prefersReducedMotion = useReducedMotion()
  const [on, setOn] = useState(Boolean(initialOn))

  const handleToggle = () => {
    setOn((prev) => !prev)
    play('click')
  }

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={on}
      onClick={handleToggle}
      className="inline-flex items-center gap-2 text-[11px] text-slate-300"
    >
      <span className="uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <motion.span
        className={`flex h-4 w-8 items-center rounded-full border px-[3px] ${
          on
            ? 'border-cyan-400/90 bg-cyan-500/20'
            : 'border-slate-600/80 bg-slate-900/80'
        }`}
        layout
        transition={
          prefersReducedMotion
            ? undefined
            : {
                type: 'spring',
                stiffness: 260,
                damping: 30,
              }
        }
      >
        <motion.span
          layout
          className={`h-3 w-3 rounded-full ${
            on
              ? 'bg-cyan-400 shadow-[0_0_8px_rgba(58,169,190,0.9)]'
              : 'bg-slate-400/80'
          }`}
        />
      </motion.span>
    </button>
  )
}


