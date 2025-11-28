/**
 * Ideas Mode Store
 *
 * Phase 6: MVP Pivot - Ideas Canvas
 *
 * A simple, localStorage-persisted store for idea cards.
 * Inspired by Muse App and FigJam stickies.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type IdeaTag = 'content' | 'brand' | 'music' | 'promo'
export type SortMode = 'newest' | 'oldest' | 'alpha'
export type ViewMode = 'canvas' | 'list'

export interface IdeaCard {
  id: string
  content: string
  tag: IdeaTag
  position: { x: number; y: number }
  createdAt: string
  updatedAt: string
}

interface IdeasState {
  cards: IdeaCard[]
  filter: IdeaTag | null
  selectedCardId: string | null
  searchQuery: string
  sortMode: SortMode
  viewMode: ViewMode

  // Actions
  addCard: (content: string, tag: IdeaTag, position?: { x: number; y: number }) => string
  updateCard: (id: string, updates: Partial<Pick<IdeaCard, 'content' | 'tag'>>) => void
  deleteCard: (id: string) => void
  moveCard: (id: string, position: { x: number; y: number }) => void
  setFilter: (tag: IdeaTag | null) => void
  selectCard: (id: string | null) => void
  clearAllCards: () => void
  setSearchQuery: (query: string) => void
  setSortMode: (mode: SortMode) => void
  setViewMode: (mode: ViewMode) => void
}

function generateId(): string {
  return `idea-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(16)}`
}

function getRandomPosition(): { x: number; y: number } {
  // Random position within a reasonable canvas area
  return {
    x: 100 + Math.floor(Math.random() * 400),
    y: 100 + Math.floor(Math.random() * 300),
  }
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

      addCard: (content, tag, position) => {
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

        set((state) => ({
          cards: [...state.cards, newCard],
          selectedCardId: id,
        }))

        return id
      },

      updateCard: (id, updates) => {
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === id
              ? {
                  ...card,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : card
          ),
        }))
      },

      deleteCard: (id) => {
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== id),
          selectedCardId: state.selectedCardId === id ? null : state.selectedCardId,
        }))
      },

      moveCard: (id, position) => {
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === id
              ? {
                  ...card,
                  position,
                  updatedAt: new Date().toISOString(),
                }
              : card
          ),
        }))
      },

      setFilter: (tag) => {
        set({ filter: tag })
      },

      selectCard: (id) => {
        set({ selectedCardId: id })
      },

      clearAllCards: () => {
        set({
          cards: [],
          selectedCardId: null,
        })
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
    }),
    {
      name: 'totalaud-ideas-store',
      version: 2,
    }
  )
)

// Selector helpers
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
    { content: 0, brand: 0, music: 0, promo: 0 } as Record<IdeaTag, number>
  )
}

// Export helpers
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
