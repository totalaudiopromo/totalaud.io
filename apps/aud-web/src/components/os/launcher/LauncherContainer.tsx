'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface LauncherContainerProps {
  children: React.ReactNode
}

export function LauncherContainer({ children }: LauncherContainerProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[#0F1113] text-slate-50">
      {/* Radial glow backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 20% 0%, rgba(59,130,246,0.32), transparent 55%), radial-gradient(circle at 80% 100%, rgba(56,189,248,0.26), transparent 55%)',
        }}
      />

      {/* Subtle vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,rgba(0,0,0,0.92)_72%)]"
      />

      <motion.div
        className="relative z-10 flex w-full max-w-6xl flex-col gap-10 px-4 py-10 md:px-10 md:py-12"
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 18 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </div>
  )
}



