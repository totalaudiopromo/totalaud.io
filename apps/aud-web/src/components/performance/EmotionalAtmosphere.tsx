/**
 * Emotional Atmosphere
 * Phase 16: Background gradient layer driven by global OS atmosphere
 */

'use client'

import { motion } from 'framer-motion'
import { usePerformance } from './PerformanceCanvas'

/**
 * Emotional Atmosphere background layer
 */
export function EmotionalAtmosphere() {
  const { performanceState } = usePerformance()
  const { cohesion, tension, energy } = performanceState.globalAtmosphere

  // Generate gradient colours based on atmosphere
  const cohesionColour = getCohesionColour(cohesion, energy)
  const tensionColour = getTensionColour(tension, energy)

  // Blend gradient based on cohesion vs tension dominance
  const gradientStops = generateGradientStops(cohesionColour, tensionColour, cohesion, tension)

  return (
    <motion.div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: `radial-gradient(ellipse at center, ${gradientStops.inner}, ${gradientStops.outer})`,
      }}
      animate={{
        opacity: 0.3 + energy * 0.4, // 0.3-0.7 based on energy
      }}
      transition={{
        duration: 0.4,
        ease: 'easeInOut',
      }}
    />
  )
}

/**
 * Get cohesion colour (blue-green spectrum)
 */
function getCohesionColour(cohesion: number, energy: number): string {
  const brightness = 30 + energy * 50 // 30-80 lightness
  const saturation = 40 + cohesion * 40 // 40-80 saturation

  // Interpolate from cyan to green based on cohesion
  const hue = 180 + cohesion * 60 // 180 (cyan) to 240 (green)

  return `hsl(${hue}, ${saturation}%, ${brightness}%)`
}

/**
 * Get tension colour (red-orange spectrum)
 */
function getTensionColour(tension: number, energy: number): string {
  const brightness = 20 + energy * 40 // 20-60 lightness
  const saturation = 50 + tension * 40 // 50-90 saturation

  // Interpolate from orange to red based on tension
  const hue = 30 - tension * 30 // 30 (orange) to 0 (red)

  return `hsl(${hue}, ${saturation}%, ${brightness}%)`
}

/**
 * Generate gradient stops based on cohesion vs tension dominance
 */
function generateGradientStops(
  cohesionColour: string,
  tensionColour: string,
  cohesion: number,
  tension: number
): { inner: string; outer: string } {
  // If cohesion dominates, use cohesion colour in center
  if (cohesion > tension) {
    return {
      inner: cohesionColour,
      outer: `${tensionColour}00`, // Transparent tension at edges
    }
  }

  // If tension dominates, use tension colour in center
  if (tension > cohesion) {
    return {
      inner: tensionColour,
      outer: `${cohesionColour}00`, // Transparent cohesion at edges
    }
  }

  // Balanced - blend both
  return {
    inner: cohesionColour,
    outer: tensionColour,
  }
}
