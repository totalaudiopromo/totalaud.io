'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useThemeAudio } from '@/hooks/useThemeAudio'

interface AquaButtonProps {
  label: string
  onClick?: () => void
  className?: string
}

/**
 * AquaButton
 * Pill-shaped glass button with soft glow and click audio
 */
export function AquaButton({ label, onClick, className = '' }: AquaButtonProps) {
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
      className={`relative inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium text-sky-50 shadow-[0_10px_30px_rgba(15,23,42,0.8)] ${className}`}
      style={{
        background: 'radial-gradient(circle at 0% 0%, rgba(56,189,248,0.95), rgba(30,64,175,0.95))',
        boxShadow:
          '0 12px 40px rgba(15,23,42,0.85), 0 0 0 1px rgba(148,163,184,0.7), 0 0 30px rgba(56,189,248,0.7)',
      }}
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              scale: 1.04,
              boxShadow: '0 16px 46px rgba(15,23,42,0.9), 0 0 36px rgba(56,189,248,0.9)',
            }
      }
      whileTap={
        prefersReducedMotion
          ? undefined
          : {
              scale: 0.97,
            }
      }
      transition={{ type: 'tween', duration: 0.18 }}
    >
      {/* Inner glass highlight */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-1 top-0 h-1/2 rounded-full opacity-70"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.85), rgba(255,255,255,0))',
        }}
      />
      <span className="relative flex items-center gap-2">
        <span>{label}</span>
        <span className="text-xs text-cyan-100/90">↵</span>
      </span>
    </motion.button>
  )
}
