'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useThemeAudio } from '@/hooks/useThemeAudio'

type DawButtonVariant = 'primary' | 'secondary' | 'ghost'

interface DawButtonProps {
  label: string
  variant?: DawButtonVariant
  active?: boolean
  ariaLabel?: string
  onClick?: () => void
}

export function DAWButton({ label, variant = 'secondary', active, ariaLabel, onClick }: DawButtonProps) {
  const { play } = useThemeAudio()
  const prefersReducedMotion = useReducedMotion()

  const handleClick = () => {
    play('click')
    onClick?.()
  }

  const base =
    'inline-flex h-8 items-center justify-center rounded-md border px-3 text-[11px] font-medium tracking-wide'

  const styles: Record<DawButtonVariant, string> = {
    primary: active
      ? 'border-cyan-400/90 bg-cyan-500/25 text-cyan-50 shadow-[0_0_0_1px_rgba(58,169,190,0.7),0_0_32px_rgba(58,169,190,0.75)]'
      : 'border-cyan-400/70 bg-cyan-500/20 text-cyan-50 shadow-[0_0_0_1px_rgba(15,23,42,0.9)]',
    secondary:
      'border-slate-700 bg-slate-900/90 text-slate-100 shadow-[0_0_0_1px_rgba(15,23,42,0.9)]',
    ghost: 'border-transparent bg-slate-900/40 text-slate-300',
  }

  return (
    <motion.button
      type="button"
      aria-label={ariaLabel ?? label}
      aria-pressed={active}
      onClick={handleClick}
      className={`${base} ${styles[variant]}`}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
      transition={{ type: 'tween', duration: 0.15 }}
    >
      {label}
    </motion.button>
  )
}


