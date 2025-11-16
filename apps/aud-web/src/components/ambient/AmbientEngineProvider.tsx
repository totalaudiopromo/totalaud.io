'use client'

/**
 * Ambient Engine Provider - Phase 29 Pass 5
 * Manages ambient visuals and audio intensity with Web Audio API
 */

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react'
import { AmbientEngine, type EffectName } from '@/lib/audio/AmbientEngine'
import { prefersReducedMotion } from '@/styles/motion'

interface AmbientContextValue {
  intensity: number
  effectiveIntensity: number
  isIdle: boolean
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  setIntensity: (intensity: number) => void
  // Audio methods
  playEffect: (name: EffectName) => void
  isMuted: boolean
  toggleMute: () => void
}

const AmbientContext = createContext<AmbientContextValue | null>(null)

export interface AmbientEngineProviderProps {
  children: ReactNode
}

export function AmbientEngineProvider({ children }: AmbientEngineProviderProps) {
  const [intensity, setIntensityState] = useState(0.5)
  const [isIdle, setIsIdle] = useState(false)
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('ambient-audio-muted') === 'true'
  })

  const engineRef = useRef<AmbientEngine | null>(null)
  const isInitialisedRef = useRef(false)

  // Simple time of day detection
  const timeOfDay = (() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 17) return 'afternoon'
    if (hour >= 17 && hour < 21) return 'evening'
    return 'night'
  })()

  const effectiveIntensity = isIdle ? intensity * 1.2 : intensity

  // Initialise audio engine on mount
  useEffect(() => {
    if (isInitialisedRef.current) return

    // Skip audio if reduced motion is preferred
    if (prefersReducedMotion()) {
      return
    }

    const initEngine = async () => {
      const engine = new AmbientEngine()
      await engine.init()

      // Start ambient bed at current intensity
      engine.playAmbient(intensity)

      engineRef.current = engine
      isInitialisedRef.current = true
    }

    // Initialise on first user interaction
    const handleFirstInteraction = () => {
      initEngine()
      window.removeEventListener('click', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
    }

    window.addEventListener('click', handleFirstInteraction, { once: true })
    window.addEventListener('keydown', handleFirstInteraction, { once: true })

    return () => {
      window.removeEventListener('click', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)

      // Cleanup engine
      if (engineRef.current) {
        engineRef.current.stopAll()
        engineRef.current = null
      }
    }
  }, [])

  const setIntensity = useCallback((newIntensity: number) => {
    const clampedIntensity = Math.max(0, Math.min(1, newIntensity))
    setIntensityState(clampedIntensity)

    // Update audio engine intensity
    if (engineRef.current) {
      engineRef.current.setIntensity(clampedIntensity)
    }
  }, [])

  const playEffect = useCallback((name: EffectName) => {
    if (engineRef.current && !isMuted) {
      engineRef.current.playEffect(name)
    }
  }, [isMuted])

  const toggleMute = useCallback(() => {
    if (!engineRef.current) return

    if (isMuted) {
      engineRef.current.unmute()
      setIsMuted(false)
    } else {
      engineRef.current.mute()
      setIsMuted(true)
    }
  }, [isMuted])

  const value: AmbientContextValue = {
    intensity,
    effectiveIntensity,
    isIdle,
    timeOfDay,
    setIntensity,
    playEffect,
    isMuted,
    toggleMute,
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
