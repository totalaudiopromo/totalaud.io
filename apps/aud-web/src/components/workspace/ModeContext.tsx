'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type WorkspaceMode = 'ideas' | 'timeline' | 'pitch'

interface ModeContextValue {
  mode: WorkspaceMode
  setMode: (mode: WorkspaceMode) => void
  modeLabel: string
  modeDescription: string
}

const modeMetadata: Record<WorkspaceMode, { label: string; description: string }> = {
  ideas: {
    label: 'Ideas',
    description: 'Cards, notes, and loose ideas for early sketching',
  },
  timeline: {
    label: 'Timeline',
    description: 'Loops, sequences, and campaign momentum',
  },
  pitch: {
    label: 'Pitch',
    description: 'Scout discovery and opportunity finding',
  },
}

const ModeContext = createContext<ModeContextValue | null>(null)

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<WorkspaceMode>('pitch') // Default to pitch for Scout MVP

  const setMode = useCallback((newMode: WorkspaceMode) => {
    setModeState(newMode)
  }, [])

  const metadata = modeMetadata[mode]

  return (
    <ModeContext.Provider
      value={{
        mode,
        setMode,
        modeLabel: metadata.label,
        modeDescription: metadata.description,
      }}
    >
      {children}
    </ModeContext.Provider>
  )
}

export function useMode() {
  const context = useContext(ModeContext)
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider')
  }
  return context
}

export { modeMetadata }
