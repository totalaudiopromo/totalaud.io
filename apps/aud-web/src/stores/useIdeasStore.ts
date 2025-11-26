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

  // Actions
  addCard: (content: string, tag: IdeaTag, position?: { x: number; y: number }) => string
  updateCard: (id: string, updates: Partial<Pick<IdeaCard, 'content' | 'tag'>>) => void
  deleteCard: (id: string) => void
  moveCard: (id: string, position: { x: number; y: number }) => void
  setFilter: (tag: IdeaTag | null) => void
  selectCard: (id: string | null) => void
  clearAllCards: () => void
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
    }),
    {
      name: 'totalaud-ideas-store',
      version: 1,
    }
  )
)

// Selector helpers
export const selectFilteredCards = (state: IdeasState): IdeaCard[] => {
  if (state.filter === null) {
    return state.cards
  }
  return state.cards.filter((card) => card.tag === state.filter)
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
