/**
 * Pitch Mode Store
 * Phase 5: MVP Pivot - Pitch Builder
 *
 * Zustand store with localStorage persistence for pitch drafts.
 * Follows the same pattern as useIdeasStore.
 *
 * Integrates with:
 * - Local AI Coach (Claude) for section-level improvements
 * - TAP Pitch service for full pitch generation from metadata
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============ Types ============

export type PitchType = 'radio' | 'press' | 'playlist' | 'custom'
export type CoachAction = 'improve' | 'suggest' | 'rewrite'
export type TAPTone = 'casual' | 'professional' | 'enthusiastic'
export type TAPGenerationStatus = 'idle' | 'loading' | 'success' | 'error'

/**
 * TAP Pitch generation request metadata
 */
export interface TAPPitchRequest {
  artistName: string
  trackTitle: string
  genre?: string
  trackLink?: string
  releaseDate?: string
  keyHook: string
  tone?: TAPTone
}

/**
 * TAP Pitch generation result
 */
export interface TAPPitchResult {
  subject?: string
  body: string
  signature?: string
  confidence?: 'High' | 'Medium' | 'Low'
  generatedAt: string
}

export interface PitchSection {
  id: string
  title: string
  content: string
  placeholder: string
}

export interface PitchDraft {
  id: string
  name: string
  type: PitchType
  sections: PitchSection[]
  createdAt: string
  updatedAt: string
}

// ============ Constants ============

const DEFAULT_SECTIONS: PitchSection[] = [
  {
    id: 'hook',
    title: 'The Hook',
    content: '',
    placeholder:
      'Start with something memorable - a striking fact, an emotional moment, or a bold statement about your music.',
  },
  {
    id: 'story',
    title: 'Your Story',
    content: '',
    placeholder: 'Share the journey behind this release. What inspired it? What makes it personal?',
  },
  {
    id: 'sound',
    title: 'The Sound',
    content: '',
    placeholder:
      'Describe your sound using reference points listeners will recognise. "If X met Y in a dimly lit studio..."',
  },
  {
    id: 'traction',
    title: 'Proof Points',
    content: '',
    placeholder:
      'Include any relevant achievements: streams, radio plays, notable support, press coverage.',
  },
  {
    id: 'ask',
    title: 'The Ask',
    content: '',
    placeholder:
      'Be specific about what you want: airplay, review, playlist inclusion. Make it easy to say yes.',
  },
]

// ============ Store Interface ============

interface PitchState {
  // Current editing state
  currentType: PitchType | null
  sections: PitchSection[]
  isDirty: boolean

  // Drafts (saved pitches)
  drafts: PitchDraft[]
  currentDraftId: string | null

  // AI Coach state (Claude-based section improvements)
  isCoachOpen: boolean
  isCoachLoading: boolean
  coachResponse: string | null
  coachError: string | null
  selectedSectionId: string | null

  // TAP Pitch state (full pitch generation from metadata)
  tapGenerationStatus: TAPGenerationStatus
  tapPitchResult: TAPPitchResult | null
  tapError: string | null
  isTAPModalOpen: boolean

  // Actions - Type Selection
  selectType: (type: PitchType) => void
  resetPitch: () => void

  // Actions - Section Editing
  updateSection: (id: string, content: string) => void
  selectSection: (id: string | null) => void

  // Actions - AI Coach
  toggleCoach: () => void
  openCoach: () => void
  closeCoach: () => void
  setCoachLoading: (loading: boolean) => void
  setCoachResponse: (response: string | null) => void
  setCoachError: (error: string | null) => void
  applyCoachSuggestion: (sectionId: string, content: string) => void

  // Actions - TAP Pitch Generation
  openTAPModal: () => void
  closeTAPModal: () => void
  generateWithTAP: (request: TAPPitchRequest) => Promise<void>
  applyTAPResult: () => void
  clearTAPResult: () => void

  // Actions - Draft Management
  saveDraft: (name: string) => string
  loadDraft: (id: string) => void
  deleteDraft: (id: string) => void
  renameDraft: (id: string, name: string) => void
}

// ============ Helper Functions ============

function generateId(): string {
  return `pitch-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(16)}`
}

// ============ Store Implementation ============

export const usePitchStore = create<PitchState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentType: null,
      sections: DEFAULT_SECTIONS,
      isDirty: false,
      drafts: [],
      currentDraftId: null,
      isCoachOpen: false,
      isCoachLoading: false,
      coachResponse: null,
      coachError: null,
      selectedSectionId: null,

      // TAP Pitch initial state
      tapGenerationStatus: 'idle',
      tapPitchResult: null,
      tapError: null,
      isTAPModalOpen: false,

      // Type Selection
      selectType: (type) => {
        set({
          currentType: type,
          sections: DEFAULT_SECTIONS.map((s) => ({ ...s, content: '' })),
          isDirty: false,
          currentDraftId: null,
          coachResponse: null,
          coachError: null,
          // Reset TAP state
          tapGenerationStatus: 'idle',
          tapPitchResult: null,
          tapError: null,
          isTAPModalOpen: false,
        })
      },

      resetPitch: () => {
        set({
          currentType: null,
          sections: DEFAULT_SECTIONS.map((s) => ({ ...s, content: '' })),
          isDirty: false,
          currentDraftId: null,
          isCoachOpen: false,
          coachResponse: null,
          coachError: null,
          selectedSectionId: null,
          // Reset TAP state
          tapGenerationStatus: 'idle',
          tapPitchResult: null,
          tapError: null,
          isTAPModalOpen: false,
        })
      },

      // Section Editing
      updateSection: (id, content) => {
        set((state) => ({
          sections: state.sections.map((s) => (s.id === id ? { ...s, content } : s)),
          isDirty: true,
        }))
      },

      selectSection: (id) => {
        set({
          selectedSectionId: id,
          coachResponse: null,
          coachError: null,
        })
      },

      // AI Coach
      toggleCoach: () => set((state) => ({ isCoachOpen: !state.isCoachOpen })),
      openCoach: () => set({ isCoachOpen: true }),
      closeCoach: () => set({ isCoachOpen: false }),
      setCoachLoading: (loading) => set({ isCoachLoading: loading }),
      setCoachResponse: (response) => set({ coachResponse: response, coachError: null }),
      setCoachError: (error) => set({ coachError: error, coachResponse: null }),

      applyCoachSuggestion: (sectionId, content) => {
        set((state) => ({
          sections: state.sections.map((s) => (s.id === sectionId ? { ...s, content } : s)),
          isDirty: true,
          coachResponse: null,
        }))
      },

      // TAP Pitch Generation
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
          console.error('[Pitch Store] TAP generation error:', error)
          set({
            tapGenerationStatus: 'error',
            tapError: error instanceof Error ? error.message : 'Generation failed',
          })
        }
      },

      applyTAPResult: () => {
        const state = get()
        if (!state.tapPitchResult) return

        // Parse TAP result and populate sections
        // The TAP body typically includes all the pitch content
        // We'll put it in the relevant sections based on structure
        const body = state.tapPitchResult.body

        // For now, put the entire body into "The Hook" section as starting point
        // User can then edit and redistribute to other sections
        set((currentState) => ({
          sections: currentState.sections.map((s) => {
            if (s.id === 'hook' && state.tapPitchResult?.subject) {
              return { ...s, content: state.tapPitchResult.subject }
            }
            if (s.id === 'story') {
              // Put main body content here
              return { ...s, content: body }
            }
            return s
          }),
          isDirty: true,
          isTAPModalOpen: false,
          tapPitchResult: null,
          tapGenerationStatus: 'idle',
        }))
      },

      clearTAPResult: () => {
        set({
          tapGenerationStatus: 'idle',
          tapPitchResult: null,
          tapError: null,
        })
      },

      // Draft Management
      saveDraft: (name) => {
        const state = get()
        const now = new Date().toISOString()
        const id = state.currentDraftId || generateId()

        const draft: PitchDraft = {
          id,
          name,
          type: state.currentType!,
          sections: state.sections,
          createdAt: state.currentDraftId
            ? state.drafts.find((d) => d.id === id)?.createdAt || now
            : now,
          updatedAt: now,
        }

        set((state) => ({
          drafts: state.currentDraftId
            ? state.drafts.map((d) => (d.id === id ? draft : d))
            : [...state.drafts, draft],
          currentDraftId: id,
          isDirty: false,
        }))

        return id
      },

      loadDraft: (id) => {
        const draft = get().drafts.find((d) => d.id === id)
        if (!draft) return

        set({
          currentType: draft.type,
          sections: draft.sections,
          currentDraftId: id,
          isDirty: false,
          coachResponse: null,
          coachError: null,
        })
      },

      deleteDraft: (id) => {
        set((state) => ({
          drafts: state.drafts.filter((d) => d.id !== id),
          currentDraftId: state.currentDraftId === id ? null : state.currentDraftId,
        }))
      },

      renameDraft: (id, name) => {
        set((state) => ({
          drafts: state.drafts.map((d) =>
            d.id === id ? { ...d, name, updatedAt: new Date().toISOString() } : d
          ),
        }))
      },
    }),
    {
      name: 'totalaud-pitch-store',
      version: 1,
    }
  )
)

// ============ Selectors ============

export const selectCurrentSection = (state: PitchState): PitchSection | null => {
  if (!state.selectedSectionId) return null
  return state.sections.find((s) => s.id === state.selectedSectionId) ?? null
}

export const selectHasContent = (state: PitchState): boolean => {
  return state.sections.some((s) => s.content.trim().length > 0)
}

export const selectDraftCount = (state: PitchState): number => {
  return state.drafts.length
}

export const selectTAPStatus = (state: PitchState) => ({
  status: state.tapGenerationStatus,
  result: state.tapPitchResult,
  error: state.tapError,
  isModalOpen: state.isTAPModalOpen,
})

// ============ Export Helpers ============

export function buildPitchMarkdown(sections: PitchSection[], type: PitchType): string {
  const typeLabels: Record<PitchType, string> = {
    radio: 'Radio Pitch',
    press: 'Press Release',
    playlist: 'Playlist Pitch',
    custom: 'Custom Pitch',
  }

  const lines = [
    `# ${typeLabels[type]}`,
    '',
    `*Generated on ${new Date().toLocaleDateString('en-GB')}*`,
    '',
  ]

  for (const section of sections) {
    if (section.content.trim()) {
      lines.push(`## ${section.title}`, '', section.content.trim(), '')
    }
  }

  return lines.join('\n')
}

export function buildPitchPlainText(sections: PitchSection[], type: PitchType): string {
  const typeLabels: Record<PitchType, string> = {
    radio: 'RADIO PITCH',
    press: 'PRESS RELEASE',
    playlist: 'PLAYLIST PITCH',
    custom: 'CUSTOM PITCH',
  }

  const lines = [typeLabels[type], '='.repeat(typeLabels[type].length), '']

  for (const section of sections) {
    if (section.content.trim()) {
      lines.push(
        `${section.title.toUpperCase()}`,
        '-'.repeat(section.title.length),
        section.content.trim(),
        ''
      )
    }
  }

  return lines.join('\n')
}
