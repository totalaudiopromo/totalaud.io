'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useThemeAudio } from '@/hooks/useThemeAudio'

interface AnalogueToggleProps {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}

/**
 * AnalogueToggle
 * Physical-feeling toggle switch for simple booleans
 */
export function AnalogueToggle({ label, checked, onChange }: AnalogueToggleProps) {
  const { play } = useThemeAudio()
  const prefersReducedMotion = useReducedMotion()

  const handleToggle = () => {
    const next = !checked
    onChange(next)
    play('click')
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={checked}
      className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-[#7b5a3a]"
    >
      <span>{label}</span>
      <motion.span
        className={`flex h-5 w-9 items-center rounded-full border px-[3px] ${
          checked ? 'border-[#e29a5a] bg-[#fce2c4]' : 'border-[#c3a58a] bg-[#f3e3d1]'
        }`}
        layout
        transition={
          prefersReducedMotion
            ? undefined
            : {
                type: 'spring',
                stiffness: 260,
                damping: 26,
              }
        }
      >
        <motion.span
          layout
          className={`h-3.5 w-3.5 rounded-full shadow-[0_1px_0_rgba(255,255,255,0.9),0_2px_0_rgba(0,0,0,0.35)] ${
            checked ? 'bg-[#f97316]' : 'bg-[#facc15]'
          }`}
        />
      </motion.span>
    </button>
  )
}
