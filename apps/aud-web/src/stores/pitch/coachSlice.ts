import { StateCreator } from 'zustand'
import { logger } from '@/lib/logger'
import { CoachingMessage, CoachingMode, CoachingPhase, PitchType, PitchSection } from './types'

const log = logger.scope('Pitch Coach Slice')

// We need to access some fields from the Drafts slice
interface PartialDraftsState {
  trackId: string | null
  currentType: PitchType | null
  sections: PitchSection[]
  updateSection: (id: string, content: string) => void
}

export interface CoachSlice {
  // AI Coach state (legacy one-shot)
  isCoachOpen: boolean
  isCoachLoading: boolean
  coachResponse: string | null
  coachError: string | null
  selectedSectionId: string | null

  // Intelligence Navigator state (Phase 1.5 - multi-turn coaching)
  coachingSession: CoachingMessage[]
  coachingMode: CoachingMode | null
  coachingPhase: CoachingPhase | null
  isSessionActive: boolean

  // Actions
  toggleCoach: () => void
  openCoach: () => void
  closeCoach: () => void
  setCoachLoading: (loading: boolean) => void
  setCoachResponse: (response: string | null) => void
  setCoachError: (error: string | null) => void
  applyCoachSuggestion: (sectionId: string, content: string) => void
  selectSection: (id: string | null) => void

  // Actions - Intelligence Navigator
  startCoachingSession: (mode: CoachingMode) => void
  endCoachingSession: () => void
  addCoachingMessage: (message: Omit<CoachingMessage, 'id' | 'timestamp'>) => void
  setCoachingPhase: (phase: CoachingPhase) => void
  sendSessionMessage: (content: string, sectionId?: string) => Promise<void>
  clearCoachingSession: () => void
}

export const createCoachSlice: StateCreator<CoachSlice & PartialDraftsState, [], [], CoachSlice> = (
  set,
  get
) => ({
  isCoachOpen: false,
  isCoachLoading: false,
  coachResponse: null,
  coachError: null,
  selectedSectionId: null,
  coachingSession: [],
  coachingMode: null,
  coachingPhase: null,
  isSessionActive: false,

  toggleCoach: () => set((state) => ({ isCoachOpen: !state.isCoachOpen })),
  openCoach: () => set({ isCoachOpen: true }),
  closeCoach: () => set({ isCoachOpen: false }),
  setCoachLoading: (loading) => set({ isCoachLoading: loading }),
  setCoachResponse: (response) => set({ coachResponse: response, coachError: null }),
  setCoachError: (error) => set({ coachError: error, coachResponse: null }),

  applyCoachSuggestion: (sectionId, content) => {
    const draftsState = get() as unknown as PartialDraftsState
    draftsState.updateSection(sectionId, content)
    set({ coachResponse: null })
  },

  selectSection: (id) => {
    set({
      selectedSectionId: id,
      coachResponse: null,
      coachError: null,
    })
  },

  startCoachingSession: (mode) => {
    set({
      coachingSession: [],
      coachingMode: mode,
      coachingPhase: 'foundation',
      isSessionActive: true,
      isCoachOpen: true,
    })
  },

  endCoachingSession: () => {
    set({
      isSessionActive: false,
      coachingMode: null,
      coachingPhase: null,
    })
  },

  addCoachingMessage: (message) => {
    const id = `msg-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(16)}`
    const timestamp = new Date().toISOString()

    set((state) => ({
      coachingSession: [...state.coachingSession, { ...message, id, timestamp }],
    }))
  },

  setCoachingPhase: (phase) => {
    set({ coachingPhase: phase })
  },

  sendSessionMessage: async (content, sectionId) => {
    const state = get()
    if (!state.isSessionActive) return

    // Add user message
    const userMessageId = `msg-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(16)}`
    set((s) => ({
      coachingSession: [
        ...s.coachingSession,
        {
          id: userMessageId,
          role: 'user' as const,
          content,
          timestamp: new Date().toISOString(),
          sectionId,
        },
      ],
      isCoachLoading: true,
      coachError: null,
    }))

    try {
      const response = await fetch('/api/pitch/coach/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          sectionId,
          trackId: state.trackId,
          pitchType: state.currentType,
          mode: state.coachingMode,
          phase: state.coachingPhase,
          history: state.coachingSession.slice(-10), // Last 10 messages for context
          allSections: state.sections.map((s) => ({
            id: s.id,
            title: s.title,
            content: s.content,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to get coaching response')
      }

      // Add coach response
      const coachMessageId = `msg-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(16)}`
      set((s) => ({
        coachingSession: [
          ...s.coachingSession,
          {
            id: coachMessageId,
            role: 'coach' as const,
            content: data.response,
            timestamp: new Date().toISOString(),
            sectionId,
            suggestions: data.suggestions,
          },
        ],
        isCoachLoading: false,
        // Auto-advance phase if suggested
        coachingPhase: data.nextPhase || s.coachingPhase,
      }))
    } catch (error) {
      log.error('Coaching session error', error)
      set({
        isCoachLoading: false,
        coachError: error instanceof Error ? error.message : 'Failed to get response',
      })
    }
  },

  clearCoachingSession: () => {
    set({
      coachingSession: [],
      coachingMode: null,
      coachingPhase: null,
      isSessionActive: false,
      coachError: null,
    })
  },
})
