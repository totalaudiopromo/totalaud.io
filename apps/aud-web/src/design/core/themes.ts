/**
 * Theme Personality Mapping
 *
 * Extends FlowCore with theme-specific personality systems.
 * Each theme has unique motion, sound, texture, and tone characteristics.
 *
 * Phase 12.4: Theme Fusion - From colour presets to personality systems
 */

import { easingCurves, durations, transitions } from './motion'
import { uiSounds, ambientSounds, type SoundConfig } from './sounds'
import { shadows, glows, borders, borderRadius, backdrops } from './textures'
import { getAtmosphere, type Atmosphere } from './themes/atmospheres'

/**
 * Theme IDs matching existing OSTheme types
 */
export type ThemeId = 'operator' | 'guide' | 'map' | 'timeline' | 'tape'

/**
 * Motion Personality Types
 */
export type MotionType =
  | 'fast-linear'
  | 'smooth-easeInOut'
  | 'snappy-inOut'
  | 'elastic'
  | 'slow-spring'

/**
 * Texture Personality Types
 */
export type TextureType =
  | 'matte-grain'
  | 'paper-grain'
  | 'grid-texture'
  | 'film-grain'
  | 'noise-texture'

/**
 * Theme Personality Configuration
 * Defines the complete sensory experience for each theme
 */
export interface ThemePersonality {
  /** Theme identifier */
  id: ThemeId
  /** Display name */
  name: string
  /** Personality tagline */
  tagline: string
  /** Emotional tone */
  tone: string

  /** Colour palette */
  colours: {
    accent: string
    surface: string
    background: string
    foreground: string
    border: string
    textSecondary?: string
  }

  /** Motion characteristics */
  motion: {
    type: MotionType
    transition: typeof transitions.micro | typeof transitions.smooth | typeof transitions.ambient
    easing:
      | typeof easingCurves.smooth
      | typeof easingCurves.sharp
      | typeof easingCurves.bounce
      | typeof easingCurves.easeOut
    duration: number
  }

  /** Sound personality */
  sound: {
    ui: SoundConfig
    ambient: SoundConfig
    description: string
  }

  /** Texture characteristics */
  texture: {
    type: TextureType
    shadow: string
    glow: string
    border: string
    radius: string
    backdrop: string
  }

  /** Atmosphere configuration */
  atmosphere: Atmosphere
}

/**
 * Theme Personality Definitions
 */
export const themePersonalities: Record<ThemeId, ThemePersonality> = {
  /**
   * Operator - ASCII Terminal Precision
   * Precise, focused, minimal
   */
  operator: {
    id: 'operator',
    name: 'Operator',
    tagline: 'type. test. repeat.',
    tone: 'precise, focused',

    colours: {
      accent: '#3AA9BE', // Slate Cyan
      surface: '#1A1C1F',
      background: '#0F1113',
      foreground: '#EAECEE',
      border: '#2C2F33',
    },

    motion: {
      type: 'fast-linear',
      transition: transitions.micro,
      easing: easingCurves.sharp,
      duration: durations.fast, // 120ms
    },

    sound: {
      ui: {
        type: 'square',
        frequency: 880, // A5 - sharp, digital
        duration: 100,
        volume: 0.3,
      },
      ambient: {
        type: 'sine',
        frequency: 220, // A3 - low hum
        duration: 2000,
        volume: 0.1,
      },
      description: 'Square wave clicks, low sine hum (220 Hz)',
    },

    texture: {
      type: 'matte-grain',
      shadow: shadows.none,
      glow: glows.subtle,
      border: borders.thin,
      radius: borderRadius.none,
      backdrop: backdrops.none,
    },

    atmosphere: getAtmosphere('operator'),
  },

  /**
   * Guide - Warm Helper Assistant
   * Warm, helpful, nostalgic
   */
  guide: {
    id: 'guide',
    name: 'Guide',
    tagline: 'click. bounce. smile.',
    tone: 'warm, helpful',

    colours: {
      accent: '#F0C674', // Soft Amber
      surface: '#1C1C1E',
      background: '#121214',
      foreground: '#E8E8E8',
      border: '#3A3A3C',
    },

    motion: {
      type: 'smooth-easeInOut',
      transition: transitions.smooth,
      easing: easingCurves.smooth,
      duration: durations.normal, // 240ms
    },

    sound: {
      ui: {
        type: 'sine',
        frequency: 660, // E5 - warm, inviting
        duration: 120,
        volume: 0.3,
      },
      ambient: {
        type: 'triangle',
        frequency: 440, // A4 - Amaj7 chord base
        duration: 4000,
        volume: 0.15,
      },
      description: 'Soft sine waves, Amaj7 pad (440 Hz)',
    },

    texture: {
      type: 'paper-grain',
      shadow: shadows.md,
      glow: glows.normal,
      border: borders.normal,
      radius: borderRadius.md,
      backdrop: backdrops.subtle,
    },

    atmosphere: getAtmosphere('guide'),
  },

  /**
   * Map - Analytical Grid System
   * Analytical, precise, data-driven
   */
  map: {
    id: 'map',
    name: 'Map',
    tagline: 'craft with clarity.',
    tone: 'analytical, precise',

    colours: {
      accent: '#7DD87D', // Green
      surface: '#161818',
      background: '#0D0F0F',
      foreground: '#E0E0E0',
      border: '#2A2C2C',
    },

    motion: {
      type: 'snappy-inOut',
      transition: transitions.command,
      easing: easingCurves.sharp,
      duration: durations.fast, // 120ms
    },

    sound: {
      ui: {
        type: 'triangle',
        frequency: 1320, // E6 - percussive click
        duration: 80,
        volume: 0.35,
      },
      ambient: {
        type: 'square',
        frequency: 110, // A2 - low grid hum
        duration: 1000,
        volume: 0.08,
      },
      description: 'Percussive triangle waves, low grid hum (110 Hz)',
    },

    texture: {
      type: 'grid-texture',
      shadow: shadows.sm,
      glow: glows.normal,
      border: borders.thin,
      radius: borderRadius.lg,
      backdrop: backdrops.frosted,
    },

    atmosphere: getAtmosphere('map'),
  },

  /**
   * Timeline - Cinematic DAW Producer
   * Cinematic, rhythmic, experimental
   */
  timeline: {
    id: 'timeline',
    name: 'Timeline',
    tagline: 'sync. sequence. create.',
    tone: 'cinematic, rhythmic',

    colours: {
      accent: '#9A73E3', // Purple
      surface: '#1A1A1E',
      background: '#0F0F13',
      foreground: '#E5E5E8',
      border: '#33333A',
    },

    motion: {
      type: 'elastic',
      transition: transitions.bounce,
      easing: easingCurves.bounce,
      duration: durations.normal, // 240ms
    },

    sound: {
      ui: {
        type: 'sawtooth',
        frequency: 880, // A5 - producer, experimental
        duration: 100,
        volume: 0.3,
      },
      ambient: {
        type: 'sine',
        frequency: 440, // A4 - 120 BPM pulse
        duration: 500, // 120 BPM = 500ms per beat
        volume: 0.12,
      },
      description: 'Sawtooth clicks, 120 BPM sine pulse (440 Hz)',
    },

    texture: {
      type: 'film-grain',
      shadow: shadows.lg,
      glow: glows.strong,
      border: borders.bold,
      radius: borderRadius.sm,
      backdrop: backdrops.normal,
    },

    atmosphere: getAtmosphere('timeline'),
  },

  /**
   * Tape - Nostalgic Analogue Warmth
   * Nostalgic, warm, human
   */
  tape: {
    id: 'tape',
    name: 'Tape',
    tagline: 'touch the signal.',
    tone: 'nostalgic, warm',

    colours: {
      accent: '#E15554', // Coral Red
      surface: '#1C1818',
      background: '#131010',
      foreground: '#E8E0E0',
      border: '#3A3232',
    },

    motion: {
      type: 'slow-spring',
      transition: transitions.ambient,
      easing: easingCurves.easeOut,
      duration: durations.slow, // 400ms
    },

    sound: {
      ui: {
        type: 'sine',
        frequency: 440, // A4 - warm, gentle
        duration: 150,
        volume: 0.25,
      },
      ambient: {
        type: 'sine',
        frequency: 110, // A2 - vinyl noise base
        duration: 3000,
        volume: 0.1,
      },
      description: 'Gentle sine waves, vinyl noise texture (110 Hz)',
    },

    texture: {
      type: 'noise-texture',
      shadow: shadows.md,
      glow: glows.subtle,
      border: borders.thin,
      radius: borderRadius.xl,
      backdrop: backdrops.subtle,
    },

    atmosphere: getAtmosphere('tape'),
  },
}

/**
 * Get theme personality by ID
 */
export function getThemePersonality(themeId: ThemeId): ThemePersonality {
  return themePersonalities[themeId] || themePersonalities.operator
}

/**
 * Get all theme IDs
 */
export function getAllThemeIds(): ThemeId[] {
  return Object.keys(themePersonalities) as ThemeId[]
}
