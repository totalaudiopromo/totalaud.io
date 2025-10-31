/**
 * Motion Library - Named Animation Curves
 *
 * Centralized motion definitions for all Studios.
 * Each Studio has an emotional motion signature defined by timing and easing.
 *
 * Performance: All curves use GPU-accelerated properties (transform, opacity)
 */

import { type Transition } from 'framer-motion'

/**
 * Named Easing Curves
 * Based on cubic-bezier for precise control
 */
export const easings = {
  // ASCII: Sharp, instant precision
  snap: [0.4, 0, 0.2, 1] as const, // Sharp in, sharp out

  // XP: Playful bounce
  bounce: [0.68, -0.55, 0.265, 1.55] as const, // Overshoot for playfulness

  // Aqua: Smooth flow
  dissolve: [0.4, 0, 0.2, 1] as const, // Ease in-out
  dissolveIn: [0, 0, 0.2, 1] as const, // Ease out (for entrances)
  dissolveOut: [0.4, 0, 1, 1] as const, // Ease in (for exits)

  // DAW: Mechanical precision
  pulse: [0.42, 0, 0.58, 1] as const, // Symmetrical ease

  // Analogue: Human touch
  drift: [0.25, 0.46, 0.45, 0.94] as const, // Gentle acceleration
  driftSlow: [0.16, 1, 0.3, 1] as const, // Very gentle
} as const

/**
 * Named Duration Tokens
 * Mapped to Studio personalities
 */
export const durations = {
  snap: 0.12, // 120ms - ASCII instant response
  fast: 0.24, // 240ms - ASCII/XP quick actions
  normal: 0.4, // 400ms - XP bouncy interactions
  smooth: 0.6, // 600ms - Aqua dissolves
  slow: 0.8, // 800ms - Analogue gentle drifts
  beat: 0.5, // 500ms - DAW Studio (120 BPM)
} as const

/**
 * Studio Motion Signatures
 * Complete motion definitions per Studio personality
 */
export const studioMotion = {
  ascii: {
    name: 'Snap',
    duration: durations.snap,
    easing: `cubic-bezier(${easings.snap.join(', ')})`,
    spring: undefined,
    description: 'Instant precision - no delay, pure control',
  },

  xp: {
    name: 'Bounce',
    duration: durations.normal,
    easing: `cubic-bezier(${easings.bounce.join(', ')})`,
    spring: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 20,
      mass: 1,
    },
    description: 'Playful spring - encouraging and friendly',
  },

  aqua: {
    name: 'Dissolve',
    duration: durations.smooth,
    easing: `cubic-bezier(${easings.dissolve.join(', ')})`,
    spring: {
      type: 'spring' as const,
      stiffness: 70,
      damping: 25,
      mass: 1,
    },
    description: 'Smooth flow - calm and clear',
  },

  daw: {
    name: 'Pulse',
    duration: durations.beat, // 120 BPM tempo
    easing: `cubic-bezier(${easings.pulse.join(', ')})`,
    spring: undefined,
    description: 'Tempo-locked - rhythmic and precise',
  },

  analogue: {
    name: 'Drift',
    duration: durations.slow,
    easing: `cubic-bezier(${easings.drift.join(', ')})`,
    spring: {
      type: 'spring' as const,
      stiffness: 40,
      damping: 30,
      mass: 1.2,
    },
    description: 'Gentle drift - warm and human',
  },
} as const

/**
 * Framer Motion Transition Presets
 * Ready-to-use transitions for each Studio
 */
export const transitions = {
  snap: {
    duration: durations.snap,
    ease: easings.snap,
  } satisfies Transition,

  bounce: {
    type: 'spring',
    stiffness: 260,
    damping: 20,
    mass: 1,
  } satisfies Transition,

  dissolve: {
    duration: durations.smooth,
    ease: easings.dissolve,
  } satisfies Transition,

  dissolveIn: {
    duration: durations.smooth,
    ease: easings.dissolveIn,
  } satisfies Transition,

  dissolveOut: {
    duration: durations.smooth,
    ease: easings.dissolveOut,
  } satisfies Transition,

  pulse: {
    duration: durations.beat,
    ease: easings.pulse,
  } satisfies Transition,

  drift: {
    type: 'spring',
    stiffness: 40,
    damping: 30,
    mass: 1.2,
  } satisfies Transition,

  driftSlow: {
    type: 'spring',
    stiffness: 30,
    damping: 35,
    mass: 1.5,
  } satisfies Transition,
} as const

/**
 * Stagger Presets
 * For list/grid animations
 */
export const stagger = {
  fast: 0.03, // ASCII rapid-fire
  normal: 0.05, // XP/Aqua comfortable pace
  slow: 0.08, // Analogue deliberate reveal
} as const

/**
 * Helper: Get motion for theme
 */
export function getStudioMotion(theme: keyof typeof studioMotion) {
  return studioMotion[theme]
}

/**
 * Helper: Get transition for named curve
 */
export function getTransition(curve: keyof typeof transitions): Transition {
  return transitions[curve]
}

/**
 * Performance: GPU-Accelerated Animation Properties
 * Only animate these for 60fps performance:
 */
export const gpuProps = [
  'opacity',
  'transform',
  'translateX',
  'translateY',
  'translateZ',
  'scale',
  'scaleX',
  'scaleY',
  'rotate',
  'rotateX',
  'rotateY',
  'rotateZ',
] as const

/**
 * Avoid animating these (causes layout thrashing):
 */
export const layoutProps = [
  'width',
  'height',
  'top',
  'left',
  'right',
  'bottom',
  'padding',
  'margin',
] as const
