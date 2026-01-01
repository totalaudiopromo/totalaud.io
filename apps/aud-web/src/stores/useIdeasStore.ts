/**
 * Ideas Mode Store
 *
 * Phase 10: Data Persistence
 *
 * A Zustand store for idea cards with:
 * - Supabase sync for authenticated users
 * - localStorage fallback for unauthenticated users
 * - Debounced sync to reduce API calls
 * - Optimistic updates for snappy UX
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import type { SyncedIdea } from '@/hooks/useSupabaseSync'
import { logger } from '@/lib/logger'

const log = logger.scope('Ideas Store')

export type IdeaTag = 'content' | 'brand' | 'promo'
export type SortMode = 'newest' | 'oldest' | 'alpha'
export type ViewMode = 'canvas' | 'list'

export interface IdeaCard {
  id: string
  content: string
  tag: IdeaTag
  position: { x: number; y: number }
  createdAt: string
  updatedAt: string
  isStarter?: boolean
}

// Starter ideas for new users
const STARTER_IDEAS: Omit<IdeaCard, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    content: 'Describe your next release in one sentence',
    tag: 'content',
    position: { x: 120, y: 150 },
    isStarter: true,
  },
  {
    content: 'Three content ideas for TikTok / Reels',
    tag: 'promo',
    position: { x: 420, y: 120 },
    isStarter: true,
  },
  {
    content: 'Your artist identity — what makes you different?',
    tag: 'brand',
    position: { x: 260, y: 350 },
    isStarter: true,
  },
]

interface IdeasState {
  cards: IdeaCard[]
  filter: IdeaTag | null
  selectedCardId: string | null
  searchQuery: string
  sortMode: SortMode
  viewMode: ViewMode
  hasSeenStarters: boolean

  // Sync state
  isLoading: boolean
  isSyncing: boolean
  syncError: string | null
  lastSyncedAt: string | null

  // Actions
  addCard: (content: string, tag: IdeaTag, position?: { x: number; y: number }) => Promise<string>
  updateCard: (id: string, updates: Partial<Pick<IdeaCard, 'content' | 'tag'>>) => Promise<void>
  deleteCard: (id: string) => Promise<void>
  moveCard: (id: string, position: { x: number; y: number }) => Promise<void>
  setFilter: (tag: IdeaTag | null) => void
  selectCard: (id: string | null) => void
  clearAllCards: () => Promise<void>
  setSearchQuery: (query: string) => void
  setSortMode: (mode: SortMode) => void
  setViewMode: (mode: ViewMode) => void
  initStarterIdeas: () => void
  dismissStarterIdeas: () => Promise<void>

  // Sync actions
  loadFromSupabase: () => Promise<void>
  syncToSupabase: () => Promise<void>
}

function generateId(): string {
  return `idea-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(16)}`
}

function getRandomPosition(): { x: number; y: number } {
  return {
    x: 100 + Math.floor(Math.random() * 400),
    y: 100 + Math.floor(Math.random() * 300),
  }
}

// Convert local card to Supabase format
function toSupabaseIdea(
  card: IdeaCard,
  userId: string
): Omit<SyncedIdea, 'created_at' | 'updated_at'> {
  return {
    id: card.id,
    user_id: userId,
    content: card.content,
    tag: card.tag,
    position_x: card.position.x,
    position_y: card.position.y,
    is_starter: card.isStarter ?? false,
  }
}

// Type for the raw database row (with nullable position fields)
interface DatabaseIdea {
  id: string
  user_id: string
  content: string
  tag: string
  position_x: number | null
  position_y: number | null
  is_starter: boolean | null
  created_at: string
  updated_at: string
}

// Convert Supabase format to local card
function fromSupabaseIdea(idea: DatabaseIdea): IdeaCard {
  return {
    id: idea.id,
    content: idea.content,
    tag: idea.tag as IdeaTag,
    position: { x: idea.position_x ?? 100, y: idea.position_y ?? 100 },
    createdAt: idea.created_at,
    updatedAt: idea.updated_at,
    isStarter: idea.is_starter ?? false,
  }
}

// Migration function for persisted state
interface PersistedState {
  cards?: IdeaCard[]
  filter?: IdeaTag | null
  selectedCardId?: string | null
  searchQuery?: string
  sortMode?: SortMode
  viewMode?: ViewMode
  hasSeenStarters?: boolean
}

export const useIdeasStore = create<IdeasState>()(
  persist(
    (set, get) => ({
      cards: [],
      filter: null,
      selectedCardId: null,
      searchQuery: '',
      sortMode: 'newest' as SortMode,
      viewMode: 'canvas' as ViewMode,
      hasSeenStarters: false,

      // Sync state
      isLoading: false,
      isSyncing: false,
      syncError: null,
      lastSyncedAt: null,

      // ========== CRUD Actions ==========

      addCard: async (content, tag, position) => {
        const id = generateId()
        const now = new Date().toISOString()

        const newCard: IdeaCard = {
          id,
          content,
          tag,
          position: position ?? getRandomPosition(),
          createdAt: now,
          updatedAt: now,
        }

        // Optimistic update
        set((state) => ({
          cards: [...state.cards, newCard],
          selectedCardId: id,
        }))

        // Sync to Supabase if authenticated
        try {
          const supabase = createBrowserSupabaseClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            const { error } = await supabase
              .from('user_ideas')
              .insert(toSupabaseIdea(newCard, user.id))

            if (error) {
              log.error('Insert error', error)
              set({ syncError: error.message })
            }
          }
        } catch (error) {
          log.error('Sync error', error)
        }

        return id
      },

      updateCard: async (id, updates) => {
        const now = new Date().toISOString()

        // Optimistic update
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === id ? { ...card, ...updates, updatedAt: now } : card
          ),
        }))

        // Sync to Supabase if authenticated
        try {
          const supabase = createBrowserSupabaseClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            const { error } = await supabase
              .from('user_ideas')
              .update({ ...updates, updated_at: now })
              .eq('id', id)
              .eq('user_id', user.id)

            if (error) {
              log.error('Update error', error)
              set({ syncError: error.message })
            }
          }
        } catch (error) {
          log.error('Sync error', error)
        }
      },

      deleteCard: async (id) => {
        // Optimistic update
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== id),
          selectedCardId: state.selectedCardId === id ? null : state.selectedCardId,
        }))

        // Sync to Supabase if authenticated
        try {
          const supabase = createBrowserSupabaseClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            const { error } = await supabase
              .from('user_ideas')
              .delete()
              .eq('id', id)
              .eq('user_id', user.id)

            if (error) {
              log.error('Delete error', error)
              set({ syncError: error.message })
            }
          }
        } catch (error) {
          log.error('Sync error', error)
        }
      },

      moveCard: async (id, position) => {
        const now = new Date().toISOString()

        // Optimistic update
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === id ? { ...card, position, updatedAt: now } : card
          ),
        }))

        // Debounced sync for position updates (called frequently during drag)
        // We'll sync position on drag end, not during drag
        try {
          const supabase = createBrowserSupabaseClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            const { error } = await supabase
              .from('user_ideas')
              .update({
                position_x: position.x,
                position_y: position.y,
                updated_at: now,
              })
              .eq('id', id)
              .eq('user_id', user.id)

            if (error) {
              log.error('Move error', error)
            }
          }
        } catch (error) {
          log.error('Sync error', error)
        }
      },

      // ========== UI State Actions ==========

      setFilter: (tag) => {
        set({ filter: tag })
      },

      selectCard: (id) => {
        set({ selectedCardId: id })
      },

      clearAllCards: async () => {
        set({
          cards: [],
          selectedCardId: null,
        })

        // Delete all cards from Supabase
        try {
          const supabase = createBrowserSupabaseClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            const { error } = await supabase.from('user_ideas').delete().eq('user_id', user.id)

            if (error) {
              log.error('Clear all error', error)
              set({ syncError: error.message })
            }
          }
        } catch (error) {
          log.error('Sync error', error)
        }
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query })
      },

      setSortMode: (mode) => {
        set({ sortMode: mode })
      },

      setViewMode: (mode) => {
        set({ viewMode: mode })
      },

      // ========== Starter Ideas ==========

      initStarterIdeas: () => {
        const state = get()
        if (!state.hasSeenStarters && state.cards.length === 0) {
          const now = new Date().toISOString()
          const starterCards: IdeaCard[] = STARTER_IDEAS.map((idea, index) => ({
            ...idea,
            id: `starter-${index}`,
            createdAt: now,
            updatedAt: now,
          }))

          set({
            cards: starterCards,
            hasSeenStarters: true,
          })
        }
      },

      dismissStarterIdeas: async () => {
        const starterIds = get()
          .cards.filter((c) => c.isStarter)
          .map((c) => c.id)

        set((state) => ({
          cards: state.cards.filter((card) => !card.isStarter),
          hasSeenStarters: true,
        }))

        // Delete starters from Supabase if they were synced
        try {
          const supabase = createBrowserSupabaseClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user && starterIds.length > 0) {
            const { error } = await supabase
              .from('user_ideas')
              .delete()
              .eq('user_id', user.id)
              .in('id', starterIds)

            if (error) {
              log.error('Dismiss starters error', error)
            }
          }
        } catch (error) {
          log.error('Sync error', error)
        }
      },

      // ========== Sync Actions ==========

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
            .from('user_ideas')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

          if (error) {
            log.error('Load error', error)
            set({ isLoading: false, syncError: error.message })
            return
          }

          if (data && data.length > 0) {
            const cards = data.map(fromSupabaseIdea)
            set({
              cards,
              isLoading: false,
              lastSyncedAt: new Date().toISOString(),
              hasSeenStarters: true, // Don't show starters if user has synced data
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

          // Upsert all cards
          const ideas = state.cards.map((card) => ({
            ...toSupabaseIdea(card, user.id),
            created_at: card.createdAt,
            updated_at: card.updatedAt,
          }))

          if (ideas.length > 0) {
            const { error } = await supabase.from('user_ideas').upsert(ideas, { onConflict: 'id' })

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
      name: 'totalaud-ideas-store',
      version: 4, // Bump version for sync fields
      migrate: (persistedState: unknown, version: number): IdeasState => {
        const state = persistedState as PersistedState

        // Migration to version 4: add sync fields
        return {
          cards: state.cards ?? [],
          filter: state.filter ?? null,
          selectedCardId: state.selectedCardId ?? null,
          searchQuery: state.searchQuery ?? '',
          sortMode: state.sortMode ?? 'newest',
          viewMode: state.viewMode ?? 'canvas',
          hasSeenStarters: state.hasSeenStarters ?? false,
          isLoading: false,
          isSyncing: false,
          syncError: null,
          lastSyncedAt: null,
          // Actions will be added by zustand
          addCard: async () => '',
          updateCard: async () => {},
          deleteCard: async () => {},
          moveCard: async () => {},
          setFilter: () => {},
          selectCard: () => {},
          clearAllCards: async () => {},
          setSearchQuery: () => {},
          setSortMode: () => {},
          setViewMode: () => {},
          initStarterIdeas: () => {},
          dismissStarterIdeas: async () => {},
          loadFromSupabase: async () => {},
          syncToSupabase: async () => {},
        }
      },
    }
  )
)

// ========== Selectors ==========

export const selectFilteredCards = (state: IdeasState): IdeaCard[] => {
  let cards = state.cards

  // Tag filter
  if (state.filter !== null) {
    cards = cards.filter((card) => card.tag === state.filter)
  }

  // Search filter
  if (state.searchQuery.trim()) {
    const query = state.searchQuery.toLowerCase()
    cards = cards.filter((card) => card.content.toLowerCase().includes(query))
  }

  // Sort
  switch (state.sortMode) {
    case 'newest':
      cards = [...cards].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      break
    case 'oldest':
      cards = [...cards].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      break
    case 'alpha':
      cards = [...cards].sort((a, b) =>
        a.content.toLowerCase().localeCompare(b.content.toLowerCase())
      )
      break
  }

  return cards
}

export const selectSelectedCard = (state: IdeasState): IdeaCard | null => {
  if (state.selectedCardId === null) return null
  return state.cards.find((card) => card.id === state.selectedCardId) ?? null
}

export const selectCardCount = (state: IdeasState): number => {
  return state.cards.length
}

export const selectCardCountByTag = (state: IdeasState): Record<IdeaTag, number> => {
  return state.cards.reduce(
    (acc, card) => {
      acc[card.tag] = (acc[card.tag] || 0) + 1
      return acc
    },
    { content: 0, brand: 0, promo: 0 } as Record<IdeaTag, number>
  )
}

export const selectHasStarterIdeas = (state: IdeasState): boolean => {
  return state.cards.some((card) => card.isStarter)
}

export const selectSyncStatus = (state: IdeasState) => ({
  isLoading: state.isLoading,
  isSyncing: state.isSyncing,
  error: state.syncError,
  lastSyncedAt: state.lastSyncedAt,
})

// ========== Export Helpers ==========

export function buildMarkdownExport(ideas: IdeaCard[]): string {
  if (ideas.length === 0) return 'No ideas to export.'

  return ideas
    .map((idea) => {
      const date = new Date(idea.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
      return `## ${idea.tag.charAt(0).toUpperCase() + idea.tag.slice(1)}\n\n${idea.content}\n\n*Created: ${date}*\n\n---`
    })
    .join('\n\n')
}

export function buildPlainTextExport(ideas: IdeaCard[]): string {
  if (ideas.length === 0) return 'No ideas to export.'

  return ideas
    .map((idea) => {
      const date = new Date(idea.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
      return `[${idea.tag.toUpperCase()}] ${idea.content}\n(${date})`
    })
    .join('\n\n')
}
