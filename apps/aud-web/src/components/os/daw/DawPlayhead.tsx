'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface DawPlayheadProps {
  /** Static horizontal position as a percentage of the grid width */
  positionPercent?: number
  /** Whether the transport is in a fake "playing" state for extra glow */
  isPlaying?: boolean
}

export function DawPlayhead({ positionPercent = 26, isPlaying }: DawPlayheadProps) {
  const prefersReducedMotion = useReducedMotion()

  const baseX = 0
  const wiggle = prefersReducedMotion ? 0 : 2

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-y-12 bottom-14 top-16 w-px"
      style={{
        left: `${positionPercent}%`,
      }}
      animate={
        prefersReducedMotion
          ? undefined
          : {
              x: [baseX, baseX + wiggle, baseX],
              opacity: [0.9, 1, 0.9],
            }
      }
      transition={
        prefersReducedMotion
          ? undefined
          : {
              duration: isPlaying ? 0.8 : 1.6,
              repeat: Infinity,
              ease: 'easeInOut',
            }
      }
    >
      <div className="absolute inset-y-0 left-0 w-px bg-cyan-400/80 shadow-[0_0_14px_rgba(58,169,190,0.9)]" />
      <div className="absolute -top-1.5 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(58,169,190,0.9)]" />
    </motion.div>
  )
}

