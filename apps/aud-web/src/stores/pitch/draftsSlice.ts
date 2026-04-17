import { StateCreator } from 'zustand'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import type { SyncedPitchDraft } from '@/hooks/useSupabaseSync'
import { logger } from '@/lib/logger'
import { PitchType, PitchSection, PitchDraft, DEFAULT_SECTIONS, DatabasePitchDraft } from './types'

const log = logger.scope('Pitch Drafts Slice')

export interface DraftsSlice {
  // Current editing state
  currentType: PitchType | null
  sections: PitchSection[]
  isDirty: boolean
  drafts: PitchDraft[]
  currentDraftId: string | null
  trackId: string | null

  // Supabase sync state
  isLoading: boolean
  isSyncing: boolean
  syncError: string | null
  lastSyncedAt: string | null

  // Actions
  selectType: (type: PitchType) => void
  resetPitch: () => void
  setTrackId: (trackId: string | null) => void
  updateSection: (id: string, content: string) => void
  selectSection: (id: string | null) => void
  saveDraft: (name: string) => Promise<string>
  loadDraft: (id: string) => void
  deleteDraft: (id: string) => Promise<void>
  renameDraft: (id: string, name: string) => Promise<void>
  loadFromSupabase: () => Promise<void>
  syncToSupabase: () => Promise<void>
}

function generateId(): string {
  return `pitch-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(16)}`
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

function isValidSection(s: unknown): s is PitchSection {
  return (
    typeof s === 'object' &&
    s !== null &&
    typeof (s as PitchSection).id === 'string' &&
    typeof (s as PitchSection).title === 'string'
  )
}

function fromSupabaseDraft(data: DatabasePitchDraft): PitchDraft {
  const rawSections = Array.isArray(data.sections) ? data.sections : []
  const sections = rawSections.every(isValidSection)
    ? rawSections.map((s) => ({ ...s, content: s.content || '', placeholder: s.placeholder || '' }))
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

export const createDraftsSlice: StateCreator<DraftsSlice, [], [], DraftsSlice> = (set, get) => ({
  currentType: null,
  sections: DEFAULT_SECTIONS,
  isDirty: false,
  drafts: [],
  currentDraftId: null,
  trackId: null,
  isLoading: false,
  isSyncing: false,
  syncError: null,
  lastSyncedAt: null,

  selectType: (type) => {
    set({
      currentType: type,
      sections: DEFAULT_SECTIONS.map((s) => ({ ...s, content: '' })),
      isDirty: false,
      currentDraftId: null,
    })
  },

  resetPitch: () => {
    set({
      currentType: null,
      sections: DEFAULT_SECTIONS.map((s) => ({ ...s, content: '' })),
      isDirty: false,
      currentDraftId: null,
    })
  },

  setTrackId: (trackId) => {
    set({ trackId })
  },

  updateSection: (id, content) => {
    set((state) => ({
      sections: state.sections.map((s) => (s.id === id ? { ...s, content } : s)),
      isDirty: true,
    }))
  },

  selectSection: (_id) => {
    // This is shared with Legacy Coach in original store,
    // we'll handle setting selectedSectionId in the combined store if needed,
    // or keep it in the drafts slice.
    set({} as Partial<DraftsSlice>)
  },

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

    set((state) => ({
      drafts: state.currentDraftId
        ? state.drafts.map((d) => (d.id === id ? draft : d))
        : [...state.drafts, draft],
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

  loadDraft: (id) => {
    const draft = get().drafts.find((d) => d.id === id)
    if (!draft) return

    set({
      currentType: draft.type,
      sections: draft.sections,
      currentDraftId: id,
      isDirty: false,
    })
  },

  deleteDraft: async (id) => {
    set((state) => ({
      drafts: state.drafts.filter((d) => d.id !== id),
      currentDraftId: state.currentDraftId === id ? null : state.currentDraftId,
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

  renameDraft: async (id, name) => {
    const now = new Date().toISOString()

    set((state) => ({
      drafts: state.drafts.map((d) => (d.id === id ? { ...d, name, updatedAt: now } : d)),
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
        .select('id, user_id, name, pitch_type, sections, created_at, updated_at')
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
