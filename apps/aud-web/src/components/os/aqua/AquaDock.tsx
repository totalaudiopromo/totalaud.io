'use client'

import React, { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { AquaAppName } from './AquaAppIcon'

interface AquaDockProps {
  children: React.ReactNode
  onSelectApp?: (app: AquaAppName) => void
}

/**
 * AquaDock
 * Bottom-centered glass dock with icon magnification
 */
export function AquaDock({ children, onSelectApp }: AquaDockProps) {
  const prefersReducedMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-20 flex justify-center">
      <motion.div
        className="pointer-events-auto flex items-end gap-3 rounded-[24px] border border-white/25 bg-white/10 px-4 py-2 shadow-[0_18px_80px_rgba(15,23,42,0.9)]"
        style={{
          background: 'rgba(15,23,42,0.76)',
          backdropFilter: 'blur(26px)',
          WebkitBackdropFilter: 'blur(26px)',
          boxShadow:
            '0 18px 80px rgba(15,23,42,0.9), 0 0 0 1px rgba(148,163,184,0.6), 0 0 50px rgba(56,189,248,0.35)',
        }}
        initial={
          prefersReducedMotion
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 30 }
        }
        animate={{ opacity: 1, y: 0 }}
        transition={
          prefersReducedMotion
            ? { type: 'tween', duration: 0.18 }
            : {
                type: 'spring',
                stiffness: 180,
                damping: 22,
              }
        }
      >
        {/* Reflection under icons */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-2 bottom-1 h-6 rounded-full opacity-60"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(15,23,42,0.85) 0%, transparent 70%)',
          }}
        />

        <div className="relative flex items-end gap-2">
          {React.Children.map(children, (child, index) => {
            if (!React.isValidElement(child)) return child

            const distance =
              activeIndex === null ? Infinity : Math.abs(activeIndex - index)

            return React.cloneElement(child as React.ReactElement, {
              dockIndex: index,
              activeDockIndex: activeIndex,
              proximity: distance,
              onDockHover: () => setActiveIndex(index),
              onDockLeave: () => setActiveIndex(null),
              onDockClick: (app: AquaAppName) => {
                onSelectApp?.(app)
              },
            })
          })}
        </div>
      </motion.div>
    </div>
  )
}


