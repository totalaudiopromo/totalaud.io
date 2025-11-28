'use client'

import { createContext, useContext } from 'react'
import type { GlobalMood } from './moodPresets'

export interface MoodState {
  mood: GlobalMood
  score: number
  recentAgentSuccessRate: number
  loopMomentum: number
  ambientIntensity: number
  interactionRate: number
}

export interface MoodController {
  setLoopMomentum: (value: number | null) => void
  registerInteraction: () => void
  updateMood: () => void
}

export type MoodContextValue = MoodState & MoodController

export const MoodContext = createContext<MoodContextValue | null>(null)

export function useMood(): MoodContextValue {
  const value = useContext(MoodContext)
  if (!value) {
    throw new Error('useMood must be used within a MoodEngineProvider')
  }
  return value
}

export function useOptionalMood(): MoodContextValue | null {
  return useContext(MoodContext)
}
