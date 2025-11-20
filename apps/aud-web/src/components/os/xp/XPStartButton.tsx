'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useThemeAudio } from '@/hooks/useThemeAudio'

interface XPStartButtonProps {
  onClick?: () => void
}

/**
 * XP Start button - green pill with glow
 */
export function XPStartButton({ onClick }: XPStartButtonProps) {
  const { play } = useThemeAudio()
  const prefersReducedMotion = useReducedMotion()

  const handleClick = () => {
    // XP "open" cue mapped to theme "success" sound
    play('success')
    onClick?.()
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      className="relative flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(0,0,0,0.2)]"
      style={{
        background: 'linear-gradient(180deg, #4ade80 0%, #22c55e 45%, #15803d 100%)',
      }}
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              scale: 1.03,
              boxShadow: '0 0 12px rgba(34,197,94,0.85)',
            }
      }
      whileTap={
        prefersReducedMotion
          ? undefined
          : {
              scale: 0.97,
            }
      }
    >
      <span className="h-4 w-4 rounded-sm bg-gradient-to-b from-white/90 to-white/40 shadow-[0_0_6px_rgba(0,0,0,0.4)]" />
      <span className="tracking-wide">Start</span>
    </motion.button>
  )
}
