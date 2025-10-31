/**
 * Theme Personality Microcopy
 *
 * Lower-case tone variations for toasts, hints, and inline feedback.
 * Each theme has its own personality voice.
 *
 * Phase 13.0: FlowCore Studio Aesthetics
 */

import type { ThemeId } from './themes'

/**
 * Microcopy Tone Configuration
 */
export interface ThemeTone {
  confirm: string
  hint: string
}

/**
 * Theme Tone Variations
 * All lower-case, personality-driven microcopy
 */
export const themeTone: Record<ThemeId, ThemeTone> = {
  /** Operator - Terse, terminal-style */
  operator: {
    confirm: 'confirmed.',
    hint: 'ready.',
  },

  /** Guide - Friendly, approachable */
  guide: {
    confirm: 'all set.',
    hint: 'try this.',
  },

  /** Map - Strategic, precise */
  map: {
    confirm: 'locked in.',
    hint: 'next step.',
  },

  /** Timeline - Rhythmic, temporal */
  timeline: {
    confirm: 'in sync.',
    hint: 'cue set.',
  },

  /** Tape - Reflective, nostalgic */
  tape: {
    confirm: 'noted.',
    hint: 'replay that.',
  },
} as const

/**
 * Get tone for a specific theme
 *
 * @param themeId - Theme identifier
 * @returns Tone configuration
 *
 * @example
 * ```tsx
 * const tone = getThemeTone('operator')
 * toast.success(tone.confirm) // "confirmed."
 * ```
 */
export function getThemeTone(themeId: ThemeId): ThemeTone {
  return themeTone[themeId]
}
