/**
 * Atmospheres Index
 *
 * Central export for all theme atmospheres.
 * Provides type-safe access to atmosphere configurations.
 */

import type { ThemeId } from '../themes'
import type { Atmosphere } from './types'

import { operatorAtmosphere } from './operator.atmosphere'
import { guideAtmosphere } from './guide.atmosphere'
import { mapAtmosphere } from './map.atmosphere'
import { timelineAtmosphere } from './timeline.atmosphere'
import { tapeAtmosphere } from './tape.atmosphere'

/**
 * Atmosphere Registry
 * Maps theme IDs to their atmosphere configurations
 */
export const atmospheres: Record<ThemeId, Atmosphere> = {
  operator: operatorAtmosphere,
  guide: guideAtmosphere,
  map: mapAtmosphere,
  timeline: timelineAtmosphere,
  tape: tapeAtmosphere,
}

/**
 * Get atmosphere configuration for a theme
 *
 * @param themeId - Theme identifier
 * @returns Atmosphere configuration
 *
 * @example
 * ```tsx
 * const atmosphere = getAtmosphere('operator')
 * console.log(atmosphere.motionSignature) // 'fast-linear'
 * ```
 */
export function getAtmosphere(themeId: ThemeId): Atmosphere {
  return atmospheres[themeId]
}

/**
 * Get all atmosphere theme IDs
 */
export function getAllAtmosphereIds(): ThemeId[] {
  return Object.keys(atmospheres) as ThemeId[]
}

// Re-export types
export type { Atmosphere, MotionSignature, MicrocopyTone } from './types'
