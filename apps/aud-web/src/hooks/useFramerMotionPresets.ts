/**
 * Framer Motion Presets Hook
 *
 * Phase 9.5: Theme Cohesion Layer
 * Provides theme-specific Framer Motion animation presets
 * that maintain cinematic consistency with landing page.
 */

'use client'

import { useCallback, useMemo } from 'react'
import { useReducedMotion, type Transition, type TargetAndTransition } from 'framer-motion'
import { springPresets, framerEasing, extendedMotionTokens } from '@/design/core/motion'
import type { OSTheme } from '@/components/themes/types'

/**
 * Animation variant presets per theme
 */
export interface FramerPresets {
  // Entrance animations
  fadeIn: {
    initial: TargetAndTransition
    animate: TargetAndTransition
    exit: TargetAndTransition
    transition: Transition
  }
  slideUp: {
    initial: TargetAndTransition
    animate: TargetAndTransition
    exit: TargetAndTransition
    transition: Transition
  }
  scaleReveal: {
    initial: TargetAndTransition
    animate: TargetAndTransition
    exit: TargetAndTransition
    transition: Transition
  }
  // Interaction animations
  hoverScale: {
    whileHover: TargetAndTransition
    whileTap: TargetAndTransition
    transition: Transition
  }
  magnetic: {
    whileHover: TargetAndTransition
    transition: Transition
  }
  // Theme-specific
  commandSpark: {
    initial: TargetAndTransition
    animate: TargetAndTransition
    transition: Transition
  }
  stepTransition: {
    initial: TargetAndTransition
    animate: TargetAndTransition
    exit: TargetAndTransition
    transition: Transition
  }
  nodeIntro: {
    initial: TargetAndTransition
    animate: TargetAndTransition
    transition: Transition
  }
  clipDrag: {
    drag: boolean
    dragElastic: number
    whileDrag: TargetAndTransition
    transition: Transition
  }
  noteEntry: {
    initial: TargetAndTransition
    animate: TargetAndTransition
    transition: Transition
  }
}

/**
 * Get Framer Motion presets for a specific theme
 *
 * @param theme - Current OSTheme
 * @returns Theme-specific animation presets
 */
export function useFramerMotionPresets(theme: OSTheme): FramerPresets {
  const prefersReducedMotion = useReducedMotion()

  // Adjust motion amplitude for Calm Mode / Reduced Motion
  const getAmplitude = useCallback(
    (value: number) => {
      if (prefersReducedMotion) return value * 0.3 // 70% reduction
      return value
    },
    [prefersReducedMotion]
  )

  const presets = useMemo((): FramerPresets => {
    // Operator: Instant, minimal motion
    if (theme === 'operator') {
      return {
        fadeIn: {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0 },
        },
        slideUp: {
          initial: { y: getAmplitude(12), opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: -getAmplitude(12), opacity: 0 },
          transition: { duration: 0 },
        },
        scaleReveal: {
          initial: { scale: 1, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 1, opacity: 0 },
          transition: { duration: 0 },
        },
        hoverScale: {
          whileHover: { scale: 1 },
          whileTap: { scale: 1 },
          transition: { duration: 0 },
        },
        magnetic: {
          whileHover: { x: 0, y: 0 },
          transition: { duration: 0 },
        },
        commandSpark: {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: [0, 0.3, 0], scale: [0.8, 1.2, 1] },
          transition: { duration: 0.3 },
        },
        stepTransition: {
          initial: { x: 0, opacity: 1 },
          animate: { x: 0, opacity: 1 },
          exit: { x: 0, opacity: 0 },
          transition: { duration: 0 },
        },
        nodeIntro: {
          initial: { scale: 1, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { duration: 0 },
        },
        clipDrag: {
          drag: true,
          dragElastic: 0,
          whileDrag: { scale: 1 },
          transition: { duration: 0 },
        },
        noteEntry: {
          initial: { y: 0, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { duration: 0 },
        },
      }
    }

    // Guide: Reassuring springs, step-by-step reveals
    if (theme === 'guide') {
      return {
        fadeIn: {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: extendedMotionTokens.fadeDuration },
        },
        slideUp: {
          initial: { y: getAmplitude(12), opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: -getAmplitude(12), opacity: 0 },
          transition: springPresets.medium,
        },
        scaleReveal: {
          initial: { scale: extendedMotionTokens.scaleSubtle.from, opacity: 0 },
          animate: { scale: extendedMotionTokens.scaleSubtle.to, opacity: 1 },
          exit: { scale: extendedMotionTokens.scaleSubtle.from, opacity: 0 },
          transition: springPresets.soft,
        },
        hoverScale: {
          whileHover: { scale: 1.02 },
          whileTap: { scale: 0.98 },
          transition: springPresets.fast,
        },
        magnetic: {
          whileHover: { x: getAmplitude(4), y: 0 },
          transition: springPresets.medium,
        },
        commandSpark: {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: [0, 0.3, 0], scale: [0.8, 1.2, 1] },
          transition: { duration: 0.6 },
        },
        stepTransition: {
          initial: { x: getAmplitude(20), opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: -getAmplitude(20), opacity: 0 },
          transition: { duration: 0.24, ease: framerEasing.fast, delay: 0.08 },
        },
        nodeIntro: {
          initial: { scale: 0.95, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: springPresets.soft,
        },
        clipDrag: {
          drag: true,
          dragElastic: 0.1,
          whileDrag: { scale: 1.02 },
          transition: springPresets.medium,
        },
        noteEntry: {
          initial: { y: -getAmplitude(10), opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: springPresets.soft,
        },
      }
    }

    // Map: Spatial reveals, parallax depth, floating nodes
    if (theme === 'map') {
      return {
        fadeIn: {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: extendedMotionTokens.fadeDuration },
        },
        slideUp: {
          initial: { y: getAmplitude(12), opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: -getAmplitude(12), opacity: 0 },
          transition: { duration: 0.24, ease: framerEasing.fast },
        },
        scaleReveal: {
          initial: { scale: extendedMotionTokens.scaleSubtle.from, opacity: 0 },
          animate: { scale: extendedMotionTokens.scaleSubtle.to, opacity: 1 },
          exit: { scale: extendedMotionTokens.scaleSubtle.from, opacity: 0 },
          transition: { duration: 0.24, ease: framerEasing.fast },
        },
        hoverScale: {
          whileHover: { scale: 1.03 },
          whileTap: { scale: 0.97 },
          transition: springPresets.fast,
        },
        magnetic: {
          whileHover: { x: getAmplitude(6), y: getAmplitude(6) },
          transition: springPresets.medium,
        },
        commandSpark: {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: [0, 0.15, 0], scale: [0.8, 1.1, 1] },
          transition: { duration: 0.4 },
        },
        stepTransition: {
          initial: { x: getAmplitude(20), opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: -getAmplitude(20), opacity: 0 },
          transition: { duration: 0.24, ease: framerEasing.fast },
        },
        nodeIntro: {
          initial: { scale: 0.9, opacity: 0, rotate: -1.5 },
          animate: { scale: 1, opacity: 1, rotate: 0 },
          transition: { duration: 0.24, ease: framerEasing.fast },
        },
        clipDrag: {
          drag: true,
          dragElastic: 0.05,
          whileDrag: { scale: 1.03, zIndex: 10 },
          transition: springPresets.medium,
        },
        noteEntry: {
          initial: { y: -getAmplitude(10), opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { duration: 0.24, ease: framerEasing.fast },
        },
      }
    }

    // Timeline: Precise clip movement, playhead sweep
    if (theme === 'timeline') {
      return {
        fadeIn: {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: extendedMotionTokens.fadeDuration },
        },
        slideUp: {
          initial: { y: getAmplitude(12), opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: -getAmplitude(12), opacity: 0 },
          transition: { duration: 0.12, ease: framerEasing.fast },
        },
        scaleReveal: {
          initial: { scale: extendedMotionTokens.scaleSubtle.from, opacity: 0 },
          animate: { scale: extendedMotionTokens.scaleSubtle.to, opacity: 1 },
          exit: { scale: extendedMotionTokens.scaleSubtle.from, opacity: 0 },
          transition: { duration: 0.12, ease: framerEasing.fast },
        },
        hoverScale: {
          whileHover: { scale: extendedMotionTokens.scaleHover.to },
          whileTap: { scale: 0.97 },
          transition: springPresets.fast,
        },
        magnetic: {
          whileHover: { x: getAmplitude(4), y: 0 },
          transition: springPresets.fast,
        },
        commandSpark: {
          initial: { opacity: 0 },
          animate: { opacity: [0, 0.15, 0] },
          transition: { duration: 0.3 },
        },
        stepTransition: {
          initial: { x: 0, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: 0, opacity: 0 },
          transition: { duration: 0.24 },
        },
        nodeIntro: {
          initial: { scale: 0.95, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { duration: 0.12, ease: framerEasing.fast },
        },
        clipDrag: {
          drag: true,
          dragElastic: 0.02,
          whileDrag: { scale: extendedMotionTokens.scaleHover.to },
          transition: springPresets.fast,
        },
        noteEntry: {
          initial: { y: -getAmplitude(8), opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { duration: 0.12, ease: framerEasing.fast },
        },
      }
    }

    // Tape: Gentle, grounded animations
    return {
      fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: extendedMotionTokens.fadeDuration },
      },
      slideUp: {
        initial: { y: getAmplitude(12), opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -getAmplitude(12), opacity: 0 },
        transition: springPresets.soft,
      },
      scaleReveal: {
        initial: { scale: extendedMotionTokens.scaleSubtle.from, opacity: 0 },
        animate: { scale: extendedMotionTokens.scaleSubtle.to, opacity: 1 },
        exit: { scale: extendedMotionTokens.scaleSubtle.from, opacity: 0 },
        transition: springPresets.soft,
      },
      hoverScale: {
        whileHover: { scale: 1.05 },
        whileTap: { scale: 0.95 },
        transition: springPresets.soft,
      },
      magnetic: {
        whileHover: { x: getAmplitude(3), y: 0 },
        transition: springPresets.soft,
      },
      commandSpark: {
        initial: { opacity: 0, scale: 1 },
        animate: { opacity: [0, 0.2, 0], scale: 1 },
        transition: { duration: 0.5 },
      },
      stepTransition: {
        initial: { x: 0, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: 0, opacity: 0 },
        transition: { duration: 0.24, ease: framerEasing.slow },
      },
      nodeIntro: {
        initial: { scale: 0.95, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: springPresets.soft,
      },
      clipDrag: {
        drag: true,
        dragElastic: 0.15,
        whileDrag: { scale: 1.02 },
        transition: springPresets.soft,
      },
      noteEntry: {
        initial: { y: -getAmplitude(10), opacity: 0 },
        animate: { y: 0, opacity: 1 },
        transition: springPresets.soft,
      },
    }
  }, [theme, getAmplitude, prefersReducedMotion])

  return presets
}
