/**
 * Motion Profiles - Animation Grammar per Theme
 *
 * Each theme has unique motion DNA that affects all transitions,
 * micro-interactions, and UI responses.
 */

export interface MotionProfile {
  duration: {
    instant: number
    fast: number
    medium: number
    slow: number
    lazy: number
  }
  easing: {
    ease: string
    easeIn: string
    easeOut: string
    easeInOut: string
    spring: string
  }
  spring: {
    stiffness: number
    damping: number
    mass: number
  }
  keyframes: {
    fps: number
    bpm?: number // For DAW theme tempo sync
  }
  transitions: {
    fadeIn: string
    fadeOut: string
    slideIn: string
    slideOut: string
    scale: string
  }
  reducedMotionScale: number // 0-1, how much to reduce motion
}

export const motionProfiles: Record<string, MotionProfile> = {
  /**
   * ASCII - Snappy Execution
   * "type. test. repeat."
   * Instant changes, no easing, zero compromise
   */
  ascii: {
    duration: {
      instant: 0,
      fast: 120,
      medium: 120,
      slow: 120,
      lazy: 120,
    },
    easing: {
      ease: 'linear',
      easeIn: 'linear',
      easeOut: 'linear',
      easeInOut: 'linear',
      spring: 'linear',
    },
    spring: {
      stiffness: 1000, // Extremely stiff = instant
      damping: 100,
      mass: 0.1,
    },
    keyframes: {
      fps: 60,
    },
    transitions: {
      fadeIn: 'opacity 120ms linear',
      fadeOut: 'opacity 120ms linear',
      slideIn: 'transform 120ms linear',
      slideOut: 'transform 120ms linear',
      scale: 'transform 120ms linear',
    },
    reducedMotionScale: 0, // Always instant
  },

  /**
   * XP - Smooth Bounce
   * "click. bounce. smile."
   * Playful spring, nostalgic fluidity
   */
  xp: {
    duration: {
      instant: 0,
      fast: 180,
      medium: 240,
      slow: 400,
      lazy: 600,
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Spring overshoot
    },
    spring: {
      stiffness: 300,
      damping: 20,
      mass: 0.8,
    },
    keyframes: {
      fps: 60,
    },
    transitions: {
      fadeIn: 'opacity 240ms cubic-bezier(0, 0, 0.2, 1)',
      fadeOut: 'opacity 240ms cubic-bezier(0.4, 0, 1, 1)',
      slideIn: 'transform 240ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      slideOut: 'transform 240ms cubic-bezier(0.4, 0, 0.2, 1)',
      scale: 'transform 240ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
    reducedMotionScale: 0.5,
  },

  /**
   * Aqua - Elastic Smoothness
   * "craft with clarity."
   * Fluid glass motion, subtle spring
   */
  aqua: {
    duration: {
      instant: 0,
      fast: 300,
      medium: 400,
      slow: 600,
      lazy: 800,
    },
    easing: {
      ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
      easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
      spring: 'cubic-bezier(0.22, 0.61, 0.36, 1)', // Gentle spring
    },
    spring: {
      stiffness: 200,
      damping: 25,
      mass: 1.0,
    },
    keyframes: {
      fps: 60,
    },
    transitions: {
      fadeIn: 'opacity 400ms cubic-bezier(0, 0, 0.58, 1)',
      fadeOut: 'opacity 400ms cubic-bezier(0.42, 0, 1, 1)',
      slideIn: 'transform 400ms cubic-bezier(0.22, 0.61, 0.36, 1)',
      slideOut: 'transform 400ms cubic-bezier(0.42, 0, 0.58, 1)',
      scale: 'transform 400ms cubic-bezier(0.22, 0.61, 0.36, 1)',
    },
    reducedMotionScale: 0.6,
  },

  /**
   * DAW - Rhythmic Precision
   * "sync. sequence. create."
   * 120 BPM tempo-locked, 4/4 time signature
   */
  daw: {
    duration: {
      instant: 0,
      fast: 250, // 1/8th note @ 120 BPM (500ms per beat / 2)
      medium: 500, // 1 beat @ 120 BPM
      slow: 1000, // 2 beats
      lazy: 2000, // 4 beats (1 bar)
    },
    easing: {
      ease: 'steps(4, jump-end)', // Quantized steps
      easeIn: 'cubic-bezier(0.5, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.5, 1)',
      easeInOut: 'cubic-bezier(0.5, 0, 0.5, 1)',
      spring: 'steps(8, jump-end)', // 8th note quantization
    },
    spring: {
      stiffness: 400,
      damping: 30,
      mass: 0.6,
    },
    keyframes: {
      fps: 60,
      bpm: 120, // Tempo reference
    },
    transitions: {
      fadeIn: 'opacity 500ms steps(4, jump-end)',
      fadeOut: 'opacity 500ms steps(4, jump-end)',
      slideIn: 'transform 500ms cubic-bezier(0, 0, 0.5, 1)',
      slideOut: 'transform 500ms cubic-bezier(0.5, 0, 1, 1)',
      scale: 'transform 500ms cubic-bezier(0.5, 0, 0.5, 1)',
    },
    reducedMotionScale: 0.3,
  },

  /**
   * Analogue - Slow Drift
   * "touch the signal."
   * Lazy fade, warm texture, human timing
   */
  analogue: {
    duration: {
      instant: 0,
      fast: 400,
      medium: 600,
      slow: 800,
      lazy: 1200,
    },
    easing: {
      ease: 'cubic-bezier(0.33, 1, 0.68, 1)', // Gentle S-curve
      easeIn: 'cubic-bezier(0.55, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.45, 1)',
      easeInOut: 'cubic-bezier(0.45, 0, 0.55, 1)',
      spring: 'cubic-bezier(0.17, 0.67, 0.83, 0.67)', // Soft bounce
    },
    spring: {
      stiffness: 150,
      damping: 30,
      mass: 1.2,
    },
    keyframes: {
      fps: 48, // Film-like 48fps
    },
    transitions: {
      fadeIn: 'opacity 600ms cubic-bezier(0, 0, 0.45, 1)',
      fadeOut: 'opacity 600ms cubic-bezier(0.55, 0, 1, 1)',
      slideIn: 'transform 600ms cubic-bezier(0.17, 0.67, 0.83, 0.67)',
      slideOut: 'transform 600ms cubic-bezier(0.45, 0, 0.55, 1)',
      scale: 'transform 600ms cubic-bezier(0.33, 1, 0.68, 1)',
    },
    reducedMotionScale: 0.7,
  },
}

/**
 * Get motion profile by theme name
 */
export function getMotionProfile(themeName: string): MotionProfile {
  return motionProfiles[themeName] || motionProfiles.ascii
}

/**
 * Generate Framer Motion spring config from profile
 */
export function getFramerSpring(themeName: string) {
  const profile = getMotionProfile(themeName)
  return {
    type: 'spring' as const,
    stiffness: profile.spring.stiffness,
    damping: profile.spring.damping,
    mass: profile.spring.mass,
  }
}

/**
 * Generate CSS transition string from profile
 */
export function getCSSTransition(
  themeName: string,
  property: string,
  speed: 'fast' | 'medium' | 'slow' = 'medium'
): string {
  const profile = getMotionProfile(themeName)
  const duration = profile.duration[speed]
  const easing = profile.easing.easeOut

  return `${property} ${duration}ms ${easing}`
}

/**
 * Check if user prefers reduced motion (OS setting)
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Get reduced motion variant of motion profile
 * - Disables springs (use linear/ease-out instead)
 * - Reduces durations by reducedMotionScale
 * - Max duration capped at 120ms
 */
export function getReducedMotionProfile(themeName: string): MotionProfile {
  const profile = getMotionProfile(themeName)
  const scale = profile.reducedMotionScale

  return {
    ...profile,
    duration: {
      instant: 0,
      fast: Math.min(80, Math.round(profile.duration.fast * scale)),
      medium: Math.min(100, Math.round(profile.duration.medium * scale)),
      slow: Math.min(120, Math.round(profile.duration.slow * scale)),
      lazy: Math.min(120, Math.round(profile.duration.lazy * scale)),
    },
    easing: {
      ease: 'ease-out',
      easeIn: 'ease-out',
      easeOut: 'ease-out',
      easeInOut: 'ease-out',
      spring: 'ease-out', // No springs in reduced motion
    },
    spring: {
      stiffness: 1000, // Instant = no spring bounce
      damping: 100,
      mass: 0.1,
    },
    transitions: {
      fadeIn: 'opacity 100ms ease-out',
      fadeOut: 'opacity 100ms ease-out',
      slideIn: 'transform 100ms ease-out',
      slideOut: 'transform 100ms ease-out',
      scale: 'opacity 100ms ease-out', // Scale becomes fade-only
    },
  }
}

/**
 * Get motion profile with automatic reduced motion detection
 */
export function getAdaptiveMotionProfile(
  themeName: string,
  calmModeEnabled: boolean = false
): MotionProfile {
  if (prefersReducedMotion() || calmModeEnabled) {
    return getReducedMotionProfile(themeName)
  }
  return getMotionProfile(themeName)
}

/**
 * Sync animation to DAW BPM (if applicable)
 */
export function syncToBPM(themeName: string, beats: number = 1): number {
  const profile = getMotionProfile(themeName)

  if (themeName === 'timeline' && profile.keyframes.bpm) {
    const msPerBeat = 60000 / profile.keyframes.bpm
    return msPerBeat * beats
  }

  // Fallback to medium duration
  return profile.duration.medium
}

/**
 * Apply reduced motion preferences
 */
export function getReducedMotionDuration(themeName: string, originalDuration: number): number {
  if (typeof window !== 'undefined') {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      const profile = getMotionProfile(themeName)
      return originalDuration * profile.reducedMotionScale
    }
  }
  return originalDuration
}
