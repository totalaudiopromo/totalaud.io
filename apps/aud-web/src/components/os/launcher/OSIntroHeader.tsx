'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export function OSIntroHeader() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <header className="space-y-4">
      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
            totalaud.io
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
            Creative OS Launcher
          </h1>
        </div>
        <p className="max-w-md text-sm text-slate-400">
          Choose your creative operating system. Each OS is a different way to think, plan and ship
          your music ideas.
        </p>
      </motion.div>
    </header>
  )
}
