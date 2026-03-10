'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useOptionalDemo } from '@/components/demo/DemoOrchestrator'
import { useOptionalMood } from '@/components/mood/useMood'
import { useProjectEngine } from '@/components/projects/useProjectEngine'
import { useLoopOSLocalStore } from '@/components/os/loopos'
import { RITUAL_PRESETS } from './ritualPresets'
import type { Ritual } from './ritualTypes'
import { RitualsContext } from './useRituals'

interface RitualEngineProviderProps {
  children: React.ReactNode
}

interface PersistedRitualPayload {
  dailyRituals: Ritual[]
  lastGenerated: string
}

const STORAGE_PREFIX = 'ta_rituals_'
const STORAGE_VERSION = 'v1'

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function buildStorageKey(projectId: string): string {
  return `${STORAGE_PREFIX}${projectId}_${STORAGE_VERSION}`
}

const DEMO_LANA_RITUALS: Ritual[] = [
  {
    id: 'review_loop',
    title: "Check Lana's momentum loop",
    description:
      'Open Core OS and skim Lana’s main release loop. Listen for the sections that already feel like “go live this week”.',
    os: 'core',
    weight: 1,
  },
  {
    id: 'idea_spark',
    title: 'Backstage idea sweep',
    description:
      'In Analogue, scan Lana’s scribbled ideas. Pick one weird note and turn it into a concrete next move for this release.',
    os: 'analogue',
    weight: 1,
  },
  {
    id: 'plan_day',
    title: 'Three-move day plan',
    description:
      'Use ASCII OS to log three micro-moves for Lana today: one loop push, one story, one outreach. Keep each brutally small.',
    os: 'ascii',
    weight: 1,
  },
]

function selectDailyRituals(opts: {
  loopMomentumScore: number
  moodScore: number
  baseRituals: Ritual[]
}): Ritual[] {
  const { loopMomentumScore, moodScore, baseRituals } = opts

  const boosted = baseRituals.map((ritual) => {
    let momentumBoost = 1
    if (loopMomentumScore > 0.6) {
      if (
        ritual.id === 'micro_promo' ||
        ritual.id === 'pitch_polish' ||
        ritual.id === 'loop_constellation'
      ) {
        momentumBoost = 1.4
      }
    } else if (loopMomentumScore < 0.3) {
      if (ritual.id === 'idea_spark' || ritual.id === 'plan_day' || ritual.id === 'reflect') {
        momentumBoost = 1.3
      }
    }

    let moodBoost = 1
    if (moodScore > 0.65) {
      if (ritual.id === 'micro_promo' || ritual.id === 'pitch_polish') {
        moodBoost = 1.25
      }
    } else if (moodScore < 0.35) {
      if (ritual.id === 'reflect' || ritual.id === 'plan_day') {
        moodBoost = 1.25
      }
    }

    const combinedWeight = ritual.weight * momentumBoost * moodBoost
    return {
      ritual,
      combinedWeight,
    }
  })

  const sorted = [...boosted].sort((a, b) => b.combinedWeight - a.combinedWeight)

  const targetCount = loopMomentumScore > 0.5 || moodScore > 0.6 ? 4 : 3
  return sorted.slice(0, targetCount).map((entry) => entry.ritual)
}

export function RitualEngineProvider({ children }: RitualEngineProviderProps) {
  const demo = useOptionalDemo()
  const mood = useOptionalMood()
  const { currentProjectId } = useProjectEngine()
  const { momentum } = useLoopOSLocalStore()

  const [dailyRituals, setDailyRituals] = useState<Ritual[]>([])
  const [lastGenerated, setLastGenerated] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const isDemoMode =
    demo?.isDemoMode || (typeof window !== 'undefined' && (window as any).__TA_DEMO__ === true)

  const loopMomentumScore = momentum?.score ?? 0
  const moodScore = mood?.score ?? 0.5

  const generateDailyRituals = useCallback(
    (projectIdOverride?: string | null) => {
      if (isDemoMode) {
        setDailyRituals(DEMO_LANA_RITUALS)
        setLastGenerated(getTodayKey())
        return
      }

      const projectId = projectIdOverride ?? currentProjectId
      if (!projectId) {
        setDailyRituals([])
        setLastGenerated(null)
        return
      }

      setIsLoading(true)

      const todayKey = getTodayKey()
      const next = selectDailyRituals({
        loopMomentumScore,
        moodScore,
        baseRituals: RITUAL_PRESETS,
      })

      setDailyRituals(next)
      setLastGenerated(todayKey)

      if (typeof window !== 'undefined') {
        try {
          const payload: PersistedRitualPayload = {
            dailyRituals: next,
            lastGenerated: todayKey,
          }
          const storageKey = buildStorageKey(projectId)
          window.localStorage.setItem(storageKey, JSON.stringify(payload))
        } catch {
          // Local storage failures should never break the session
        }
      }

      setIsLoading(false)
    },
    [currentProjectId, isDemoMode, loopMomentumScore, moodScore]
  )

  useEffect(() => {
    if (isDemoMode) {
      setDailyRituals(DEMO_LANA_RITUALS)
      setLastGenerated(getTodayKey())
      return
    }

    if (!currentProjectId) {
      setDailyRituals([])
      setLastGenerated(null)
      return
    }

    if (typeof window === 'undefined') {
      return
    }

    setIsLoading(true)

    const storageKey = buildStorageKey(currentProjectId)
    const todayKey = getTodayKey()

    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedRitualPayload

        if (parsed.lastGenerated === todayKey && Array.isArray(parsed.dailyRituals)) {
          setDailyRituals(parsed.dailyRituals)
          setLastGenerated(parsed.lastGenerated)
          setIsLoading(false)
          return
        }
      }
    } catch {
      // Ignore parse errors and fall back to regeneration
    }

    generateDailyRituals(currentProjectId)
    setIsLoading(false)
  }, [currentProjectId, generateDailyRituals, isDemoMode])

  const value = useMemo(
    () => ({
      dailyRituals,
      lastGenerated,
      isLoading,
      generateDailyRituals,
    }),
    [dailyRituals, generateDailyRituals, isLoading, lastGenerated]
  )

  return <RitualsContext.Provider value={value}>{children}</RitualsContext.Provider>
}
