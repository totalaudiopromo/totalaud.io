'use client'

import { createContext, useContext } from 'react'
import type { OSSlug } from '@/components/os/navigation'
import type { AmbientPreset, TimeOfDay } from './ambientPresets'

export interface AmbientState {
  enabled: boolean
  /**
   * User-controlled global intensity (0–1).
   */
  intensity: number
  /**
   * Effective intensity after reduced-motion + presence.
   */
  effectiveIntensity: number
  timeOfDay: TimeOfDay
  preset: AmbientPreset
  currentOS: OSSlug | null
  /**
   * OS-specific accent multiplier (0–1).
   */
  osAccent: number
  /**
   * Presence signal: true when user has been idle for > idleThresholdMs.
   */
  isIdle: boolean
  /**
   * Scales values into ambient space (0–1), respecting reduced motion.
   */
  scale: (value: number) => number
}

export interface AmbientController {
  setEnabled: (enabled: boolean) => void
  setIntensity: (intensity: number) => void
  setPresetId: (id: string) => void
}

export type AmbientContextValue = AmbientState & AmbientController

export const AmbientContext = createContext<AmbientContextValue | null>(null)

export function useAmbient(): AmbientContextValue {
  const value = useContext(AmbientContext)
  if (!value) {
    throw new Error('useAmbient must be used within an AmbientEngineProvider')
  }
  return value
}

export function useOptionalAmbient(): AmbientContextValue | null {
  return useContext(AmbientContext)
}


