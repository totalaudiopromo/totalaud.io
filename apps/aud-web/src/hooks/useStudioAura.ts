/**
 * useStudioAura Hook
 *
 * Provides reactive background lighting/glow based on user activity.
 * Background color and intensity shift with user engagement.
 *
 * Phase 6: Enhancements - Studio Aura System
 */

import { useMemo } from 'react'

export interface StudioAura {
  /** Base color for the aura (CSS color string) */
  baseColor: string

  /** Activity multiplier (0-1) affects glow intensity */
  activityMultiplier: number

  /** Glow intensity percentage (0-100) */
  glowIntensity: number

  /** Secondary color for gradients */
  secondaryColor: string

  /** Glow blur radius in pixels */
  blurRadius: number

  /** CSS gradient string for background */
  backgroundGradient: string
}

const AURA_CONFIGS = {
  ascii: {
    baseColor: 'rgba(16, 185, 129, 0.15)', // Green glow
    secondaryColor: 'rgba(16, 185, 129, 0.05)',
    idleIntensity: 20,
    activeIntensity: 60,
    blurRadius: 100,
  },
  xp: {
    baseColor: 'rgba(59, 130, 246, 0.12)', // Blue glow
    secondaryColor: 'rgba(16, 185, 129, 0.08)', // Green tint
    idleIntensity: 15,
    activeIntensity: 50,
    blurRadius: 120,
  },
  aqua: {
    baseColor: 'rgba(96, 165, 250, 0.1)', // Sky blue
    secondaryColor: 'rgba(96, 165, 250, 0.03)',
    idleIntensity: 10,
    activeIntensity: 35,
    blurRadius: 150,
  },
  daw: {
    baseColor: 'rgba(168, 85, 247, 0.15)', // Purple glow
    secondaryColor: 'rgba(236, 72, 153, 0.1)', // Pink tint
    idleIntensity: 25,
    activeIntensity: 70,
    blurRadius: 80,
  },
  analogue: {
    baseColor: 'rgba(245, 158, 11, 0.08)', // Amber glow
    secondaryColor: 'rgba(249, 115, 22, 0.05)', // Orange tint
    idleIntensity: 12,
    activeIntensity: 40,
    blurRadius: 140,
  },
}

/**
 * Get Studio Aura configuration based on theme and activity level
 *
 * @param theme - Studio theme (ascii, xp, aqua, daw, analogue)
 * @param activityLevel - User activity level (0-100)
 */
export function useStudioAura(theme: string, activityLevel: number): StudioAura {
  const config = AURA_CONFIGS[theme as keyof typeof AURA_CONFIGS] || AURA_CONFIGS.ascii

  const aura = useMemo(() => {
    // Normalize activity level to 0-1
    const normalizedActivity = Math.min(100, Math.max(0, activityLevel)) / 100

    // Calculate intensity based on activity
    const glowIntensity =
      config.idleIntensity + (config.activeIntensity - config.idleIntensity) * normalizedActivity

    // Activity multiplier for other effects
    const activityMultiplier = normalizedActivity

    // Generate gradient based on activity
    const backgroundGradient = `radial-gradient(circle at 50% 50%, ${config.baseColor} 0%, ${config.secondaryColor} ${100 - glowIntensity}%, transparent 100%)`

    return {
      baseColor: config.baseColor,
      secondaryColor: config.secondaryColor,
      activityMultiplier,
      glowIntensity,
      blurRadius: config.blurRadius,
      backgroundGradient,
    }
  }, [theme, activityLevel, config])

  return aura
}

/**
 * Get error state aura (red tint)
 */
export function getErrorAura(): Partial<StudioAura> {
  return {
    baseColor: 'rgba(239, 68, 68, 0.15)',
    secondaryColor: 'rgba(239, 68, 68, 0.05)',
    glowIntensity: 50,
    backgroundGradient:
      'radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 50%, transparent 100%)',
  }
}

/**
 * Get success state aura (green pulse)
 */
export function getSuccessAura(): Partial<StudioAura> {
  return {
    baseColor: 'rgba(34, 197, 94, 0.2)',
    secondaryColor: 'rgba(34, 197, 94, 0.08)',
    glowIntensity: 70,
    backgroundGradient:
      'radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.08) 30%, transparent 100%)',
  }
}
