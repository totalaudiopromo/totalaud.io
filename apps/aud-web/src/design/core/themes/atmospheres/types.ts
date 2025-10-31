/**
 * Atmosphere Types
 *
 * Defines the environmental and sensory characteristics of each theme.
 * Atmospheres extend theme personalities with visual depth, motion signatures,
 * and soundscapes to create immersive studio environments.
 */

import type { CSSProperties } from 'react'

export type MotionSignature = 'fast-linear' | 'smooth' | 'snappy' | 'elastic' | 'slow-spring'
export type MicrocopyTone = 'terse' | 'friendly' | 'strategic' | 'rhythmic' | 'reflective'

/**
 * Atmosphere Configuration
 * Complete environmental settings for a theme
 */
export interface Atmosphere {
  /** Background visual characteristics */
  background: {
    /** CSS gradient (radial or linear) */
    gradient: string
    /** Enable subtle 12s pulse animation */
    animated?: boolean
    /** Grain texture overlay */
    grainOverlay: {
      src: string
      opacity: number
      blendMode: CSSProperties['mixBlendMode']
    }
    /** Optional vignette effect */
    vignette?: {
      opacity: number
    }
  }

  /** Depth and layering effects */
  depth: {
    /** Shadow configurations */
    shadows: {
      panel: string
      hover: string
    }
    /** Glow effects */
    glows: {
      accent: string
      edge: string
    }
    /** Subtle parallax movement */
    parallax: {
      scale: number
      translate: number
    }
  }

  /** Motion behaviour signature */
  motionSignature: MotionSignature

  /** Soundscape identifiers */
  soundscape: {
    ambientKey: string
    uiClickKey: string
    hoverKey: string
  }

  /** Typography adjustments (optional) */
  typographyTweak?: {
    family?: 'mono' | 'sans' | 'serif'
    weight?: 400 | 500 | 600
    tracking?: number
  }

  /** Microcopy tone for this theme */
  microcopyTone: MicrocopyTone
}
