/**
 * Motion Tokens
 *
 * Centralised animation constants for consistent motion across the app.
 * Based on the design system spec in CLAUDE.md:
 * - fast: 120ms - micro feedback, button presses
 * - normal: 240ms - pane transitions, modals
 * - slow: 400ms - calm fades, ambient effects
 *
 * All animations should use Framer Motion, not CSS transitions.
 */

import type { Transition, Variants } from 'framer-motion'

// Duration tokens (in seconds for Framer Motion)
export const duration = {
  fast: 0.12, // 120ms - micro feedback
  normal: 0.24, // 240ms - transitions
  slow: 0.4, // 400ms - calm fades
} as const

// Easing curves
export const easing = {
  /** Standard easing for fast/normal transitions */
  standard: [0.22, 1, 0.36, 1] as const,
  /** Ease in-out for slow/ambient effects */
  easeInOut: [0.4, 0, 0.2, 1] as const,
} as const

// Transition presets
export const transition = {
  fast: {
    duration: duration.fast,
    ease: easing.standard,
  } satisfies Transition,
  normal: {
    duration: duration.normal,
    ease: easing.standard,
  } satisfies Transition,
  slow: {
    duration: duration.slow,
    ease: easing.easeInOut,
  } satisfies Transition,
} as const

// Spring presets for bouncy interactions
export const spring = {
  /** Snappy spring for buttons and quick interactions */
  snappy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 25,
  },
  /** Gentle spring for larger movements */
  gentle: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 20,
  },
} as const

// Stagger configuration for lists
export const stagger = {
  /** Fast stagger for quick list reveals */
  fast: 0.03,
  /** Normal stagger for standard lists */
  normal: 0.05,
  /** Slow stagger for emphasised sequences */
  slow: 0.1,
} as const

// Common animation variants
export const variants = {
  /** Simple fade in/out */
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  } satisfies Variants,

  /** Slide up with fade */
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  } satisfies Variants,

  /** Slide down with fade */
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  } satisfies Variants,

  /** Scale in with fade (for modals/dialogs) */
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  } satisfies Variants,

  /** Subtle hover lift for cards */
  hoverLift: {
    initial: { y: 0 },
    hover: { y: -2 },
  } satisfies Variants,
} as const

// Stagger container variants
export const staggerContainer = {
  /** Container for staggered children with fast timing */
  fast: {
    animate: {
      transition: {
        staggerChildren: stagger.fast,
      },
    },
  } satisfies Variants,

  /** Container for staggered children with normal timing */
  normal: {
    animate: {
      transition: {
        staggerChildren: stagger.normal,
      },
    },
  } satisfies Variants,

  /** Container for staggered children with slow timing */
  slow: {
    animate: {
      transition: {
        staggerChildren: stagger.slow,
      },
    },
  } satisfies Variants,
} as const

// Stagger item variants (for use with staggerContainer)
export const staggerItem = {
  /** Standard stagger item with slide up */
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: transition.normal,
    },
  } satisfies Variants,

  /** Stagger item with fade only */
  fade: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: transition.normal,
    },
  } satisfies Variants,

  /** Stagger item with scale */
  scale: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: transition.normal,
    },
  } satisfies Variants,
} as const
