/**
 * useStudioMotion Hook
 *
 * Provides motion signature configurations for each Studio.
 * Each Studio has distinct animation timing, easing, and behavior.
 *
 * Phase 6: Enhancements - Motion Language System
 */

import { useMemo } from 'react'

export type TransitionSpeed = 'instant' | 'fast' | 'medium' | 'slow' | 'drift'

export interface StudioMotion {
  /** Animation duration in milliseconds */
  duration: number

  /** CSS easing function */
  easing: string

  /** Overshoot amount for spring animations (0-1) */
  overshoot: number

  /** Semantic speed label */
  transitionSpeed: TransitionSpeed

  /** Framer Motion spring config (optional) */
  spring?: {
    type: 'spring'
    stiffness: number
    damping: number
    mass: number
  }
}

const MOTION_CONFIGS: Record<string, StudioMotion> = {
  ascii: {
    duration: 240,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)', // Sharp snap
    overshoot: 0,
    transitionSpeed: 'instant',
  },

  xp: {
    duration: 400,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Bounce
    overshoot: 0.55,
    transitionSpeed: 'fast',
    spring: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
      mass: 1,
    },
  },

  aqua: {
    duration: 600,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)', // Smooth ease
    overshoot: 0,
    transitionSpeed: 'slow',
  },

  daw: {
    duration: 500,
    easing: 'cubic-bezier(0.42, 0, 0.58, 1)', // Linear-ish with slight ease
    overshoot: 0,
    transitionSpeed: 'medium',
  },

  analogue: {
    duration: 800,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Gentle drift
    overshoot: 0,
    transitionSpeed: 'drift',
  },
}

/**
 * Get the motion configuration for a specific Studio theme
 */
export function useStudioMotion(theme: string): StudioMotion {
  const motion = useMemo(() => {
    return MOTION_CONFIGS[theme] || MOTION_CONFIGS.ascii
  }, [theme])

  return motion
}

/**
 * Get Framer Motion transition config for a theme
 */
export function getFramerTransition(theme: string) {
  const config = MOTION_CONFIGS[theme] || MOTION_CONFIGS.ascii

  if (config.spring) {
    return config.spring
  }

  return {
    duration: config.duration / 1000, // Convert to seconds
    ease: config.easing,
  }
}

/**
 * Get CSS transition string for a theme
 */
export function getCSSTransition(theme: string, property = 'all'): string {
  const config = MOTION_CONFIGS[theme] || MOTION_CONFIGS.ascii
  return `${property} ${config.duration}ms ${config.easing}`
}
