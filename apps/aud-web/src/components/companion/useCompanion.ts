'use client'

import { createContext, useContext } from 'react'
import type { CompanionId, CompanionPreset } from './companionPresets'

export interface CompanionContextValue {
  activeCompanionId: CompanionId | null
  activeCompanion: CompanionPreset | null
  companions: CompanionPreset[]
  setCompanion: (id: CompanionId | null) => void
  injectIntoPrompt: (input: string) => string
}

export const CompanionContext = createContext<CompanionContextValue | null>(null)

export function useCompanion(): CompanionContextValue {
  const value = useContext(CompanionContext)
  if (!value) {
    throw new Error('useCompanion must be used within a CompanionEngineProvider')
  }
  return value
}

export function useOptionalCompanion(): CompanionContextValue | null {
  return useContext(CompanionContext)
}
