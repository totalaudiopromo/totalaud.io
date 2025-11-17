'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAgentKernel } from '@/components/agents/useAgentKernel'
import { useAmbient } from '@/components/ambient/useAmbient'
import { MoodContext } from './useMood'
import type { GlobalMood } from './moodPresets'

interface MoodEngineProviderProps {
  children: React.ReactNode
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0
  return Math.min(1, Math.max(0, value))
}

function resolveMood(score: number, loopMomentum: number, interactionRate: number): GlobalMood {
  const s = clamp01(score)
  const m = clamp01(loopMomentum)
  const i = clamp01(interactionRate)

  if (s < 0.15 && m < 0.2 && i < 0.1) return 'idle'
  if (s < 0.4) return 'calm'
  if (s < 0.7) return 'focused'

  if (s >= 0.7 && (m > 0.6 || i > 0.6) && i < 0.9) {
    return 'charged'
  }

  return 'chaotic'
}

export function MoodEngineProvider({ children }: MoodEngineProviderProps) {
  const { runs } = useAgentKernel()
  const ambient = useAmbient()
  const pathname = usePathname()

  const [loopMomentum, setLoopMomentumState] = useState(0)
  const [interactionRate, setInteractionRate] = useState(0)
  const [score, setScore] = useState(0)
  const [mood, setMood] = useState<GlobalMood>('calm')
  const [showPanel, setShowPanel] = useState(false)

  const lastInteractionRef = useRef<number | null>(null)

  const recentAgentSuccessRate = useMemo(() => {
    const relevant = runs.filter((run) => run.status === 'done' || run.status === 'error')
    if (!relevant.length) return 0
    const successes = relevant.filter((run) => run.status === 'done').length
    return successes / relevant.length
  }, [runs])

  const ambientIntensity = ambient.effectiveIntensity

  const recalculateMood = useCallback(() => {
    const agentSuccess = clamp01(recentAgentSuccessRate)
    const loop = clamp01(loopMomentum)
    const ambientValue = clamp01(ambientIntensity)
    const interaction = clamp01(interactionRate)

    const nextScore = clamp01(
      0.4 * loop + 0.3 * agentSuccess + 0.2 * ambientValue + 0.1 * interaction,
    )

    const nextMood = resolveMood(nextScore, loop, interaction)

    setScore(nextScore)
    setMood(nextMood)
  }, [ambientIntensity, interactionRate, loopMomentum, recentAgentSuccessRate])

  const setLoopMomentum = useCallback((value: number | null) => {
    setLoopMomentumState(clamp01(value ?? 0))
  }, [])

  const registerInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now()
    setInteractionRate(1)
  }, [])

  useEffect(() => {
    function handleActivity() {
      registerInteraction()
    }

    if (typeof window === 'undefined') return undefined

    window.addEventListener('click', handleActivity)
    window.addEventListener('keydown', handleActivity)

    return () => {
      window.removeEventListener('click', handleActivity)
      window.removeEventListener('keydown', handleActivity)
    }
  }, [registerInteraction])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const id = window.setInterval(() => {
      const now = Date.now()
      const last = lastInteractionRef.current

      if (last == null) {
        setInteractionRate((previous) => (previous > 0.02 ? previous * 0.9 : 0))
        return
      }

      const deltaSeconds = (now - last) / 1000
      if (deltaSeconds <= 3) {
        setInteractionRate(1)
      } else if (deltaSeconds >= 30) {
        setInteractionRate(0)
      } else {
        const t = (deltaSeconds - 3) / (30 - 3)
        setInteractionRate(1 - t)
      }
    }, 1500)

    return () => {
      window.clearInterval(id)
    }
  }, [])

  useEffect(() => {
    recalculateMood()
  }, [recalculateMood])

  const value = useMemo(
    () => ({
      mood,
      score,
      recentAgentSuccessRate: clamp01(recentAgentSuccessRate),
      loopMomentum,
      ambientIntensity,
      interactionRate: clamp01(interactionRate),
      setLoopMomentum,
      registerInteraction,
      updateMood: recalculateMood,
    }),
    [
      ambientIntensity,
      interactionRate,
      loopMomentum,
      mood,
      recalculateMood,
      recentAgentSuccessRate,
      score,
      setLoopMomentum,
    ],
  )

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const isDevOrDemo =
      pathname?.startsWith('/dev') || pathname?.startsWith('/demo') || pathname?.startsWith('/console')

    if (!isDevOrDemo) return undefined

    const handler = (event: KeyboardEvent) => {
      if (event.key === 'M' && event.ctrlKey && event.shiftKey) {
        event.preventDefault()
        setShowPanel((previous) => !previous)
      }
    }

    window.addEventListener('keydown', handler)

    return () => {
      window.removeEventListener('keydown', handler)
    }
  }, [pathname])

  return (
    <MoodContext.Provider value={value}>
      {children}
      {showPanel && (
        <div className="fixed bottom-3 right-3 z-[9999] max-w-xs rounded-lg border border-slate-800/80 bg-slate-950/90 px-3 py-2 text-[11px] text-slate-200 shadow-[0_12px_32px_rgba(0,0,0,0.85)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Mood engine
            </span>
            <span className="rounded-full bg-slate-800 px-2 py-[1px] text-[10px] uppercase tracking-[0.18em] text-slate-100">
              {mood}
            </span>
          </div>
          <div className="mt-1 space-y-[2px] text-[10px] text-slate-300">
            <p>Score: {(score * 100).toFixed(0)}</p>
            <p>Agent success: {(recentAgentSuccessRate * 100).toFixed(0)}%</p>
            <p>Loop momentum: {(loopMomentum * 100).toFixed(0)}%</p>
            <p>Ambient: {(ambientIntensity * 100).toFixed(0)}%</p>
            <p>Interaction: {(interactionRate * 100).toFixed(0)}%</p>
          </div>
        </div>
      )}
    </MoodContext.Provider>
  )
}


