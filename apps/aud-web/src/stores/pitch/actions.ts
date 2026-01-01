import type { StateCreator } from 'zustand'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'
import { generateId } from '@/lib/id'
import type {
  CoachingMessage,
  CoachingMode,
  CoachingPhase,
  PitchDraft,
  PitchType,
  TAPPitchRequest,
} from '@/types/pitch'
import { DEFAULT_SECTIONS } from './constants'
import { fromSupabaseDraft, generatePitchId, toSupabaseDraft } from './draftUtils'
import type { PitchState } from './state'

const log = logger.scope('Pitch Store')

type StoreSet = Parameters<StateCreator<PitchState>>[0]
type StoreGet = Parameters<StateCreator<PitchState>>[1]

export const createPitchActions = (set: StoreSet, get: StoreGet) => ({
  selectType: (type: PitchType) => {
    set({
      currentType: type,
      sections: DEFAULT_SECTIONS.map((section) => ({ ...section, content: '' })),
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
      sections: DEFAULT_SECTIONS.map((section) => ({ ...section, content: '' })),
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

  updateSection: (id: string, content: string) => {
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === id ? { ...section, content } : section
      ),
      isDirty: true,
    }))
  },

  selectSection: (id: string | null) => {
    set({
      selectedSectionId: id,
      coachResponse: null,
      coachError: null,
    })
  },

  toggleCoach: () => set((state) => ({ isCoachOpen: !state.isCoachOpen })),
  openCoach: () => set({ isCoachOpen: true }),
  closeCoach: () => set({ isCoachOpen: false }),
  setCoachLoading: (loading: boolean) => set({ isCoachLoading: loading }),
  setCoachResponse: (response: string | null) => set({ coachResponse: response, coachError: null }),
  setCoachError: (error: string | null) => set({ coachError: error, coachResponse: null }),

  applyCoachSuggestion: (sectionId: string, content: string) => {
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === sectionId ? { ...section, content } : section
      ),
      isDirty: true,
      coachResponse: null,
    }))
  },

  startCoachingSession: (mode: CoachingMode) => {
    set({
      coachingSession: [],
      queuedSessionMessages: [],
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
      queuedSessionMessages: [],
    })
  },

  addCoachingMessage: (message: Omit<CoachingMessage, 'id' | 'timestamp'>) => {
    const id = generateId('msg')
    const timestamp = new Date().toISOString()

    set((state) => ({
      coachingSession: [...state.coachingSession, { ...message, id, timestamp }],
    }))
  },

  setCoachingPhase: (phase: CoachingPhase) => {
    set({ coachingPhase: phase })
  },

  sendSessionMessage: async (content: string, sectionId?: string) => {
    const state = get()
    if (!state.isSessionActive) return

    if (state.isCoachLoading) {
      set((current) => ({
        queuedSessionMessages: [...current.queuedSessionMessages, { content, sectionId }],
      }))
      return
    }

    const processMessage = async (messageContent: string, messageSectionId?: string) => {
      const currentState = get()
      if (!currentState.isSessionActive) return

      const timestamp = new Date().toISOString()
      const userMessageId = generateId('msg')
      const userMessage: CoachingMessage = {
        id: userMessageId,
        role: 'user' as const,
        content: messageContent,
        timestamp,
        sectionId: messageSectionId,
      }

      set((current) => ({
        coachingSession: [...current.coachingSession, userMessage],
        isCoachLoading: true,
        coachError: null,
      }))

      try {
        const response = await fetch('/api/pitch/coach/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: messageContent,
            sectionId: messageSectionId,
            pitchType: currentState.currentType,
            mode: currentState.coachingMode,
            phase: currentState.coachingPhase,
            history: [...currentState.coachingSession, userMessage].slice(-10),
            allSections: currentState.sections.map((section) => ({
              id: section.id,
              title: section.title,
              content: section.content,
            })),
          }),
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to get coaching response')
        }

        const coachMessageId = generateId('msg')
        set((current) => ({
          coachingSession: [
            ...current.coachingSession,
            {
              id: coachMessageId,
              role: 'coach' as const,
              content: data.response,
              timestamp: new Date().toISOString(),
              sectionId: messageSectionId,
              suggestions: data.suggestions,
            },
          ],
          isCoachLoading: false,
          coachingPhase: data.nextPhase || current.coachingPhase,
        }))
      } catch (error) {
        log.error('Coaching session error', error)
        set({
          isCoachLoading: false,
          coachError: error instanceof Error ? error.message : 'Failed to get response',
        })
      }

      const next = get().queuedSessionMessages[0]
      if (next) {
        set((current) => ({ queuedSessionMessages: current.queuedSessionMessages.slice(1) }))
        await processMessage(next.content, next.sectionId)
      }
    }

    await processMessage(content, sectionId)
  },

  clearCoachingSession: () => {
    set({
      coachingSession: [],
      coachingMode: null,
      coachingPhase: null,
      isSessionActive: false,
      coachError: null,
      queuedSessionMessages: [],
    })
  },

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
      sections: currentState.sections.map((section) => {
        if (section.id === 'hook' && state.tapPitchResult?.subject) {
          return { ...section, content: state.tapPitchResult.subject }
        }
        if (section.id === 'story') {
          return { ...section, content: body }
        }
        return section
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

  saveDraft: async (name: string) => {
    const state = get()
    const now = new Date().toISOString()
    const id = state.currentDraftId || generatePitchId()

    const draft: PitchDraft = {
      id,
      name,
      type: state.currentType!,
      sections: state.sections,
      createdAt: state.currentDraftId
        ? state.drafts.find((draftItem) => draftItem.id === id)?.createdAt || now
        : now,
      updatedAt: now,
    }

    set((current) => ({
      drafts: current.currentDraftId
        ? current.drafts.map((draftItem) => (draftItem.id === id ? draft : draftItem))
        : [...current.drafts, draft],
      currentDraftId: id,
      isDirty: false,
    }))

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

  loadDraft: (id: string) => {
    const draft = get().drafts.find((draftItem) => draftItem.id === id)
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

  deleteDraft: async (id: string) => {
    set((current) => ({
      drafts: current.drafts.filter((draftItem) => draftItem.id !== id),
      currentDraftId: current.currentDraftId === id ? null : current.currentDraftId,
    }))

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

  renameDraft: async (id: string, name: string) => {
    const now = new Date().toISOString()

    set((current) => ({
      drafts: current.drafts.map((draftItem) =>
        draftItem.id === id ? { ...draftItem, name, updatedAt: now } : draftItem
      ),
    }))

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
})
