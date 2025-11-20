'use client'

import type { OSSlug } from '@/components/os/navigation'

export type TimeOfDay = 'morning' | 'dusk' | 'night'

export interface AmbientPreset {
  id: string
  label: string
  /**
   * Base intensity multiplier for this preset (0–1).
   */
  intensity: number
  /**
   * Per-OS accent strength multiplier (0–1).
   */
  osAccent: Partial<Record<OSSlug, number>>
  /**
   * Time-of-day tint mapping.
   */
  tints: Record<
    TimeOfDay,
    {
      hueShift: number
      saturation: number
      brightness: number
    }
  >
}

export const AMBIENT_PRESETS: AmbientPreset[] = [
  {
    id: 'default',
    label: 'Default',
    intensity: 0.6,
    osAccent: {
      core: 0.9,
      ascii: 0.7,
      xp: 0.8,
      aqua: 1,
      daw: 0.9,
      analogue: 0.75,
    },
    tints: {
      morning: {
        hueShift: 0,
        saturation: 0.92,
        brightness: 1.02,
      },
      dusk: {
        hueShift: -6,
        saturation: 0.96,
        brightness: 0.96,
      },
      night: {
        hueShift: -12,
        saturation: 0.9,
        brightness: 0.9,
      },
    },
  },
  {
    id: 'demo-night',
    label: 'Demo Night',
    intensity: 0.85,
    osAccent: {
      core: 1,
      ascii: 0.8,
      xp: 0.9,
      aqua: 1,
      daw: 1,
      analogue: 0.8,
    },
    tints: {
      morning: {
        hueShift: -4,
        saturation: 1,
        brightness: 0.98,
      },
      dusk: {
        hueShift: -10,
        saturation: 1.05,
        brightness: 0.95,
      },
      night: {
        hueShift: -14,
        saturation: 1.1,
        brightness: 0.88,
      },
    },
  },
]

export function getTimeOfDay(now = new Date()): TimeOfDay {
  const hours = now.getHours()
  if (hours >= 6 && hours < 16) return 'morning'
  if (hours >= 16 && hours < 22) return 'dusk'
  return 'night'
}


