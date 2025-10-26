/**
 * Motion Tokens - Centralised Animation Standards
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
    duration: 240, // ms
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    use: 'Pane transitions, modal opens, theme switches',
  },
  slow: {
    duration: 400, // ms
    easing: 'ease-in-out',
    use: 'Calm fades, ambient effects, background animations',
  },
} as const

/**
 * Motion duration values only (for convenience)
 */
export const motionDurations = {
  fast: motionTokens.fast.duration,
  normal: motionTokens.normal.duration,
  slow: motionTokens.slow.duration,
} as const

/**
 * Motion easing curves
 */
export const motionEasing = {
  fast: motionTokens.fast.easing,
  normal: motionTokens.normal.easing,
  slow: motionTokens.slow.easing,
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
