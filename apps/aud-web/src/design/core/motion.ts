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
 * Extended Motion Tokens
 * Additional motion values for cinematic effects (Phase 9.5)
 */
export const extendedMotionTokens = {
  /** Parallax range for scroll effects */
  parallaxRange: {
    min: 0,
    max: 50,
  },
  /** Long drift timing for ambient motion (ms) */
  longDrift: 300,
  /** Velocity blur threshold */
  velocityBlurThreshold: 20,
  /** Magnetic interaction range (px) */
  magneticRange: 30,
  /** Fade duration for transitions (seconds) */
  fadeDuration: 0.3,
  /** Subtle scale transforms */
  scaleSubtle: {
    from: 0.98,
    to: 1,
  },
  /** Hover scale transforms */
  scaleHover: {
    from: 1,
    to: 1.05,
  },
} as const

/**
 * Spring Presets for Framer Motion
 * Physics-based animation configurations
 */
export const springPresets = {
  gentle: { type: 'spring' as const, stiffness: 100, damping: 15 },
  bouncy: { type: 'spring' as const, stiffness: 300, damping: 20 },
  stiff: { type: 'spring' as const, stiffness: 400, damping: 30 },
  // Additional presets used by useFramerMotionPresets
  soft: { type: 'spring' as const, stiffness: 80, damping: 12 },
  medium: { type: 'spring' as const, stiffness: 200, damping: 18 },
  fast: { type: 'spring' as const, stiffness: 500, damping: 35 },
} as const

/**
 * Framer Easing Configurations
 * Easing curves formatted for Framer Motion ease property
 */
export const framerEasing = {
  smooth: easingCurves.smooth,
  sharp: easingCurves.sharp,
  bounce: easingCurves.bounce,
  linear: easingCurves.linear,
  easeOut: easingCurves.easeOut,
  easeIn: easingCurves.easeIn,
  // Additional easing curves used by useFramerMotionPresets
  fast: easingCurves.sharp, // Sharp for fast easing
  slow: easingCurves.easeOut, // Ease-out for slow easing
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
