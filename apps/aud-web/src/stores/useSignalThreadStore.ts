/**
 * Signal Thread Store
 *
 * Phase 2: Signal Threads - Connect timeline events into narrative story arcs
 *
 * A Zustand store for managing signal threads with:
 * - Thread CRUD operations
 * - Event linking/unlinking
 * - AI-powered narrative generation
 * - Supabase sync for authenticated users
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'

const log = logger.scope('SignalThreadStore')

// ============================================================================
// Types
// ============================================================================

export type ThreadType = 'narrative' | 'campaign' | 'creative' | 'scene' | 'performance'

export interface SignalThread {
  id: string
  userId: string

  // Thread identity
  title: string
  threadType: ThreadType
  colour: string

  // Event membership
  eventIds: string[]

  // AI-generated content
  narrativeSummary: string | null
  insights: string[]

  // Computed date range
  startDate: string | null
  endDate: string | null

  // Metadata
  createdAt: string
  updatedAt: string
}

export interface NewThread {
  title: string
  threadType: ThreadType
  colour?: string
}

export interface ThreadUpdate {
  title?: string
  threadType?: ThreadType
  colour?: string
}

// Database row type
interface DatabaseThread {
  id: string
  user_id: string
  title: string
  thread_type: string
  colour: string | null
  event_ids: string[] | null
  narrative_summary: string | null
  insights: string[] | null
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
}

// ============================================================================
// Constants
// ============================================================================

export const THREAD_TYPE_LABELS: Record<ThreadType, { label: string; icon: string }> = {
  narrative: { label: 'Narrative Arc', icon: '📖' },
  campaign: { label: 'Campaign', icon: '🎯' },
  creative: { label: 'Creative', icon: '✨' },
  scene: { label: 'Scene/Live', icon: '🎤' },
  performance: { label: 'Performance', icon: '📊' },
}

export const THREAD_COLOURS = [
  '#3AA9BE', // Slate Cyan (default)
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#EF4444', // Red
  '#6366F1', // Indigo
]

// ============================================================================
// Store Interface
// ============================================================================

interface SignalThreadState {
  // Data
  threads: SignalThread[]
  activeThreadId: string | null

  // Loading states
  isLoading: boolean
  isGenerating: boolean
  isSyncing: boolean

  // Error state
  syncError: string | null

  // Thread CRUD
  createThread: (thread: NewThread) => Promise<string>
  updateThread: (id: string, updates: ThreadUpdate) => Promise<void>
  deleteThread: (id: string) => Promise<void>
  setActiveThread: (id: string | null) => void

  // Event linking
  addEventToThread: (threadId: string, eventId: string) => Promise<void>
  removeEventFromThread: (threadId: string, eventId: string) => Promise<void>
  getThreadForEvent: (eventId: string) => SignalThread | null

  // AI narrative generation
  generateNarrative: (threadId: string) => Promise<void>

  // Supabase sync
  loadFromSupabase: () => Promise<void>
  syncToSupabase: () => Promise<void>

  // Reset
  resetThreads: () => void
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateThreadId(): string {
  return `thread-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(16)}`
}

function fromSupabaseThread(data: DatabaseThread): SignalThread {
  return {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    threadType: data.thread_type as ThreadType,
    colour: data.colour ?? '#3AA9BE',
    eventIds: data.event_ids ?? [],
    narrativeSummary: data.narrative_summary,
    insights: data.insights ?? [],
    startDate: data.start_date,
    endDate: data.end_date,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function toSupabaseThread(thread: SignalThread): Omit<DatabaseThread, 'created_at' | 'updated_at'> {
  return {
    id: thread.id,
    user_id: thread.userId,
    title: thread.title,
    thread_type: thread.threadType,
    colour: thread.colour,
    event_ids: thread.eventIds,
    narrative_summary: thread.narrativeSummary,
    insights: thread.insights,
    start_date: thread.startDate,
    end_date: thread.endDate,
  }
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useSignalThreadStore = create<SignalThreadState>()(
  persist(
    (set, get) => ({
      // Initial state
      threads: [],
      activeThreadId: null,
      isLoading: false,
      isGenerating: false,
      isSyncing: false,
      syncError: null,

      // ========== Thread CRUD ==========

      createThread: async (threadData) => {
        const id = generateThreadId()
        const now = new Date().toISOString()

        // Get user ID
        const supabase = createBrowserSupabaseClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        const newThread: SignalThread = {
          id,
          userId: user?.id ?? '',
          title: threadData.title,
          threadType: threadData.threadType,
          colour: threadData.colour ?? '#3AA9BE',
          eventIds: [],
          narrativeSummary: null,
          insights: [],
          startDate: null,
          endDate: null,
          createdAt: now,
          updatedAt: now,
        }

        // Optimistic update
        set((state) => ({
          threads: [...state.threads, newThread],
          activeThreadId: id,
        }))

        // Sync to Supabase
        if (user) {
          try {
            const { error } = await supabase.from('signal_threads').insert({
              ...toSupabaseThread(newThread),
              created_at: now,
              updated_at: now,
            })

            if (error) {
              log.error('Create thread error', error)
              set({ syncError: error.message })
            }
          } catch (error) {
            log.error('Sync error', error)
          }
        }

        return id
      },

      updateThread: async (id, updates) => {
        const now = new Date().toISOString()

        // Optimistic update
        set((state) => ({
          threads: state.threads.map((thread) =>
            thread.id === id ? { ...thread, ...updates, updatedAt: now } : thread
          ),
        }))

        // Sync to Supabase
        try {
          const supabase = createBrowserSupabaseClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            const supabaseUpdates: Record<string, unknown> = { updated_at: now }
            if (updates.title) supabaseUpdates.title = updates.title
            if (updates.threadType) supabaseUpdates.thread_type = updates.threadType
            if (updates.colour) supabaseUpdates.colour = updates.colour

            const { error } = await supabase
              .from('signal_threads')
              .update(supabaseUpdates)
              .eq('id', id)
              .eq('user_id', user.id)

            if (error) {
              log.error('Update thread error', error)
              set({ syncError: error.message })
            }
          }
        } catch (error) {
          log.error('Sync error', error)
        }
      },

      deleteThread: async (id) => {
        // Optimistic update
        set((state) => ({
          threads: state.threads.filter((thread) => thread.id !== id),
          activeThreadId: state.activeThreadId === id ? null : state.activeThreadId,
        }))

        // Sync to Supabase
        try {
          const supabase = createBrowserSupabaseClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            const { error } = await supabase
              .from('signal_threads')
              .delete()
              .eq('id', id)
              .eq('user_id', user.id)

            if (error) {
              log.error('Delete thread error', error)
              set({ syncError: error.message })
            }
          }
        } catch (error) {
          log.error('Sync error', error)
        }
      },

      setActiveThread: (id) => {
        set({ activeThreadId: id })
      },

      // ========== Event Linking ==========

      addEventToThread: async (threadId, eventId) => {
        const state = get()
        const thread = state.threads.find((t) => t.id === threadId)
        if (!thread || thread.eventIds.includes(eventId)) return

        const now = new Date().toISOString()
        const newEventIds = [...thread.eventIds, eventId]

        // Optimistic update
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id === threadId ? { ...t, eventIds: newEventIds, updatedAt: now } : t
          ),
        }))

        // Sync to Supabase - update both thread and event
        try {
          const supabase = createBrowserSupabaseClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            // Update thread event_ids
            await supabase
              .from('signal_threads')
              .update({ event_ids: newEventIds, updated_at: now })
              .eq('id', threadId)
              .eq('user_id', user.id)

            // Update event thread_id
            await supabase
              .from('user_timeline_events')
              .update({ thread_id: threadId, updated_at: now })
              .eq('id', eventId)
              .eq('user_id', user.id)
          }
        } catch (error) {
          log.error('Add event to thread error', error)
        }
      },

      removeEventFromThread: async (threadId, eventId) => {
        const state = get()
        const thread = state.threads.find((t) => t.id === threadId)
        if (!thread) return

        const now = new Date().toISOString()
        const newEventIds = thread.eventIds.filter((id) => id !== eventId)

        // Optimistic update
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id === threadId ? { ...t, eventIds: newEventIds, updatedAt: now } : t
          ),
        }))

        // Sync to Supabase
        try {
          const supabase = createBrowserSupabaseClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            // Update thread event_ids
            await supabase
              .from('signal_threads')
              .update({ event_ids: newEventIds, updated_at: now })
              .eq('id', threadId)
              .eq('user_id', user.id)

            // Clear event thread_id
            await supabase
              .from('user_timeline_events')
              .update({ thread_id: null, updated_at: now })
              .eq('id', eventId)
              .eq('user_id', user.id)
          }
        } catch (error) {
          log.error('Remove event from thread error', error)
        }
      },

      getThreadForEvent: (eventId) => {
        const state = get()
        return state.threads.find((t) => t.eventIds.includes(eventId)) ?? null
      },

      // ========== AI Narrative Generation ==========

      generateNarrative: async (threadId) => {
        const state = get()
        const thread = state.threads.find((t) => t.id === threadId)
        if (!thread || thread.eventIds.length === 0) return

        set({ isGenerating: true, syncError: null })

        try {
          const response = await fetch('/api/threads/narrative', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ threadId }),
          })

          const data = await response.json()

          if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to generate narrative')
          }

          const now = new Date().toISOString()

          // Update thread with narrative
          set((s) => ({
            threads: s.threads.map((t) =>
              t.id === threadId
                ? {
                    ...t,
                    narrativeSummary: data.narrative,
                    insights: data.insights ?? [],
                    updatedAt: now,
                  }
                : t
            ),
            isGenerating: false,
          }))

          // Sync to Supabase
          const supabase = createBrowserSupabaseClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            await supabase
              .from('signal_threads')
              .update({
                narrative_summary: data.narrative,
                insights: data.insights ?? [],
                updated_at: now,
              })
              .eq('id', threadId)
              .eq('user_id', user.id)
          }
        } catch (error) {
          log.error('Generate narrative error', error)
          set({
            isGenerating: false,
            syncError: error instanceof Error ? error.message : 'Failed to generate narrative',
          })
        }
      },

      // ========== Supabase Sync ==========

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
            .from('signal_threads')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

          if (error) {
            // Table might not exist yet
            if (error.code === '42P01') {
              log.debug('Signal threads table not created yet')
              set({ isLoading: false })
              return
            }
            log.error('Load threads error', error)
            set({ isLoading: false, syncError: error.message })
            return
          }

          if (data && data.length > 0) {
            const threads = data.map(fromSupabaseThread)
            set({ threads, isLoading: false })
          } else {
            set({ isLoading: false })
          }
        } catch (error) {
          log.error('Load threads error', error)
          set({
            isLoading: false,
            syncError: error instanceof Error ? error.message : 'Failed to load threads',
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

          const supabaseThreads = state.threads.map((thread) => ({
            ...toSupabaseThread(thread),
            created_at: thread.createdAt,
            updated_at: thread.updatedAt,
          }))

          if (supabaseThreads.length > 0) {
            const { error } = await supabase
              .from('signal_threads')
              .upsert(supabaseThreads, { onConflict: 'id' })

            if (error) {
              log.error('Sync threads error', error)
              set({ isSyncing: false, syncError: error.message })
              return
            }
          }

          set({ isSyncing: false })
        } catch (error) {
          log.error('Sync threads error', error)
          set({
            isSyncing: false,
            syncError: error instanceof Error ? error.message : 'Failed to sync threads',
          })
        }
      },

      // ========== Reset ==========

      resetThreads: () => {
        set({
          threads: [],
          activeThreadId: null,
          isLoading: false,
          isGenerating: false,
          isSyncing: false,
          syncError: null,
        })
      },
    }),
    {
      name: 'totalaud-signal-threads-store',
      version: 1,
    }
  )
)

// ============================================================================
// Selectors
// ============================================================================

export const selectActiveThread = (state: SignalThreadState): SignalThread | null => {
  if (!state.activeThreadId) return null
  return state.threads.find((t) => t.id === state.activeThreadId) ?? null
}

export const selectThreadsByType = (state: SignalThreadState, type: ThreadType): SignalThread[] => {
  return state.threads.filter((t) => t.threadType === type)
}

export const selectThreadCount = (state: SignalThreadState): number => {
  return state.threads.length
}

export const selectThreadsWithEvents = (state: SignalThreadState): SignalThread[] => {
  return state.threads.filter((t) => t.eventIds.length > 0)
}

export const selectThreadStatus = (state: SignalThreadState) => ({
  isLoading: state.isLoading,
  isGenerating: state.isGenerating,
  isSyncing: state.isSyncing,
  error: state.syncError,
})
