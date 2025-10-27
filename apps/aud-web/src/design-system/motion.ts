/**
 * Design System - Motion Tokens
 *
 * Centralised animation standards for totalaud.io
 * Phase 10.4: Global Design System Unification
 * All durations in seconds for Framer Motion consistency
 */

/**
 * Motion durations (in seconds)
 * Consistent timing rhythm: 120ms / 240ms / 400ms / 600ms / 800ms
 */
export const motion = {
  durations: {
    fast: 0.12, // 120ms - Micro feedback, key confirmations
    normal: 0.24, // 240ms - Pane transitions, modal opens
    slow: 0.4, // 400ms - Calm fades, ambient effects
    editorial: 0.6, // 600ms - Hero reveals, emotional content
    cinematic: 0.8, // 800ms - Dramatic transitions
  },

  /**
   * Easing curves
   * Cubic bezier values for consistent feel
   */
  easing: {
    softOut: [0.22, 1, 0.36, 1] as const, // Standard ease-out
    smooth: [0.32, 0.72, 0, 1] as const, // Smooth parallax
    spring: [0.68, -0.55, 0.265, 1.55] as const, // Bounce (Guide theme)
  },

  /**
   * Ambient pulse cycle (in seconds)
   * Used for background glows and ambient animations
   */
  pulseCycle: 12,
} as const

/**
 * Framer Motion spring presets
 * Used for physics-based animations
 */
export const springPresets = {
  fast: {
    type: 'spring' as const,
    stiffness: 180,
    damping: 18,
  },
  medium: {
    type: 'spring' as const,
    stiffness: 140,
    damping: 20,
  },
  soft: {
    type: 'spring' as const,
    stiffness: 100,
    damping: 26,
  },
} as const

/**
 * Extended motion values
 * Advanced motion parameters for cinematic effects
 */
export const extendedMotion = {
  // Parallax and scroll effects
  parallaxRange: { min: 20, max: 60 }, // px
  magneticRange: 8, // px for cursor magnetics
  velocityBlurThreshold: 500, // scroll velocity

  // Scale transformations
  scaleSubtle: { from: 0.9, to: 1.0 },
  scaleHover: { from: 1.0, to: 1.03 },

  // Glow effects
  glowBloom: { from: 0, to: 6 }, // px for shadow bloom
} as const

/**
 * Theme-specific motion overrides
 * Some themes (like Operator) use instant transitions
 */
export const themeMotionOverrides = {
  operator: {
    fast: 0,
    normal: 0,
    slow: 0,
  },
  guide: {
    fast: 0.12,
    normal: 0.24,
    slow: 0.4,
  },
  map: {
    fast: 0.12,
    normal: 0.24,
    slow: 0.4,
  },
  timeline: {
    fast: 0.12,
    normal: 0.24,
    slow: 0.4,
  },
  tape: {
    fast: 0.12,
    normal: 0.24,
    slow: 0.4,
  },
} as const

/**
 * Get motion duration respecting reduced motion preference
 *
 * @param speed - Motion speed key
 * @param prefersReducedMotion - User's reduced motion preference
 * @returns Duration in seconds (0 if reduced motion preferred)
 */
export function getMotionDuration(
  speed: keyof typeof motion.durations,
  prefersReducedMotion = false
): number {
  if (prefersReducedMotion) return 0
  return motion.durations[speed]
}

/**
 * Get Framer Motion transition config
 *
 * @param speed - Motion speed key
 * @param prefersReducedMotion - User's reduced motion preference
 * @returns Framer Motion transition object
 */
export function getMotionTransition(
  speed: keyof typeof motion.durations,
  prefersReducedMotion = false
) {
  const duration = getMotionDuration(speed, prefersReducedMotion)
  const easing = prefersReducedMotion ? 'linear' : motion.easing.softOut

  return {
    duration,
    ease: easing,
  }
}

/**
 * Get CSS transition string
 *
 * @param property - CSS property to transition
 * @param speed - Motion speed key
 * @param prefersReducedMotion - User's reduced motion preference
 * @returns CSS transition string
 */
export function getCSSTransition(
  property: string,
  speed: keyof typeof motion.durations,
  prefersReducedMotion = false
): string {
  const duration = getMotionDuration(speed, prefersReducedMotion) * 1000 // Convert to ms for CSS
  const easing = prefersReducedMotion ? 'linear' : 'cubic-bezier(0.22, 1, 0.36, 1)'

  return `${property} ${duration}ms ${easing}`
}
