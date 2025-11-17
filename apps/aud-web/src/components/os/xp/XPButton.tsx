'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useThemeAudio } from '@/hooks/useThemeAudio'

interface XPButtonProps {
  label: string
  onClick?: () => void
  className?: string
}

/**
 * XP-style glossy blue pill button
 */
export function XPButton({ label, onClick, className = '' }: XPButtonProps) {
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
      className={`relative inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-medium text-white shadow-[0_2px_4px_rgba(0,0,0,0.25)] ${className}`}
      style={{
        background: 'linear-gradient(180deg, #4A8CFF 0%, #7FB1FF 40%, #4169e1 100%)',
      }}
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              scale: 1.04,
              boxShadow: '0 0 12px rgba(59,130,246,0.7)',
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
      {/* Gloss highlight */}
      <span
        className="pointer-events-none absolute inset-x-1 top-0 h-1/2 rounded-full opacity-60"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0))',
        }}
      />
      <span className="relative">{label}</span>
    </motion.button>
  )
}


