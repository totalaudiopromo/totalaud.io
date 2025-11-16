'use client'

/**
 * Ambient Engine Provider (Stub for Phase 28A)
 * Manages ambient visuals and audio intensity
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface AmbientContextValue {
  intensity: number
  effectiveIntensity: number
  isIdle: boolean
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  setIntensity: (intensity: number) => void
}

const AmbientContext = createContext<AmbientContextValue | null>(null)

export interface AmbientEngineProviderProps {
  children: ReactNode
}

export function AmbientEngineProvider({ children }: AmbientEngineProviderProps) {
  const [intensity, setIntensityState] = useState(0.5)
  const [isIdle, setIsIdle] = useState(false)

  // Simple time of day detection
  const timeOfDay = (() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 17) return 'afternoon'
    if (hour >= 17 && hour < 21) return 'evening'
    return 'night'
  })()

  const effectiveIntensity = isIdle ? intensity * 1.2 : intensity

  const setIntensity = useCallback((newIntensity: number) => {
    setIntensityState(Math.max(0, Math.min(1, newIntensity)))
  }, [])

  const value: AmbientContextValue = {
    intensity,
    effectiveIntensity,
    isIdle,
    timeOfDay,
    setIntensity,
  }

  return <AmbientContext.Provider value={value}>{children}</AmbientContext.Provider>
}

export function useAmbient(): AmbientContextValue {
  const context = useContext(AmbientContext)
  if (!context) {
    throw new Error('useAmbient must be used within AmbientEngineProvider')
  }
  return context
}

export function useOptionalAmbient(): AmbientContextValue | null {
  return useContext(AmbientContext)
}
