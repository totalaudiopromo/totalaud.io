import { StateCreator } from 'zustand'
import { logger } from '@/lib/logger'
import { TAPGenerationStatus, TAPPitchResult, TAPPitchRequest, PitchSection } from './types'

const log = logger.scope('Pitch TAP Slice')

// We need to access some fields from the Drafts slice
interface PartialDraftsState {
  sections: PitchSection[]
  updateSection: (id: string, content: string) => void
}

export interface TAPSlice {
  // TAP Pitch state
  tapGenerationStatus: TAPGenerationStatus
  tapPitchResult: TAPPitchResult | null
  tapError: string | null
  isTAPModalOpen: boolean

  // Actions
  openTAPModal: () => void
  closeTAPModal: () => void
  generateWithTAP: (request: TAPPitchRequest) => Promise<void>
  applyTAPResult: () => void
  clearTAPResult: () => void
}

export const createTAPSlice: StateCreator<TAPSlice & PartialDraftsState, [], [], TAPSlice> = (
  set,
  get
) => ({
  tapGenerationStatus: 'idle',
  tapPitchResult: null,
  tapError: null,
  isTAPModalOpen: false,

  openTAPModal: () => set({ isTAPModalOpen: true }),
  closeTAPModal: () => set({ isTAPModalOpen: false }),

  generateWithTAP: async (request: TAPPitchRequest) => {
    set({ tapGenerationStatus: 'loading', tapError: null })

    try {
      const response = await fetch('/api/tap/pitch/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistName: request.artistName,
          trackTitle: request.trackTitle,
          genre: request.genre,
          trackLink: request.trackLink,
          releaseDate: request.releaseDate,
          keyHook: request.keyHook,
          tone: request.tone || 'professional',
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to generate pitch')
      }

      const pitch = data.data?.pitch
      if (!pitch) {
        throw new Error('No pitch data returned')
      }

      set({
        tapGenerationStatus: 'success',
        tapPitchResult: {
          subject: pitch.subject,
          body: pitch.body,
          signature: pitch.signature,
          confidence: pitch.confidence,
          generatedAt: new Date().toISOString(),
        },
      })
    } catch (error) {
      log.error('TAP generation error', error)
      set({
        tapGenerationStatus: 'error',
        tapError: error instanceof Error ? error.message : 'Generation failed',
      })
    }
  },

  applyTAPResult: () => {
    const state = get()
    if (!state.tapPitchResult) return

    const body = state.tapPitchResult.body

    // Using updateSection from the drafts slice to maintain consistency
    if (state.tapPitchResult.subject) {
      state.updateSection('hook', state.tapPitchResult.subject)
    }
    state.updateSection('story', body)

    set({
      isTAPModalOpen: false,
      tapPitchResult: null,
      tapGenerationStatus: 'idle',
    })
  },

  clearTAPResult: () => {
    set({
      tapGenerationStatus: 'idle',
      tapPitchResult: null,
      tapError: null,
    })
  },
})
