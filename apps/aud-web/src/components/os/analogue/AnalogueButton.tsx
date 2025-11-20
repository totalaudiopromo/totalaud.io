'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useThemeAudio } from '@/hooks/useThemeAudio'

interface AnalogueButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

/**
 * AnalogueButton
 * Ghost / label-style button with stamped text feel
 */
export function AnalogueButton({ children, onClick, className = '' }: AnalogueButtonProps) {
  const { play } = useThemeAudio()
  const prefersReducedMotion = useReducedMotion()

  const handleClick = () => {
    play('click')
    onClick?.()
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-2 rounded-[999px] border border-dashed border-[#7b5a3a] bg-[#f5e7d5]/40 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[#5b412b] shadow-[0_1px_0_rgba(255,255,255,0.8)] hover:border-[#8c6640] ${className}`}
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              y: -0.5,
              rotate: -0.4,
            }
      }
      whileTap={prefersReducedMotion ? undefined : { y: 0.5, scale: 0.97 }}
      transition={
        prefersReducedMotion
          ? undefined
          : {
              type: 'spring',
              stiffness: 260,
              damping: 24,
            }
      }
    >
      <span className="relative flex items-center gap-1">
        <span className="h-[1px] w-4 bg-gradient-to-r from-transparent via-[#7b5a3a] to-transparent" />
        <span>{children}</span>
        <span className="h-[1px] w-4 bg-gradient-to-r from-transparent via-[#7b5a3a] to-transparent" />
      </span>
    </motion.button>
  )
}
