'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  NARRATIVE_BEATS,
  type NarrativeBeat,
  type NarrativeBeatId,
  type NarrativeChoice,
  getNarrativeBeatById,
} from './narrativeBeats'

export type NarrativeState = {
  activeBeatId: NarrativeBeatId
  lastChoiceTags: string[]
}

export type NarrativeFlags = {
  shortPitch: boolean
  longStory: boolean
  creativeFocus: boolean
  campaignFocus: boolean
}

export interface NarrativeContextValue {
  state: NarrativeState
  activeBeat: NarrativeBeat
  flags: NarrativeFlags
  goToBeat: (id: NarrativeBeatId) => void
  chooseChoice: (choice: NarrativeChoice) => void
}

const NarrativeContext = createContext<NarrativeContextValue | null>(null)

function resolveBeat(id: NarrativeBeatId): NarrativeBeat {
  return getNarrativeBeatById(id) ?? NARRATIVE_BEATS[0]!
}

export function NarrativeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NarrativeState>({
    activeBeatId: 'lana_intro',
    lastChoiceTags: [],
  })

  const activeBeat = useMemo(() => resolveBeat(state.activeBeatId), [state.activeBeatId])

  const flags: NarrativeFlags = useMemo(
    () => ({
      shortPitch: state.lastChoiceTags.includes('short_pitch'),
      longStory: state.lastChoiceTags.includes('long_story'),
      creativeFocus: state.lastChoiceTags.includes('creative_focus'),
      campaignFocus: state.lastChoiceTags.includes('campaign_focus'),
    }),
    [state.lastChoiceTags]
  )

  const goToBeat = useCallback((id: NarrativeBeatId) => {
    setState((previous) => ({
      ...previous,
      activeBeatId: id,
    }))
  }, [])

  const chooseChoice = useCallback((choice: NarrativeChoice) => {
    setState((previous) => ({
      activeBeatId: choice.nextBeatId,
      lastChoiceTags:
        choice.tag != null ? [...previous.lastChoiceTags, choice.tag] : previous.lastChoiceTags,
    }))
  }, [])

  const value: NarrativeContextValue = useMemo(
    () => ({
      state,
      activeBeat,
      flags,
      goToBeat,
      chooseChoice,
    }),
    [state, activeBeat, flags, goToBeat, chooseChoice]
  )

  return <NarrativeContext.Provider value={value}>{children}</NarrativeContext.Provider>
}

export function useNarrativeContext(): NarrativeContextValue {
  const value = useContext(NarrativeContext)
  if (!value) {
    throw new Error('useNarrativeContext must be used within a NarrativeProvider')
  }
  return value
}

export function useOptionalNarrativeContext(): NarrativeContextValue | null {
  return useContext(NarrativeContext)
}

export { NarrativeContext }
