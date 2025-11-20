'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useReducedMotion } from 'framer-motion'
import { useDemo } from '@/components/demo/DemoOrchestrator'
import { DIRECTOR_SCRIPT } from './directorScript'
import { executeDirectorAction } from './DirectorEngine'
import { useOptionalAmbient } from '@/components/ambient/useAmbient'
import { useOptionalNarrative } from '@/components/narrative/useNarrative'
import { getNarrativeBeatByStepId } from '@/components/narrative/narrativeBeats'

interface DirectorState {
  isEnabled: boolean
  isPlaying: boolean
  currentIndex: number
  currentActionId: string | null
  note: string | null
}

interface DirectorControls {
  start: () => void
  pause: () => void
  resume: () => void
  stop: () => void
  skipToNext: () => void
  skipToPrevious: () => void
}

export type DirectorContextValue = DirectorState & DirectorControls

const DirectorContext = createContext<DirectorContextValue | null>(null)

export function useDirector(): DirectorContextValue {
  const value = useContext(DirectorContext)
  if (!value) {
    throw new Error('useDirector must be used within a DirectorProvider')
  }
  return value
}

export function useOptionalDirector(): DirectorContextValue | null {
  return useContext(DirectorContext)
}

export function DirectorProvider({ children }: { children: React.ReactNode }) {
  const { goToStep } = useDemo()
  const ambient = useOptionalAmbient()
  const prefersReducedMotion = useReducedMotion()
  const narrative = useOptionalNarrative()

  const [isEnabled, setIsEnabled] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentActionId, setCurrentActionId] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)

  const timeoutRef = useRef<number | null>(null)
  const baselineAmbientRef = useRef<number | null>(null)

  const clearTimer = () => {
    if (timeoutRef.current != null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const setAmbientOverride = useCallback(
    (value: number | null) => {
      if (!ambient) return
      if (value == null) {
        if (baselineAmbientRef.current != null) {
          ambient.setIntensity(baselineAmbientRef.current)
        }
        return
      }

      const bump = prefersReducedMotion ? 0.1 : 0.2
      const baseline =
        baselineAmbientRef.current != null
          ? baselineAmbientRef.current
          : ambient.intensity
      const target = Math.max(baseline, value - bump)
      ambient.setIntensity(target)
    },
    [ambient, prefersReducedMotion],
  )

  const runNextAction = useCallback(() => {
    clearTimer()

    if (!isEnabled || !isPlaying) return

    const action = DIRECTOR_SCRIPT[currentIndex]
    if (!action) {
      setIsEnabled(false)
      setIsPlaying(false)
      setCurrentActionId(null)
      setNote(null)
      setAmbientOverride(null)
      return
    }

    if (narrative) {
      const beat = getNarrativeBeatByStepId(action.stepId as any)
      if (beat && beat.choices && beat.choices.length > 0) {
        let hasChoiceForBeat = false

        if (beat.id === 'idea_fork') {
          hasChoiceForBeat = narrative.flags.creativeFocus || narrative.flags.campaignFocus
        } else if (beat.id === 'pitch_choice') {
          hasChoiceForBeat = narrative.flags.shortPitch || narrative.flags.longStory
        }

        if (!hasChoiceForBeat) {
          narrative.chooseChoice(beat.choices[0]!)
        }
      }
    }

    setCurrentActionId(action.id)

    const delay = action.delayMs ?? 0

    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null

      executeDirectorAction(action, {
        goToStep: (id) => {
          goToStep(id as any)
        },
        setNote,
        setAmbientIntensityOverride: setAmbientOverride,
      })

      setCurrentIndex((previous) => previous + 1)
    }, delay)
  }, [currentIndex, goToStep, isEnabled, isPlaying, narrative, setAmbientOverride])

  useEffect(() => {
    if (!isEnabled || !isPlaying) return
    if (timeoutRef.current != null) return
    runNextAction()
  }, [isEnabled, isPlaying, runNextAction])

  useEffect(
    () => () => {
      clearTimer()
      setAmbientOverride(null)
    },
    [setAmbientOverride],
  )

  const start = useCallback(() => {
    setNote(null)
    clearTimer()
    setCurrentIndex(0)
    setCurrentActionId(null)

    if (ambient && baselineAmbientRef.current == null) {
      baselineAmbientRef.current = ambient.intensity
      const target = prefersReducedMotion ? 0.5 : 0.7
      ambient.setIntensity(Math.max(ambient.intensity, target))
    }

    setIsEnabled(true)
    setIsPlaying(true)
  }, [ambient, prefersReducedMotion])

  const pause = useCallback(() => {
    clearTimer()
    setIsPlaying(false)
  }, [])

  const resume = useCallback(() => {
    if (!isEnabled) return
    if (currentIndex >= DIRECTOR_SCRIPT.length) return
    setIsPlaying(true)
  }, [currentIndex, isEnabled])

  const stop = useCallback(() => {
    clearTimer()
    setIsPlaying(false)
    setIsEnabled(false)
    setCurrentIndex(0)
    setCurrentActionId(null)
    setNote(null)
    setAmbientOverride(null)
  }, [setAmbientOverride])

  const skipToNext = useCallback(() => {
    clearTimer()
    setCurrentIndex((previous) => {
      const next = Math.min(previous + 1, DIRECTOR_SCRIPT.length)
      return next
    })
  }, [])

  const skipToPrevious = useCallback(() => {
    clearTimer()
    setCurrentIndex((previous) => Math.max(previous - 1, 0))
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (event.key === ' ') {
        event.preventDefault()
        if (!isEnabled) {
          start()
        } else if (isPlaying) {
          pause()
        } else {
          resume()
        }
      }
      if (event.key === 'ArrowRight') {
        skipToNext()
      }
      if (event.key === 'ArrowLeft') {
        skipToPrevious()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isEnabled, isPlaying, pause, resume, skipToNext, skipToPrevious, start])

  const value: DirectorContextValue = useMemo(
    () => ({
      isEnabled,
      isPlaying,
      currentIndex,
      currentActionId,
      note,
      start,
      pause,
      resume,
      stop,
      skipToNext,
      skipToPrevious,
    }),
    [
      currentActionId,
      currentIndex,
      isEnabled,
      isPlaying,
      note,
      pause,
      resume,
      skipToNext,
      skipToPrevious,
      start,
      stop,
    ],
  )

  return <DirectorContext.Provider value={value}>{children}</DirectorContext.Provider>
}


