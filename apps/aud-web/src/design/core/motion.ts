/**
 * Motion Design Tokens
 *
 * Unified motion system providing consistent easing curves and durations.
 * Replaces scattered string-based easing with typed motion arrays.
 *
 * Philosophy:
 * - Fast (120ms): Micro-interactions, instant feedback
 * - Normal (240ms): Pane transitions, modal animations
 * - Slow (400ms): Ambient effects, calm transitions
 */

/**
 * Easing Curves
 * Using cubic-bezier format: [x1, y1, x2, y2]
 */
export const easingCurves = {
  /** Smooth, natural motion for most UI elements */
  smooth: [0.22, 1, 0.36, 1] as const,

  /** Sharp, decisive motion for commands */
  sharp: [0.4, 0, 0.2, 1] as const,

  /** Elastic bounce for playful interactions */
  bounce: [0.68, -0.55, 0.265, 1.55] as const,

  /** Linear for progress indicators */
  linear: [0, 0, 1, 1] as const,

  /** Ease-out for natural deceleration */
  easeOut: [0, 0, 0.2, 1] as const,

  /** Ease-in for subtle acceleration */
  easeIn: [0.4, 0, 1, 1] as const,
} as const

/**
 * Duration Tokens (milliseconds)
 */
export const durations = {
  /** 120ms - Micro feedback (hover, clicks) */
  fast: 120,

  /** 240ms - Pane transitions, modals */
  normal: 240,

  /** 400ms - Ambient, atmospheric effects */
  slow: 400,

  /** 600ms - Cinematic landing page effects */
  cinematic: 600,
} as const

/**
 * Pre-composed Transitions
 * Ready-to-use transition configurations for Framer Motion
 */
export const transitions = {
  /** Micro-interactions (hover, click, focus) */
  micro: {
    duration: durations.fast / 1000, // Convert to seconds for Framer
    ease: easingCurves.smooth,
  },

  /** Smooth UI transitions (panes, modals) */
  smooth: {
    duration: durations.normal / 1000,
    ease: easingCurves.smooth,
  },

  /** Calm, ambient animations */
  ambient: {
    duration: durations.slow / 1000,
    ease: easingCurves.easeOut,
  },

  /** Sharp, decisive commands */
  command: {
    duration: durations.fast / 1000,
    ease: easingCurves.sharp,
  },

  /** Playful bounce for success states */
  bounce: {
    duration: durations.normal / 1000,
    ease: easingCurves.bounce,
  },

  /** Cinematic landing page effects */
  cinematic: {
    duration: durations.cinematic / 1000,
    ease: easingCurves.smooth,
  },
} as const

/**
 * Spring Configurations
 * For physics-based animations (Framer Motion springs)
 */
export const springs = {
  /** Gentle, natural spring */
  gentle: {
    type: 'spring' as const,
    stiffness: 100,
    damping: 15,
  },

  /** Bouncy, playful spring */
  bouncy: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 20,
  },

  /** Stiff, responsive spring */
  stiff: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30,
  },
} as const

/**
 * Motion Core Export
 * Central access point for all motion tokens
 */
export const motionCore = {
  easing: easingCurves,
  duration: durations,
  transitions,
  springs,
} as const

export type MotionCore = typeof motionCore

/**
 * Utility: Convert easing array to CSS cubic-bezier string
 * @example toCubicBezier(easingCurves.smooth) => "cubic-bezier(0.22, 1, 0.36, 1)"
 */
export function toCubicBezier(curve: readonly [number, number, number, number]): string {
  return `cubic-bezier(${curve.join(', ')})`
}

/**
 * Utility: Convert duration to CSS transition string
 * @example toTransition('opacity', durations.fast, easingCurves.smooth)
 *          => "opacity 120ms cubic-bezier(0.22, 1, 0.36, 1)"
 */
export function toTransition(
  property: string,
  duration: number,
  curve: readonly [number, number, number, number]
): string {
  return `${property} ${duration}ms ${toCubicBezier(curve)}`
}
