'use client'

import { createContext, useContext } from 'react'
import type { PersonaId, PersonaPreset } from './personaPresets'

export interface PersonaContextValue {
  activePersonaId: PersonaId | null
  persona: PersonaPreset | null
  personaBias: PersonaPreset['agentBias']
  personaTone: string | null
  personaTraits: string[]
  setPersona: (id: PersonaId | null) => void
}

export const PersonaContext = createContext<PersonaContextValue | null>(null)

export function usePersona(): PersonaContextValue {
  const value = useContext(PersonaContext)
  if (!value) {
    throw new Error('usePersona must be used within a PersonaEngineProvider')
  }
  return value
}

export function useOptionalPersona(): PersonaContextValue | null {
  return useContext(PersonaContext)
}


