'use client'

import { useNarrativeContext, useOptionalNarrativeContext } from './NarrativeEngine'
import type { NarrativeFlags } from './NarrativeEngine'
import type { NarrativeBeatId, NarrativeChoice } from './narrativeBeats'

export type { NarrativeFlags, NarrativeBeatId, NarrativeChoice }

export function useNarrative() {
  const context = useNarrativeContext()
  const { activeBeat, flags, goToBeat, chooseChoice } = context

  return {
    activeBeat,
    flags,
    goToBeat,
    chooseChoice,
  }
}

export function useOptionalNarrative() {
  const context = useOptionalNarrativeContext()
  if (!context) return null

  const { activeBeat, flags, goToBeat, chooseChoice } = context

  return {
    activeBeat,
    flags,
    goToBeat,
    chooseChoice,
  }
}


