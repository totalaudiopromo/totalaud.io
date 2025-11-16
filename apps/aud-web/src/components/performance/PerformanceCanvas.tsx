/**
 * Performance Canvas
 * Phase 16: Main performance mode container with engine lifecycle management
 */

'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { PerformanceClock, PerformanceEngine } from '@totalaud/performance'
import type {
  PerformanceState,
  PerformanceClockState,
} from '@totalaud/performance'
import { useLiveEventBus } from '@totalaud/os-state/live'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { OSPerformers } from './OSPerformers'
import { SocialGraphLive } from './SocialGraphLive'
import { LoopOrbits } from './LoopOrbits'
import { EmotionalAtmosphere } from './EmotionalAtmosphere'
import { EvolutionSparks } from './EvolutionSparks'
import { PerformanceCamera } from './PerformanceCamera'
import { PerformanceHUD } from './PerformanceHUD'

/**
 * Performance context value
 */
interface PerformanceContextValue {
  performanceState: PerformanceState
  clockState: PerformanceClockState
  engine: PerformanceEngine | null
  clock: PerformanceClock | null
}

const PerformanceContext = createContext<PerformanceContextValue | null>(null)

/**
 * Hook to access performance context
 */
export function usePerformance() {
  const ctx = useContext(PerformanceContext)
  if (!ctx) {
    throw new Error('usePerformance must be used within PerformanceCanvas')
  }
  return ctx
}

/**
 * Default BPM for performance mode
 */
const DEFAULT_BPM = 120

/**
 * Main performance canvas component
 */
export function PerformanceCanvas() {
  const liveEventBus = useLiveEventBus()

  // Engine and clock refs
  const engineRef = useRef<PerformanceEngine | null>(null)
  const clockRef = useRef<PerformanceClock | null>(null)

  // Performance state
  const [performanceState, setPerformanceState] = useState<PerformanceState>({
    osStates: new Map(),
    edgeStates: new Map(),
    globalAtmosphere: { cohesion: 0, tension: 0, energy: 0 },
    recentEvents: [],
    lastEventAt: 0,
  })

  // Clock state
  const [clockState, setClockState] = useState<PerformanceClockState>({
    bpm: DEFAULT_BPM,
    bar: 1,
    beatInBar: 1,
    beatCount: 0,
    timeSinceBeat: 0,
    lastTickAt: 0,
    isRunning: false,
  })

  // Initialize engine and clock on mount
  useEffect(() => {
    // Create clock
    const clock = new PerformanceClock(DEFAULT_BPM)
    clockRef.current = clock

    // Subscribe to clock updates
    const clockUnsubscribe = clock.subscribe((state) => {
      setClockState(state)
    })

    // Create engine
    const engine = new PerformanceEngine(clock, liveEventBus)
    engineRef.current = engine

    // Subscribe to performance state updates
    const engineUnsubscribe = engine.subscribe((state) => {
      setPerformanceState(state)
    })

    // Start clock
    clock.start()

    // Cleanup on unmount
    return () => {
      clock.stop()
      clockUnsubscribe()
      engineUnsubscribe()
    }
  }, [liveEventBus])

  return (
    <PerformanceContext.Provider
      value={{
        performanceState,
        clockState,
        engine: engineRef.current,
        clock: clockRef.current,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          background: flowCoreColours.matteBlack,
          overflow: 'hidden',
        }}
      >
        {/* Emotional Atmosphere (background layer) */}
        <EmotionalAtmosphere />

        {/* Performance Camera (applies global transforms) */}
        <PerformanceCamera>
          {/* OS Performers (main nodes) */}
          <OSPerformers />

          {/* Social Graph Live (animated edges) */}
          <SocialGraphLive />

          {/* Loop Orbits (satellites) */}
          <LoopOrbits />

          {/* Evolution Sparks (particle bursts) */}
          <EvolutionSparks />
        </PerformanceCamera>

        {/* Performance HUD (overlay UI) */}
        <PerformanceHUD />
      </div>
    </PerformanceContext.Provider>
  )
}

