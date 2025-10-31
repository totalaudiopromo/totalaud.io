/**
 * Motion Tokens - Centralised Animation Standards
 *
 * ⚠️ DEPRECATED - Phase 10.4 Design System Unification
 *
 * Please use: /apps/aud-web/src/design-system/motion.ts instead
 *
 * This file contains legacy motion values with conflicting durations:
 * - normal: 400ms (should be 240ms)
 * - slow: 600ms (should be 400ms)
 *
 * The canonical design system motion tokens use consistent rhythm:
 * fast: 120ms / normal: 240ms / slow: 400ms / editorial: 600ms / cinematic: 800ms
 *
 * Migration: Replace imports from this file with design-system/motion.ts
 *
 * Theme System Anti-Gimmick Refactor
 * All animations use these standardised durations and easing curves.
 * Respects user's reduced motion preference.
 */

/**
 * Motion duration tokens (milliseconds)
 */
export const motionTokens = {
  fast: {
    duration: 120, // ms
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    use: 'Micro feedback, key confirmations, inline ticks',
  },
  normal: {
    duration: 400, // ms (updated from 240ms for editorial breathing)
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    use: 'Pane transitions, modal opens, theme switches',
  },
  slow: {
    duration: 600, // ms (updated from 400ms for cinematic fades)
    easing: 'ease-in-out',
    use: 'Calm fades, ambient effects, background animations',
  },
  editorial: {
    duration: 800, // ms (new for hero/testimonials)
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    use: 'Hero reveals, testimonials, emotional content',
  },
  ringPulse: {
    duration: 400, // ms (new for CTA ring pulse)
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    use: 'CTA hover ring pulse animation',
  },
} as const

/**
 * Motion duration values only (for convenience)
 */
export const motionDurations = {
  fast: motionTokens.fast.duration,
  normal: motionTokens.normal.duration,
  slow: motionTokens.slow.duration,
  editorial: motionTokens.editorial.duration,
  ringPulse: motionTokens.ringPulse.duration,
} as const

/**
 * Motion easing curves
 */
export const motionEasing = {
  fast: motionTokens.fast.easing,
  normal: motionTokens.normal.easing,
  slow: motionTokens.slow.easing,
  editorial: motionTokens.editorial.easing,
  ringPulse: motionTokens.ringPulse.easing,
  spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // For Guide theme bounce
} as const

/**
 * Get motion duration respecting reduced motion preference
 *
 * @param speed - The motion speed token
 * @param prefersReducedMotion - User's reduced motion preference
 * @returns Duration in milliseconds (0 if reduced motion preferred)
 */
export function getMotionDuration(
  speed: keyof typeof motionTokens,
  prefersReducedMotion = false
): number {
  if (prefersReducedMotion) return 0
  return motionTokens[speed].duration
}

/**
 * Get Framer Motion transition config
 *
 * @param speed - The motion speed token
 * @param prefersReducedMotion - User's reduced motion preference
 * @returns Framer Motion transition object
 */
export function getMotionTransition(
  speed: keyof typeof motionTokens,
  prefersReducedMotion = false
) {
  const duration = getMotionDuration(speed, prefersReducedMotion)

  return {
    duration: duration / 1000, // Framer Motion uses seconds
    ease: prefersReducedMotion ? 'linear' : motionEasing[speed],
  }
}

/**
 * CSS transition string
 *
 * @param property - CSS property to transition
 * @param speed - The motion speed token
 * @param prefersReducedMotion - User's reduced motion preference
 * @returns CSS transition string
 */
export function getCSSTransition(
  property: string,
  speed: keyof typeof motionTokens,
  prefersReducedMotion = false
): string {
  const duration = getMotionDuration(speed, prefersReducedMotion)
  const easing = prefersReducedMotion ? 'linear' : motionEasing[speed]

  return `${property} ${duration}ms ${easing}`
}

/**
 * Hook to get reduced motion preference
 *
 * @returns Boolean indicating if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  return mediaQuery.matches
}

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
    fast: 120,
    normal: 240,
    slow: 400,
  },
  map: {
    fast: 120,
    normal: 240,
    slow: 400,
  },
  timeline: {
    fast: 120,
    normal: 240,
    slow: 400,
  },
  tape: {
    fast: 120,
    normal: 240,
    slow: 400,
  },
} as const

/**
 * Framer Motion Spring Presets
 * Phase 9.5: Cinematic cohesion with landing page
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
 * Framer Motion easing curves
 * Matches landing page ScrollFlow motion
 */
export const framerEasing = {
  fast: [0.22, 1, 0.36, 1] as const, // cubic-bezier matching motionEasing.fast
  medium: [0.22, 1, 0.36, 1] as const,
  slow: [0.32, 0.72, 0, 1] as const, // Smooth parallax
} as const

/**
 * Extended motion tokens for Framer Motion cohesion
 */
export const extendedMotionTokens = {
  fadeDuration: 0.24, // seconds
  longDrift: 12.0, // seconds for ambient loops
  parallaxRange: { min: 20, max: 60 }, // px for scroll parallax
  magneticRange: 8, // px for cursor magnetics
  scaleSubtle: { from: 0.9, to: 1.0 }, // Subtle scale for reveals
  scaleHover: { from: 1.0, to: 1.03 }, // Hover scale for clips
  glowBloom: { from: 0, to: 6 }, // px for shadow bloom
  velocityBlurThreshold: 500, // scroll velocity for blur trigger
} as const
