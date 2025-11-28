'use client'

import { createContext, useContext } from 'react'
import type { Ritual } from './ritualTypes'

export interface RitualsState {
  dailyRituals: Ritual[]
  lastGenerated: string | null
  isLoading: boolean
}

export interface RitualsController {
  generateDailyRituals: (projectIdOverride?: string | null) => void
}

export type RitualsContextValue = RitualsState & RitualsController

export const RitualsContext = createContext<RitualsContextValue | null>(null)

export function useRituals(): RitualsContextValue {
  const value = useContext(RitualsContext)
  if (!value) {
    throw new Error('useRituals must be used within a RitualEngineProvider')
  }
  return value
}

export function useOptionalRituals(): RitualsContextValue | null {
  return useContext(RitualsContext)
}
