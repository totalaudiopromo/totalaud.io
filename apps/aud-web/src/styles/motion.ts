/**
 * Motion Tokens - totalaud.io OS Constellation
 * Unified animation timing and easing for cinematic UX
 */

// ============================================================
// DURATIONS (in seconds)
// ============================================================

export const duration = {
  // Core durations
  instant: 0,
  fast: 0.12, // Micro-interactions, hover states
  medium: 0.24, // OS transitions, modal animations
  slow: 0.4, // Camera pans, ambient effects

  // Specific use cases
  hover: 0.12,
  click: 0.08,
  pageTransition: 0.24,
  modalOpen: 0.24,
  cameraMove: 0.4,
  typing: 0.05, // Per character
} as const

// ============================================================
// EASING CURVES
// ============================================================

export const easing = {
  // Primary easing (use this by default)
  default: 'cubic-bezier(0.22, 1, 0.36, 1)',

  // Specialized easing
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  linear: 'linear',

  // Spring-like
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const

// ============================================================
// ANIMATION PRESETS
// ============================================================

export const animations = {
  // Fade animations
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: duration.medium,
    easing: easing.default,
  },

  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
    duration: duration.fast,
    easing: easing.default,
  },

  // Scale animations
  scaleIn: {
    from: { opacity: 0, transform: 'scale(0.95)' },
    to: { opacity: 1, transform: 'scale(1)' },
    duration: duration.medium,
    easing: easing.default,
  },

  scaleOut: {
    from: { opacity: 1, transform: 'scale(1)' },
    to: { opacity: 0, transform: 'scale(0.95)' },
    duration: duration.fast,
    easing: easing.default,
  },

  // Slide animations
  slideUp: {
    from: { opacity: 0, transform: 'translateY(8px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: duration.medium,
    easing: easing.default,
  },

  slideDown: {
    from: { opacity: 0, transform: 'translateY(-8px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: duration.medium,
    easing: easing.default,
  },
} as const

// ============================================================
// CSS TRANSITION HELPERS
// ============================================================

/**
 * Generate transition CSS string
 */
export const transition = (
  properties: string[],
  durationKey: keyof typeof duration = 'medium',
  easingKey: keyof typeof easing = 'default'
): string => {
  const durationValue = duration[durationKey]
  const easingValue = easing[easingKey]

  return properties.map((prop) => `${prop} ${durationValue}s ${easingValue}`).join(', ')
}

/**
 * Common transition presets
 */
export const transitions = {
  // All properties
  all: transition(['all'], 'medium', 'default'),
  allFast: transition(['all'], 'fast', 'default'),
  allSlow: transition(['all'], 'slow', 'default'),

  // Specific properties
  opacity: transition(['opacity'], 'medium', 'default'),
  transform: transition(['transform'], 'medium', 'default'),
  colors: transition(['color', 'background-color', 'border-color'], 'medium', 'default'),

  // Common combinations
  hover: transition(['transform', 'box-shadow', 'border-color'], 'fast', 'default'),
  modal: transition(['opacity', 'transform'], 'medium', 'default'),
  camera: transition(['transform'], 'slow', 'default'),
} as const

// ============================================================
// FRAMER MOTION VARIANTS
// ============================================================

/**
 * Framer Motion variants for common animations
 */
export const variants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: duration.medium, ease: [0.22, 1, 0.36, 1] },
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: duration.medium, ease: [0.22, 1, 0.36, 1] },
  },

  slideUp: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8 },
    transition: { duration: duration.medium, ease: [0.22, 1, 0.36, 1] },
  },

  slideDown: {
    initial: { opacity: 0, y: -8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: duration.medium, ease: [0.22, 1, 0.36, 1] },
  },

  stagger: {
    animate: {
      transition: {
        staggerChildren: duration.fast,
      },
    },
  },
} as const

// ============================================================
// REDUCED MOTION
// ============================================================

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Get duration respecting reduced motion preference
 */
export const getDuration = (durationKey: keyof typeof duration): number => {
  if (prefersReducedMotion()) return 0
  return duration[durationKey]
}

/**
 * Get transition respecting reduced motion preference
 */
export const getTransition = (
  properties: string[],
  durationKey: keyof typeof duration = 'medium',
  easingKey: keyof typeof easing = 'default'
): string => {
  if (prefersReducedMotion()) {
    return 'none'
  }
  return transition(properties, durationKey, easingKey)
}
