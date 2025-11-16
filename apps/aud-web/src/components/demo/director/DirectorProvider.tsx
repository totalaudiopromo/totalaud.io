'use client'

/**
 * Director Provider
 * React context wrapper for DirectorEngine
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import {
  DirectorEngine,
  type DirectorState,
  type DirectorCallbacks,
} from './DirectorEngine'
import type { DirectorAction } from './directorScript'

interface DirectorContextValue {
  // State
  isEnabled: boolean
  isPlaying: boolean
  currentIndex: number
  currentActionId: string | null
  progress: number // 0-1
  totalActions: number

  // Actions
  start: () => void
  pause: () => void
  resume: () => void
  stop: () => void
  skipToNext: () => void
  skipToPrevious: () => void

  // Engine
  engine: DirectorEngine
}

const DirectorContext = createContext<DirectorContextValue | null>(null)

export interface DirectorProviderProps {
  children: ReactNode
  script: DirectorAction[]
  callbacks?: DirectorCallbacks
}

export function DirectorProvider({ children, script, callbacks }: DirectorProviderProps) {
  // Initialize engine
  const engine = useMemo(() => new DirectorEngine(script, callbacks), [script])

  // Subscribe to engine state
  const [state, setState] = useState<DirectorState>(() => engine.getState())

  useEffect(() => {
    const unsubscribe = engine.subscribe((newState) => {
      setState(newState)
    })

    return () => {
      unsubscribe()
    }
  }, [engine])

  // Update callbacks when they change
  useEffect(() => {
    if (callbacks) {
      engine.setCallbacks(callbacks)
    }
  }, [engine, callbacks])

  // Actions
  const start = useCallback(() => {
    engine.start()
  }, [engine])

  const pause = useCallback(() => {
    engine.pause()
  }, [engine])

  const resume = useCallback(() => {
    engine.resume()
  }, [engine])

  const stop = useCallback(() => {
    engine.stop()
  }, [engine])

  const skipToNext = useCallback(() => {
    engine.skipToNext()
  }, [engine])

  const skipToPrevious = useCallback(() => {
    engine.skipToPrevious()
  }, [engine])

  // Calculate progress
  const progress = useMemo(() => {
    if (script.length === 0) return 0
    return state.currentIndex / script.length
  }, [state.currentIndex, script.length])

  // Context value
  const value: DirectorContextValue = {
    isEnabled: state.isEnabled,
    isPlaying: state.isPlaying,
    currentIndex: state.currentIndex,
    currentActionId: state.currentActionId,
    progress,
    totalActions: script.length,
    start,
    pause,
    resume,
    stop,
    skipToNext,
    skipToPrevious,
    engine,
  }

  return <DirectorContext.Provider value={value}>{children}</DirectorContext.Provider>
}

/**
 * Hook to access director
 * Only available within DirectorProvider
 */
export function useDirector(): DirectorContextValue {
  const context = useContext(DirectorContext)

  if (!context) {
    throw new Error('useDirector must be used within DirectorProvider')
  }

  return context
}

/**
 * Optional hook - returns null if not in director context
 */
export function useOptionalDirector(): DirectorContextValue | null {
  return useContext(DirectorContext)
}
