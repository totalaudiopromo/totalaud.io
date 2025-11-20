'use client'

import React from 'react'
import { JetBrains_Mono } from 'next/font/google'
import { motion, useReducedMotion } from 'framer-motion'
import { useOptionalAmbient } from '@/components/ambient/useAmbient'

const mono = JetBrains_Mono({ subsets: ['latin'], weight: '400' })

interface XPContainerProps {
  children: React.ReactNode
  onDesktopClick?: () => void
}

/**
 * XP OS Container
 * Full-screen XP-inspired desktop surface
 */
export function XPContainer({ children, onDesktopClick }: XPContainerProps) {
  const ambient = useOptionalAmbient()
  const prefersReducedMotion = useReducedMotion()
  const intensity = ambient?.effectiveIntensity ?? 0

  const childArray = React.Children.toArray(children)
  const mainChildren = childArray.slice(0, Math.max(childArray.length - 1, 0))
  const footerChild = childArray.length > 0 ? childArray[childArray.length - 1] : null

  return (
    <div
      className={
        mono.className +
        ' fixed inset-0 flex h-screen w-screen flex-col overflow-hidden bg-gradient-to-b from-[#3AA0FF] to-[#BEE8FF] text-slate-900'
      }
    >
      {/* Soft vignette overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(circle at center, rgba(255,255,255,0.15) 0, rgba(0,0,0,0.15) 70%, rgba(0,0,0,0.35) 100%)',
        }}
      />

      {/* Vertical ambient shimmer to hint at airflow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-12 h-40 bg-gradient-to-t from-white/20 via-white/0 to-transparent mix-blend-soft-light"
        style={{
          opacity: prefersReducedMotion ? intensity * 0.06 : intensity * 0.12,
        }}
        animate={
          prefersReducedMotion
            ? undefined
            : {
                y: [0, -6, 0],
              }
        }
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="relative z-10 flex h-full flex-col">
        {/* Main desktop area */}
        <div className="flex-1 pb-[52px]">
          <div
            className="flex h-full items-center justify-center px-6"
            onMouseDown={(event) => {
              // Ignore clicks that bubble up from windows or menus
              if (event.target === event.currentTarget) {
                onDesktopClick?.()
              }
            }}
          >
            {mainChildren}
          </div>
        </div>

        {/* Taskbar / footer */}
        {footerChild}
      </div>
    </div>
  )
}


