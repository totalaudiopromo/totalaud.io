/**
 * useIdeasStore Tests
 *
 * Phase 6: MVP Pivot - Ideas Canvas
 * Phase 10: Updated for async Supabase sync
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import {
  useIdeasStore,
  selectFilteredCards,
  selectSelectedCard,
  selectCardCount,
  selectCardCountByTag,
} from '../useIdeasStore'

describe('useIdeasStore', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      useIdeasStore.getState().clearAllCards()
      useIdeasStore.setState({ filter: null, selectedCardId: null })
    })
    localStorage.clear()
  })

  describe('addCard', () => {
    it('adds a new card with content and tag', async () => {
      await act(async () => {
        await useIdeasStore.getState().addCard('Test idea', 'content')
      })

      const state = useIdeasStore.getState()
      expect(state.cards).toHaveLength(1)
      expect(state.cards[0].content).toBe('Test idea')
      expect(state.cards[0].tag).toBe('content')
    })

    it('generates a unique ID for each card', async () => {
      await act(async () => {
        await useIdeasStore.getState().addCard('Idea 1', 'content')
        await useIdeasStore.getState().addCard('Idea 2', 'brand')
      })

      const state = useIdeasStore.getState()
      expect(state.cards[0].id).not.toBe(state.cards[1].id)
    })

    it('sets position when provided', async () => {
      await act(async () => {
        await useIdeasStore.getState().addCard('Test', 'music', { x: 100, y: 200 })
      })

      const state = useIdeasStore.getState()
      expect(state.cards[0].position).toEqual({ x: 100, y: 200 })
    })

    it('generates random position when not provided', async () => {
      await act(async () => {
        await useIdeasStore.getState().addCard('Test', 'promo')
      })

      const state = useIdeasStore.getState()
      expect(state.cards[0].position.x).toBeGreaterThanOrEqual(100)
      expect(state.cards[0].position.y).toBeGreaterThanOrEqual(100)
    })

    it('selects the newly added card', async () => {
      let id: string = ''
      await act(async () => {
        id = await useIdeasStore.getState().addCard('Test', 'content')
      })
      expect(useIdeasStore.getState().selectedCardId).toBe(id)
    })

    it('sets createdAt and updatedAt timestamps', async () => {
      const before = new Date().toISOString()

      await act(async () => {
        await useIdeasStore.getState().addCard('Test', 'content')
      })

      const after = new Date().toISOString()
      const state = useIdeasStore.getState()

      expect(state.cards[0].createdAt).toBeTruthy()
      expect(state.cards[0].updatedAt).toBeTruthy()
      expect(state.cards[0].createdAt >= before).toBe(true)
      expect(state.cards[0].createdAt <= after).toBe(true)
    })
  })

  describe('updateCard', () => {
    it('updates card content', async () => {
      let cardId = ''

      await act(async () => {
        cardId = await useIdeasStore.getState().addCard('Original', 'content')
      })

      await act(async () => {
        await useIdeasStore.getState().updateCard(cardId, { content: 'Updated' })
      })

      const state = useIdeasStore.getState()
      expect(state.cards[0].content).toBe('Updated')
    })

    it('updates card tag', async () => {
      let cardId = ''

      await act(async () => {
        cardId = await useIdeasStore.getState().addCard('Test', 'content')
      })

      await act(async () => {
        await useIdeasStore.getState().updateCard(cardId, { tag: 'brand' })
      })

      const state = useIdeasStore.getState()
      expect(state.cards[0].tag).toBe('brand')
    })

    it('updates updatedAt timestamp', async () => {
      let cardId = ''
      let originalUpdatedAt = ''

      await act(async () => {
        cardId = await useIdeasStore.getState().addCard('Test', 'content')
        originalUpdatedAt = useIdeasStore.getState().cards[0].updatedAt
      })

      // Small delay to ensure different timestamp
      vi.useFakeTimers()
      vi.advanceTimersByTime(100)

      await act(async () => {
        await useIdeasStore.getState().updateCard(cardId, { content: 'New content' })
      })

      vi.useRealTimers()

      const state = useIdeasStore.getState()
      expect(state.cards[0].updatedAt).not.toBe(originalUpdatedAt)
    })
  })

  describe('deleteCard', () => {
    it('removes a card', async () => {
      let cardId = ''

      await act(async () => {
        cardId = await useIdeasStore.getState().addCard('Test', 'content')
      })

      expect(useIdeasStore.getState().cards).toHaveLength(1)

      await act(async () => {
        await useIdeasStore.getState().deleteCard(cardId)
      })

      expect(useIdeasStore.getState().cards).toHaveLength(0)
    })

    it('clears selection if deleted card was selected', async () => {
      let cardId = ''

      await act(async () => {
        cardId = await useIdeasStore.getState().addCard('Test', 'content')
        useIdeasStore.getState().selectCard(cardId)
      })

      expect(useIdeasStore.getState().selectedCardId).toBe(cardId)

      await act(async () => {
        await useIdeasStore.getState().deleteCard(cardId)
      })

      expect(useIdeasStore.getState().selectedCardId).toBeNull()
    })

    it('keeps selection if different card was deleted', async () => {
      let card1Id = ''
      let card2Id = ''

      await act(async () => {
        card1Id = await useIdeasStore.getState().addCard('Card 1', 'content')
        card2Id = await useIdeasStore.getState().addCard('Card 2', 'brand')
        useIdeasStore.getState().selectCard(card1Id)
      })

      await act(async () => {
        await useIdeasStore.getState().deleteCard(card2Id)
      })

      expect(useIdeasStore.getState().selectedCardId).toBe(card1Id)
    })
  })

  describe('moveCard', () => {
    it('updates card position', async () => {
      let cardId = ''

      await act(async () => {
        cardId = await useIdeasStore.getState().addCard('Test', 'content', { x: 0, y: 0 })
      })

      await act(async () => {
        await useIdeasStore.getState().moveCard(cardId, { x: 150, y: 250 })
      })

      const state = useIdeasStore.getState()
      expect(state.cards[0].position).toEqual({ x: 150, y: 250 })
    })
  })

  describe('setFilter', () => {
    it('sets filter to a tag', () => {
      act(() => {
        useIdeasStore.getState().setFilter('brand')
      })

      expect(useIdeasStore.getState().filter).toBe('brand')
    })

    it('clears filter when set to null', () => {
      act(() => {
        useIdeasStore.getState().setFilter('brand')
        useIdeasStore.getState().setFilter(null)
      })

      expect(useIdeasStore.getState().filter).toBeNull()
    })
  })

  describe('selectCard', () => {
    it('selects a card by ID', async () => {
      let cardId = ''

      await act(async () => {
        cardId = await useIdeasStore.getState().addCard('Test', 'content')
        useIdeasStore.getState().selectCard(null) // Reset selection
        useIdeasStore.getState().selectCard(cardId)
      })

      expect(useIdeasStore.getState().selectedCardId).toBe(cardId)
    })

    it('deselects when set to null', async () => {
      await act(async () => {
        const cardId = await useIdeasStore.getState().addCard('Test', 'content')
        useIdeasStore.getState().selectCard(cardId)
        useIdeasStore.getState().selectCard(null)
      })

      expect(useIdeasStore.getState().selectedCardId).toBeNull()
    })
  })

  describe('clearAllCards', () => {
    it('removes all cards', async () => {
      await act(async () => {
        await useIdeasStore.getState().addCard('Card 1', 'content')
        await useIdeasStore.getState().addCard('Card 2', 'brand')
        await useIdeasStore.getState().addCard('Card 3', 'music')
      })

      expect(useIdeasStore.getState().cards).toHaveLength(3)

      act(() => {
        useIdeasStore.getState().clearAllCards()
      })

      expect(useIdeasStore.getState().cards).toHaveLength(0)
    })

    it('clears selection', async () => {
      await act(async () => {
        const cardId = await useIdeasStore.getState().addCard('Test', 'content')
        useIdeasStore.getState().selectCard(cardId)
        useIdeasStore.getState().clearAllCards()
      })

      expect(useIdeasStore.getState().selectedCardId).toBeNull()
    })
  })

  describe('selectors', () => {
    describe('selectFilteredCards', () => {
      it('returns all cards when no filter', async () => {
        await act(async () => {
          await useIdeasStore.getState().addCard('Card 1', 'content')
          await useIdeasStore.getState().addCard('Card 2', 'brand')
          await useIdeasStore.getState().addCard('Card 3', 'music')
        })

        const state = useIdeasStore.getState()
        const filtered = selectFilteredCards(state)
        expect(filtered).toHaveLength(3)
      })

      it('filters cards by tag', async () => {
        await act(async () => {
          await useIdeasStore.getState().addCard('Card 1', 'content')
          await useIdeasStore.getState().addCard('Card 2', 'brand')
          await useIdeasStore.getState().addCard('Card 3', 'content')
          useIdeasStore.getState().setFilter('content')
        })

        const state = useIdeasStore.getState()
        const filtered = selectFilteredCards(state)
        expect(filtered).toHaveLength(2)
        expect(filtered.every((c) => c.tag === 'content')).toBe(true)
      })
    })

    describe('selectSelectedCard', () => {
      it('returns selected card', async () => {
        await act(async () => {
          const cardId = await useIdeasStore.getState().addCard('Test', 'content')
          useIdeasStore.getState().selectCard(cardId)
        })

        const state = useIdeasStore.getState()
        const selected = selectSelectedCard(state)
        expect(selected).not.toBeNull()
        expect(selected?.content).toBe('Test')
      })

      it('returns null when no selection', async () => {
        await act(async () => {
          await useIdeasStore.getState().addCard('Test', 'content')
          useIdeasStore.getState().selectCard(null)
        })

        const state = useIdeasStore.getState()
        const selected = selectSelectedCard(state)
        expect(selected).toBeNull()
      })
    })

    describe('selectCardCount', () => {
      it('returns total card count', async () => {
        await act(async () => {
          await useIdeasStore.getState().addCard('Card 1', 'content')
          await useIdeasStore.getState().addCard('Card 2', 'brand')
        })

        const state = useIdeasStore.getState()
        expect(selectCardCount(state)).toBe(2)
      })
    })

    describe('selectCardCountByTag', () => {
      it('returns counts by tag', async () => {
        await act(async () => {
          await useIdeasStore.getState().addCard('Card 1', 'content')
          await useIdeasStore.getState().addCard('Card 2', 'content')
          await useIdeasStore.getState().addCard('Card 3', 'brand')
          await useIdeasStore.getState().addCard('Card 4', 'music')
        })

        const state = useIdeasStore.getState()
        const counts = selectCardCountByTag(state)

        expect(counts.content).toBe(2)
        expect(counts.brand).toBe(1)
        expect(counts.music).toBe(1)
        expect(counts.promo).toBe(0)
      })
    })
  })
})
