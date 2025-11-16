/**
 * Fusion Slice
 * Multi-OS collaboration state management
 */

import type { StateCreator } from 'zustand'
import type { FusionSession, FusionMessage, FusionState, ThemeId } from '../campaign.types'

export interface FusionSliceActions {
  fusion: FusionState

  // Session management
  startFusionSession: (focus: {
    type: 'clip' | 'card' | 'campaign'
    id: string
    osContributors?: ThemeId[]
  }) => void
  endFusionSession: () => void
  setCurrentSession: (session: FusionSession | null) => void
  setFusionSessions: (sessions: FusionSession[]) => void

  // Message management
  addFusionMessage: (message: FusionMessage) => void
  setFusionMessages: (messages: FusionMessage[]) => void
  clearFusionMessages: () => void

  // Contributor management
  setFusionContributors: (osList: ThemeId[]) => void

  // Loading state
  setFusionLoading: (loading: boolean) => void

  // Live fusion state (Phase 12B)
  setLiveEnabled: (enabled: boolean) => void
  setLastFusionEventAt: (timestamp: string) => void

  // Getters
  getFusionSession: (sessionId: string) => FusionSession | undefined
  getActiveSession: () => FusionSession | null
  getSessionMessages: (sessionId: string) => FusionMessage[]
  getMessagesByOS: (sessionId: string, os: ThemeId) => FusionMessage[]
}

const initialFusionState: FusionState = {
  currentSession: null,
  sessions: [],
  messages: [],
  isLoading: false,
  liveEnabled: false,
  lastFusionEventAt: null,
}

export const createFusionSlice: StateCreator<FusionSliceActions> = (set, get) => ({
  fusion: initialFusionState,

  // Session management
  startFusionSession: (focus) => {
    const newSession: FusionSession = {
      id: crypto.randomUUID(),
      userId: '', // Will be set by API
      focusType: focus.type,
      focusId: focus.id,
      active: true,
      osContributors: focus.osContributors || [
        'ascii',
        'xp',
        'aqua',
        'daw',
        'analogue',
      ],
      createdAt: new Date().toISOString(),
      closedAt: null,
    }

    set((state) => ({
      fusion: {
        ...state.fusion,
        currentSession: newSession,
        sessions: [newSession, ...state.fusion.sessions],
      },
    }))
  },

  endFusionSession: () => {
    const currentSession = get().fusion.currentSession
    if (!currentSession) return

    const closedSession: FusionSession = {
      ...currentSession,
      active: false,
      closedAt: new Date().toISOString(),
    }

    set((state) => ({
      fusion: {
        ...state.fusion,
        currentSession: null,
        sessions: state.fusion.sessions.map((session) =>
          session.id === closedSession.id ? closedSession : session
        ),
      },
    }))
  },

  setCurrentSession: (session) => {
    set((state) => ({
      fusion: {
        ...state.fusion,
        currentSession: session,
      },
    }))
  },

  setFusionSessions: (sessions) => {
    set((state) => ({
      fusion: {
        ...state.fusion,
        sessions,
      },
    }))
  },

  // Message management
  addFusionMessage: (message) => {
    set((state) => ({
      fusion: {
        ...state.fusion,
        messages: [...state.fusion.messages, message],
      },
    }))
  },

  setFusionMessages: (messages) => {
    set((state) => ({
      fusion: {
        ...state.fusion,
        messages,
      },
    }))
  },

  clearFusionMessages: () => {
    set((state) => ({
      fusion: {
        ...state.fusion,
        messages: [],
      },
    }))
  },

  // Contributor management
  setFusionContributors: (osList) => {
    const currentSession = get().fusion.currentSession
    if (!currentSession) return

    const updatedSession: FusionSession = {
      ...currentSession,
      osContributors: osList,
    }

    set((state) => ({
      fusion: {
        ...state.fusion,
        currentSession: updatedSession,
        sessions: state.fusion.sessions.map((session) =>
          session.id === updatedSession.id ? updatedSession : session
        ),
      },
    }))
  },

  // Loading state
  setFusionLoading: (loading) => {
    set((state) => ({
      fusion: {
        ...state.fusion,
        isLoading: loading,
      },
    }))
  },

  // Live fusion state (Phase 12B)
  setLiveEnabled: (enabled) => {
    set((state) => ({
      fusion: {
        ...state.fusion,
        liveEnabled: enabled,
      },
    }))
  },

  setLastFusionEventAt: (timestamp) => {
    set((state) => ({
      fusion: {
        ...state.fusion,
        lastFusionEventAt: timestamp,
      },
    }))
  },

  // Getters
  getFusionSession: (sessionId) => {
    return get().fusion.sessions.find((session) => session.id === sessionId)
  },

  getActiveSession: () => {
    return get().fusion.currentSession
  },

  getSessionMessages: (sessionId) => {
    return get().fusion.messages.filter((message) => message.sessionId === sessionId)
  },

  getMessagesByOS: (sessionId, os) => {
    return get()
      .fusion.messages.filter((message) => message.sessionId === sessionId && message.os === os)
  },
})
