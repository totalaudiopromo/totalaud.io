/**
 * Card Slice
 * Manages Analogue Story Cards state
 */

import type { StateCreator } from 'zustand'
import type { AnalogueCard, CardType, CardState } from '../campaign.types'
import type { CampaignState } from '../useCampaignState'

export interface CardSliceActions {
  cards: CardState
  // Card operations
  addCard: (
    type: CardType,
    content: string,
    colour?: string,
    linkedClipId?: string
  ) => void
  removeCard: (cardId: string) => void
  updateCard: (cardId: string, updates: Partial<AnalogueCard>) => void
  linkCardToClip: (cardId: string, clipId: string) => void
  unlinkCard: (cardId: string) => void
  // Selection and filtering
  selectCards: (cardIds: string[]) => void
  clearCardSelection: () => void
  filterCardsByType: (type?: CardType) => void
  sortCards: (sortBy: 'timestamp' | 'type' | 'recent') => void
  // Bulk operations
  getCardsByType: (type: CardType) => AnalogueCard[]
  getCardsForClip: (clipId: string) => AnalogueCard[]
}

const CARD_COLOURS: Record<CardType, string> = {
  hope: '#51CF66', // Green
  doubt: '#94A3B8', // Grey
  pride: '#8B5CF6', // Purple
  fear: '#EF4444', // Red
  clarity: '#3AA9BE', // Cyan
  excitement: '#F59E0B', // Amber
  frustration: '#FF5252', // Dark red
  breakthrough: '#10B981', // Emerald
  uncertainty: '#6B7280', // Cool grey
}

export const createCardSlice: StateCreator<
  CampaignState,
  [],
  [],
  CardSliceActions
> = (set, get) => ({
  cards: {
    cards: [],
    selectedCardIds: [],
    sortBy: 'timestamp',
  },

  // Card operations
  addCard: (
    type: CardType,
    content: string,
    colour?: string,
    linkedClipId?: string
  ) => {
    const cardColour = colour || CARD_COLOURS[type]
    const userId = get().meta.userId

    set((state) => ({
      cards: {
        ...state.cards,
        cards: [
          ...state.cards.cards,
          {
            id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            content,
            timestamp: new Date(),
            linkedClipId,
            colour: cardColour,
            createdBy: userId,
          },
        ],
      },
      isDirty: true,
    }))

    // If linked to a clip, also update the clip's cardLinks
    if (linkedClipId) {
      const cardId = `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      get().linkCardToClip(linkedClipId, cardId)
    }
  },

  removeCard: (cardId: string) => {
    const card = get().cards.cards.find((c) => c.id === cardId)

    set((state) => ({
      cards: {
        ...state.cards,
        cards: state.cards.cards.filter((c) => c.id !== cardId),
        selectedCardIds: state.cards.selectedCardIds.filter((id) => id !== cardId),
      },
      isDirty: true,
    }))

    // If card was linked to a clip, remove the link
    if (card?.linkedClipId) {
      get().unlinkCardFromClip(card.linkedClipId, cardId)
    }
  },

  updateCard: (cardId: string, updates: Partial<AnalogueCard>) => {
    set((state) => ({
      cards: {
        ...state.cards,
        cards: state.cards.cards.map((card) =>
          card.id === cardId ? { ...card, ...updates } : card
        ),
      },
      isDirty: true,
    }))
  },

  linkCardToClip: (cardId: string, clipId: string) => {
    set((state) => ({
      cards: {
        ...state.cards,
        cards: state.cards.cards.map((card) =>
          card.id === cardId ? { ...card, linkedClipId: clipId } : card
        ),
      },
      isDirty: true,
    }))

    // Also update the clip's cardLinks
    get().linkCardToClip(clipId, cardId)
  },

  unlinkCard: (cardId: string) => {
    const card = get().cards.cards.find((c) => c.id === cardId)

    set((state) => ({
      cards: {
        ...state.cards,
        cards: state.cards.cards.map((c) =>
          c.id === cardId ? { ...c, linkedClipId: undefined } : c
        ),
      },
      isDirty: true,
    }))

    // Also update the clip's cardLinks
    if (card?.linkedClipId) {
      get().unlinkCardFromClip(card.linkedClipId, cardId)
    }
  },

  // Selection and filtering
  selectCards: (cardIds: string[]) => {
    set((state) => ({
      cards: { ...state.cards, selectedCardIds: cardIds },
    }))
  },

  clearCardSelection: () => {
    set((state) => ({
      cards: { ...state.cards, selectedCardIds: [] },
    }))
  },

  filterCardsByType: (type?: CardType) => {
    set((state) => ({
      cards: { ...state.cards, filterByType: type },
    }))
  },

  sortCards: (sortBy: 'timestamp' | 'type' | 'recent') => {
    set((state) => ({
      cards: { ...state.cards, sortBy },
    }))
  },

  // Bulk operations
  getCardsByType: (type: CardType) => {
    return get().cards.cards.filter((card) => card.type === type)
  },

  getCardsForClip: (clipId: string) => {
    return get().cards.cards.filter((card) => card.linkedClipId === clipId)
  },
})
