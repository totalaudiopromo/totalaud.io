'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { PersonaContext } from './usePersona'
import { getPersonaPreset, type PersonaId, type PersonaPreset } from './personaPresets'

interface PersonaEngineProps {
  children: React.ReactNode
}

const LANA_DEMO_PATH_PREFIX = '/demo/artist'

export function PersonaEngineProvider({ children }: PersonaEngineProps) {
  const pathname = usePathname()
  const [activePersonaId, setActivePersonaId] = useState<PersonaId | null>(null)

  useEffect(() => {
    if (!pathname) return

    if (pathname.startsWith(LANA_DEMO_PATH_PREFIX)) {
      setActivePersonaId('lana_glass')
    }
  }, [pathname])

  const setPersona = useCallback((id: PersonaId | null) => {
    setActivePersonaId(id)
  }, [])

  const persona: PersonaPreset | null = useMemo(
    () => (activePersonaId ? getPersonaPreset(activePersonaId) : null),
    [activePersonaId]
  )

  const value = useMemo(
    () => ({
      activePersonaId,
      persona,
      personaBias: persona?.agentBias ?? {},
      personaTone: persona?.tone ?? null,
      personaTraits: persona?.traits ?? [],
      setPersona,
    }),
    [activePersonaId, persona, setPersona]
  )

  return <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>
}
