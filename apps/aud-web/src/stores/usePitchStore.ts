/**
 * Pitch Mode Store
 *
 * Phase 10: Data Persistence
 *
 * Zustand store for pitch drafts with:
 * - Supabase sync for authenticated users
 * - localStorage fallback for unauthenticated users
 * - Local AI Coach (Claude) for section-level improvements
 * - TAP Pitch service for full pitch generation from metadata
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import type { SyncedPitchDraft } from '@/hooks/useSupabaseSync'
import { logger } from '@/lib/logger'

const log = logger.scope('Pitch Store')

// ============ Types ============

export type PitchType = 'radio' | 'press' | 'playlist' | 'custom'
export type CoachAction = 'improve' | 'suggest' | 'rewrite'
export type TAPTone = 'casual' | 'professional' | 'enthusiastic'
export type TAPGenerationStatus = 'idle' | 'loading' | 'success' | 'error'

// Intelligence Navigator types (Phase 1.5)
export type CoachingMode = 'quick' | 'guided'
export type CoachingPhase = 'foundation' | 'refinement' | 'optimisation'

export interface CoachingMessage {
  id: string
  role: 'user' | 'coach'
  content: string
  timestamp: string
  sectionId?: string // Which section this relates to
  suggestions?: string[] // Follow-up question suggestions
}

export interface TAPPitchRequest {
  artistName: string
  trackTitle: string
  genre?: string
  trackLink?: string
  releaseDate?: string
  keyHook: string
  tone?: TAPTone
}

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
      'Start with something memorable — a striking fact, an emotional moment, or a bold statement about your music.',
  },
  {
    id: 'story',
    title: 'Your Story',
    content: '',
    placeholder:
      'Share your journey, describe your sound, and include any proof points (streams, radio plays, press coverage).',
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
  trackId: string | null

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

  // TAP Pitch state
  tapGenerationStatus: TAPGenerationStatus
  tapPitchResult: TAPPitchResult | null
  tapError: string | null
  isTAPModalOpen: boolean

  // Supabase sync state
  isLoading: boolean
  isSyncing: boolean
  syncError: string | null
  lastSyncedAt: string | null

  // Actions - Type Selection
  selectType: (type: PitchType) => void
  resetPitch: () => void
  setTrackId: (trackId: string | null) => void

  // Actions - Section Editing
  updateSection: (id: string, content: string) => void
  selectSection: (id: string | null) => void

  // Actions - AI Coach (legacy one-shot)
  toggleCoach: () => void
  openCoach: () => void
  closeCoach: () => void
  setCoachLoading: (loading: boolean) => void
  setCoachResponse: (response: string | null) => void
  setCoachError: (error: string | null) => void
  applyCoachSuggestion: (sectionId: string, content: string) => void

  // Actions - Intelligence Navigator (Phase 1.5 - multi-turn coaching)
  startCoachingSession: (mode: CoachingMode) => void
  endCoachingSession: () => void
  addCoachingMessage: (message: Omit<CoachingMessage, 'id' | 'timestamp'>) => void
  setCoachingPhase: (phase: CoachingPhase) => void
  sendSessionMessage: (content: string, sectionId?: string) => Promise<void>
  clearCoachingSession: () => void

  // Actions - TAP Pitch Generation
  openTAPModal: () => void
  closeTAPModal: () => void
  generateWithTAP: (request: TAPPitchRequest) => Promise<void>
  applyTAPResult: () => void
  clearTAPResult: () => void

  // Actions - Draft Management
  saveDraft: (name: string) => Promise<string>
  loadDraft: (id: string) => void
  deleteDraft: (id: string) => Promise<void>
  renameDraft: (id: string, name: string) => Promise<void>

  // Supabase sync actions
  loadFromSupabase: () => Promise<void>
  syncToSupabase: () => Promise<void>
}

// ============ Helper Functions ============

function generateId(): string {
  return `pitch-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(16)}`
}

// Type for raw database row (sections is Json which can be null)
interface DatabasePitchDraft {
  id: string
  user_id: string
  name: string
  pitch_type: string
  sections: unknown // Json type in Supabase
  created_at: string
  updated_at: string
}

function toSupabaseDraft(
  draft: PitchDraft,
  userId: string
): Omit<SyncedPitchDraft, 'created_at' | 'updated_at'> {
  return {
    id: draft.id,
    user_id: userId,
    name: draft.name,
    pitch_type: draft.type,
    sections: draft.sections,
  }
}

function fromSupabaseDraft(data: DatabasePitchDraft): PitchDraft {
  // Parse sections from Json, defaulting to empty array if null
  const sections = Array.isArray(data.sections)
    ? (data.sections as PitchSection[])
    : DEFAULT_SECTIONS

  return {
    id: data.id,
    name: data.name,
    type: data.pitch_type as PitchType,
    sections,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
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
      trackId: null,
      isCoachOpen: false,
      isCoachLoading: false,
      coachResponse: null,
      coachError: null,
      selectedSectionId: null,

      // Intelligence Navigator initial state (Phase 1.5)
      coachingSession: [],
      coachingMode: null,
      coachingPhase: null,
      isSessionActive: false,

      // TAP Pitch initial state
      tapGenerationStatus: 'idle',
      tapPitchResult: null,
      tapError: null,
      isTAPModalOpen: false,

      // Supabase sync state
      isLoading: false,
      isSyncing: false,
      syncError: null,
      lastSyncedAt: null,

      // ========== Type Selection ==========

      selectType: (type) => {
        set({
          currentType: type,
          sections: DEFAULT_SECTIONS.map((s) => ({ ...s, content: '' })),
          isDirty: false,
          currentDraftId: null,
          coachResponse: null,
          coachError: null,
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
          tapGenerationStatus: 'idle',
          tapPitchResult: null,
          tapError: null,
          isTAPModalOpen: false,
        })
      },

      // ========== Track Context ==========

      setTrackId: (trackId: string | null) => {
        set({ trackId })
      },

      // ========== Section Editing ==========

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

      // ========== AI Coach ==========

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

      // ========== Intelligence Navigator (Phase 1.5) ==========

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

      // ========== TAP Pitch Generation ==========

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

        set((currentState) => ({
          sections: currentState.sections.map((s) => {
            if (s.id === 'hook' && state.tapPitchResult?.subject) {
              return { ...s, content: state.tapPitchResult.subject }
            }
            if (s.id === 'story') {
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

      // ========== Draft Management ==========

      saveDraft: async (name) => {
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

        // Optimistic update
        set((state) => ({
          drafts: state.currentDraftId
            ? state.drafts.map((d) => (d.id === id ? draft : d))
            : [...state.drafts, draft],
          currentDraftId: id,
          isDirty: false,
        }))

        // Sync to Supabase if authenticated
        try {
          const supabase = createBrowserSupabaseClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            const { error } = await supabase.from('user_pitch_drafts').upsert(
              {
                ...toSupabaseDraft(draft, user.id),
                created_at: draft.createdAt,
                updated_at: draft.updatedAt,
              },
              { onConflict: 'id' }
            )

            if (error) {
              log.error('Save draft error', error)
              set({ syncError: error.message })
            }
          }
        } catch (error) {
          log.error('Sync error', error)
        }

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

      deleteDraft: async (id) => {
        // Optimistic update
        set((state) => ({
          drafts: state.drafts.filter((d) => d.id !== id),
          currentDraftId: state.currentDraftId === id ? null : state.currentDraftId,
        }))

        // Sync to Supabase if authenticated
        try {
          const supabase = createBrowserSupabaseClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            const { error } = await supabase
              .from('user_pitch_drafts')
              .delete()
              .eq('id', id)
              .eq('user_id', user.id)

            if (error) {
              log.error('Delete draft error', error)
              set({ syncError: error.message })
            }
          }
        } catch (error) {
          log.error('Sync error', error)
        }
      },

      renameDraft: async (id, name) => {
        const now = new Date().toISOString()

        // Optimistic update
        set((state) => ({
          drafts: state.drafts.map((d) => (d.id === id ? { ...d, name, updatedAt: now } : d)),
        }))

        // Sync to Supabase if authenticated
        try {
          const supabase = createBrowserSupabaseClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            const { error } = await supabase
              .from('user_pitch_drafts')
              .update({ name, updated_at: now })
              .eq('id', id)
              .eq('user_id', user.id)

            if (error) {
              log.error('Rename draft error', error)
              set({ syncError: error.message })
            }
          }
        } catch (error) {
          log.error('Sync error', error)
        }
      },

      // ========== Supabase Sync Actions ==========

      loadFromSupabase: async () => {
        set({ isLoading: true, syncError: null })

        try {
          const supabase = createBrowserSupabaseClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (!user) {
            set({ isLoading: false })
            return
          }

          const { data, error } = await supabase
            .from('user_pitch_drafts')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })

          if (error) {
            log.error('Load error', error)
            set({ isLoading: false, syncError: error.message })
            return
          }

          if (data && data.length > 0) {
            const drafts = data.map(fromSupabaseDraft)
            set({
              drafts,
              isLoading: false,
              lastSyncedAt: new Date().toISOString(),
            })
          } else {
            set({ isLoading: false })
          }
        } catch (error) {
          log.error('Load error', error)
          set({
            isLoading: false,
            syncError: error instanceof Error ? error.message : 'Failed to load',
          })
        }
      },

      syncToSupabase: async () => {
        const state = get()
        if (state.isSyncing) return

        set({ isSyncing: true, syncError: null })

        try {
          const supabase = createBrowserSupabaseClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (!user) {
            set({ isSyncing: false })
            return
          }

          const supabaseDrafts = state.drafts.map((draft) => ({
            ...toSupabaseDraft(draft, user.id),
            created_at: draft.createdAt,
            updated_at: draft.updatedAt,
          }))

          if (supabaseDrafts.length > 0) {
            const { error } = await supabase
              .from('user_pitch_drafts')
              .upsert(supabaseDrafts, { onConflict: 'id' })

            if (error) {
              log.error('Sync error', error)
              set({ isSyncing: false, syncError: error.message })
              return
            }
          }

          set({
            isSyncing: false,
            lastSyncedAt: new Date().toISOString(),
          })
        } catch (error) {
          log.error('Sync error', error)
          set({
            isSyncing: false,
            syncError: error instanceof Error ? error.message : 'Sync failed',
          })
        }
      },
    }),
    {
      name: 'totalaud-pitch-store',
      version: 3, // Bump version for Intelligence Navigator (Phase 1.5)
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

export const selectSyncStatus = (state: PitchState) => ({
  isLoading: state.isLoading,
  isSyncing: state.isSyncing,
  error: state.syncError,
  lastSyncedAt: state.lastSyncedAt,
})

export const selectCoachingSession = (state: PitchState) => ({
  session: state.coachingSession,
  mode: state.coachingMode,
  phase: state.coachingPhase,
  isActive: state.isSessionActive,
  isLoading: state.isCoachLoading,
  error: state.coachError,
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
