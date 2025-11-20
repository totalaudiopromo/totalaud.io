'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface AquaPanelProps {
  children: React.ReactNode
  className?: string
  floatDelay?: number
}

/**
 * AquaPanel
 * Core glass panel with soft float motion
 */
export function AquaPanel({ children, className = '', floatDelay = 0 }: AquaPanelProps) {
  const prefersReducedMotion = useReducedMotion()

  const floatAnimation = prefersReducedMotion
    ? undefined
    : {
        y: [0, -4, 0],
      }

  const floatTransition = prefersReducedMotion
    ? undefined
    : {
        duration: 10,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: floatDelay,
      }

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl border border-white/30 bg-white/10 ${className}`}
      style={{
        background: 'rgba(255,255,255,0.15)',
        borderColor: 'rgba(255,255,255,0.3)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
      animate={floatAnimation}
      transition={floatTransition}
    >
      {/* Subtle inner glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(circle at top, rgba(255,255,255,0.45), transparent 60%)',
        }}
      />

      <div className="relative">{children}</div>
    </motion.div>
  )
}


