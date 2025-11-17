'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface OSGridProps {
  children: React.ReactNode
}

export function OSGrid({ children }: OSGridProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.section
      aria-label="Creative operating systems"
      className="relative mt-4"
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* Soft glow behind the grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-[40px] bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.18),_transparent_55%)]"
      />

      <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">{children}</div>
    </motion.section>
  )
}



