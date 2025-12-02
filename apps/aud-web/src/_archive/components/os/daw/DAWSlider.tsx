'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface DawSliderProps {
  ariaLabel: string
  value: number // 0–1
  onChange: (value: number) => void
  glow?: boolean
}

export function DAWSlider({ ariaLabel, value, onChange, glow }: DawSliderProps) {
  const prefersReducedMotion = useReducedMotion()

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const next = (event.clientX - rect.left) / rect.width
    onChange(Math.min(1, Math.max(0, next)))
  }

  return (
    <div className="flex w-full items-center gap-2">
      <div
        role="slider"
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={value}
        tabIndex={0}
        onClick={handleClick}
        className="relative h-1.5 w-full cursor-pointer rounded-full bg-slate-800/90"
      >
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-500/80 via-cyan-400/80 to-sky-400/80"
          style={{
            width: `${value * 100}%`,
            boxShadow: glow ? '0 0 18px rgba(58,169,190,0.7)' : undefined,
          }}
        />
        <motion.div
          aria-hidden
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-slate-100 shadow-[0_0_10px_rgba(15,23,42,0.9)]"
          style={{ left: `${value * 100}%` }}
          layout
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  type: 'spring',
                  stiffness: 260,
                  damping: 25,
                }
          }
        />
      </div>
    </div>
  )
}
