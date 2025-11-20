'use client'

import React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useOS } from './useOS'
import type { TransitionType } from './OSMetadata'

interface OSTransitionsProps {
  children: React.ReactNode
}

function getTransitionDuration(type: TransitionType): number {
  switch (type) {
    case 'zoom':
      return 0.2
    case 'slide':
      return 0.24
    case 'fade':
    default:
      return 0.24
  }
}

function getVariants(type: TransitionType, reducedMotion: boolean) {
  if (reducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    }
  }

  switch (type) {
    case 'zoom':
      return {
        initial: { opacity: 0, scale: 1.1 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.05 },
      }
    case 'slide':
      return {
        initial: { opacity: 0, x: 50 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -24 },
      }
    case 'fade':
    default:
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
  }
}

export function OSTransitions({ children }: OSTransitionsProps) {
  const { currentOS, isTransitioning, transitionType, notifyTransitionComplete } = useOS()
  const prefersReducedMotion = !!useReducedMotion()

  const activeType: TransitionType = prefersReducedMotion ? 'fade' : transitionType || 'fade'
  const variants = getVariants(activeType, prefersReducedMotion)
  const duration = getTransitionDuration(activeType)

  return (
    <div className="relative h-full w-full overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentOS.slug}
          className="relative h-full w-full"
          initial={isTransitioning ? variants.initial : false}
          animate={variants.animate}
          exit={isTransitioning ? variants.exit : { opacity: 0 }}
          transition={{
            duration,
            ease: 'easeInOut',
          }}
          onAnimationComplete={() => {
            if (isTransitioning) {
              notifyTransitionComplete()
            }
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),transparent_55%)] opacity-0 transition-opacity duration-200"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,rgba(0,0,0,0.65)_100%)] mix-blend-multiply"
          />
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
