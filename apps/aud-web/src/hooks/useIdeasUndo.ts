/**
 * Ideas Undo/Redo Hook
 *
 * Provides undo/redo functionality for Ideas Mode with:
 * - History stack (max 50 actions)
 * - Keyboard shortcuts (Cmd+Z / Cmd+Shift+Z)
 * - Toast with "Undo" button on delete (5-second window)
 *
 * This hook works alongside useIdeasStore to track and revert changes.
 */

'use client'

import { useCallback, useEffect, useRef } from 'react'
import { create } from 'zustand'
import { useIdeasStore, type IdeaCard } from '@/stores/useIdeasStore'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'

const log = logger.scope('Ideas Undo')

// History action types
export type HistoryAction =
  | { type: 'add'; card: IdeaCard }
  | { type: 'delete'; card: IdeaCard }
  | {
      type: 'update'
      cardId: string
      before: Partial<IdeaCard>
      after: Partial<IdeaCard>
    }
  | { type: 'clear'; cards: IdeaCard[] }

const MAX_HISTORY_SIZE = 50

interface UndoState {
  history: HistoryAction[]
  historyIndex: number
  lastDeletedCard: IdeaCard | null
  lastDeletedAt: number | null

  // Actions
  pushAction: (action: HistoryAction) => void
  undo: () => HistoryAction | null
  redo: () => HistoryAction | null
  canUndo: () => boolean
  canRedo: () => boolean
  clearHistory: () => void
  setLastDeleted: (card: IdeaCard | null) => void
  getLastDeleted: () => IdeaCard | null
}

// Separate store for undo history (not persisted)
export const useUndoStore = create<UndoState>((set, get) => ({
  history: [],
  historyIndex: -1,
  lastDeletedCard: null,
  lastDeletedAt: null,

  pushAction: (action) => {
    set((state) => {
      // Truncate any redo history when a new action is performed
      const newHistory = state.history.slice(0, state.historyIndex + 1)
      newHistory.push(action)

      // Keep history within size limit
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift()
        return {
          history: newHistory,
          historyIndex: newHistory.length - 1,
        }
      }

      return {
        history: newHistory,
        historyIndex: newHistory.length - 1,
      }
    })
  },

  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex < 0) return null

    const action = history[historyIndex]
    set({ historyIndex: historyIndex - 1 })
    return action
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex >= history.length - 1) return null

    const action = history[historyIndex + 1]
    set({ historyIndex: historyIndex + 1 })
    return action
  },

  canUndo: () => get().historyIndex >= 0,

  canRedo: () => {
    const { history, historyIndex } = get()
    return historyIndex < history.length - 1
  },

  clearHistory: () => {
    set({
      history: [],
      historyIndex: -1,
      lastDeletedCard: null,
      lastDeletedAt: null,
    })
  },

  setLastDeleted: (card) => {
    set({
      lastDeletedCard: card,
      lastDeletedAt: card ? Date.now() : null,
    })
  },

  getLastDeleted: () => {
    const { lastDeletedCard, lastDeletedAt } = get()
    // Only return if deleted within last 5 seconds
    if (lastDeletedCard && lastDeletedAt && Date.now() - lastDeletedAt < 5000) {
      return lastDeletedCard
    }
    return null
  },
}))

/**
 * Hook to integrate undo/redo with Ideas store
 */
export function useIdeasUndo() {
  const addCard = useIdeasStore((state) => state.addCard)
  const deleteCard = useIdeasStore((state) => state.deleteCard)
  const updateCard = useIdeasStore((state) => state.updateCard)
  const cards = useIdeasStore((state) => state.cards)

  const { pushAction, undo, redo, canUndo, canRedo, setLastDeleted, getLastDeleted } =
    useUndoStore()

  // Track card state before operations
  const cardSnapshotRef = useRef<Map<string, IdeaCard>>(new Map())

  // Update snapshot when cards change
  useEffect(() => {
    const snapshot = new Map<string, IdeaCard>()
    cards.forEach((card) => snapshot.set(card.id, { ...card }))
    cardSnapshotRef.current = snapshot
  }, [cards])

  // Restore a deleted card to Supabase
  const restoreCardToSupabase = useCallback(async (card: IdeaCard) => {
    try {
      const supabase = createBrowserSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        await supabase.from('user_ideas').upsert({
          id: card.id,
          user_id: user.id,
          content: card.content,
          tag: card.tag,
          position_x: card.position.x,
          position_y: card.position.y,
          is_starter: card.isStarter ?? false,
          created_at: card.createdAt,
          updated_at: new Date().toISOString(),
        })
      }
    } catch (error) {
      log.error('Failed to restore card to Supabase', error)
    }
  }, [])

  // Execute undo action
  const executeUndo = useCallback(async () => {
    const action = undo()
    if (!action) return false

    log.debug('Undoing action', { type: action.type })

    switch (action.type) {
      case 'add':
        // Undo add = delete the card (without pushing to history)
        await deleteCard(action.card.id)
        break

      case 'delete':
        // Undo delete = restore the card
        // We need to re-add directly to the store
        useIdeasStore.setState((state) => ({
          cards: [...state.cards, action.card],
        }))
        await restoreCardToSupabase(action.card)
        break

      case 'update':
        // Undo update = apply the "before" state
        await updateCard(action.cardId, action.before)
        break

      case 'clear':
        // Undo clear = restore all cards
        useIdeasStore.setState({ cards: action.cards })
        // Restore all to Supabase
        for (const card of action.cards) {
          await restoreCardToSupabase(card)
        }
        break
    }

    return true
  }, [undo, deleteCard, updateCard, restoreCardToSupabase])

  // Execute redo action
  const executeRedo = useCallback(async () => {
    const action = redo()
    if (!action) return false

    log.debug('Redoing action', { type: action.type })

    switch (action.type) {
      case 'add':
        // Redo add = re-add the card
        useIdeasStore.setState((state) => ({
          cards: [...state.cards, action.card],
        }))
        await restoreCardToSupabase(action.card)
        break

      case 'delete':
        // Redo delete = delete the card again
        await deleteCard(action.card.id)
        break

      case 'update':
        // Redo update = apply the "after" state
        await updateCard(action.cardId, action.after)
        break

      case 'clear':
        // Redo clear = clear all cards again
        useIdeasStore.setState({ cards: [], selectedCardId: null })
        break
    }

    return true
  }, [redo, deleteCard, updateCard, restoreCardToSupabase])

  // Track an add action
  const trackAdd = useCallback(
    (card: IdeaCard) => {
      pushAction({ type: 'add', card })
    },
    [pushAction]
  )

  // Track a delete action
  const trackDelete = useCallback(
    (card: IdeaCard) => {
      pushAction({ type: 'delete', card })
      setLastDeleted(card)
    },
    [pushAction, setLastDeleted]
  )

  // Track an update action
  const trackUpdate = useCallback(
    (cardId: string, before: Partial<IdeaCard>, after: Partial<IdeaCard>) => {
      pushAction({ type: 'update', cardId, before, after })
    },
    [pushAction]
  )

  // Track a clear all action
  const trackClearAll = useCallback(
    (cards: IdeaCard[]) => {
      pushAction({ type: 'clear', cards })
    },
    [pushAction]
  )

  // Get card snapshot for tracking updates
  const getCardSnapshot = useCallback((cardId: string) => {
    return cardSnapshotRef.current.get(cardId)
  }, [])

  // Restore last deleted card (for toast "Undo" button)
  const restoreLastDeleted = useCallback(async () => {
    const card = getLastDeleted()
    if (!card) return false

    // Restore the card
    useIdeasStore.setState((state) => ({
      cards: [...state.cards, card],
    }))
    await restoreCardToSupabase(card)
    setLastDeleted(null)

    return true
  }, [getLastDeleted, setLastDeleted, restoreCardToSupabase])

  return {
    executeUndo,
    executeRedo,
    canUndo,
    canRedo,
    trackAdd,
    trackDelete,
    trackUpdate,
    trackClearAll,
    getCardSnapshot,
    getLastDeleted,
    restoreLastDeleted,
  }
}

/**
 * Hook to set up keyboard shortcuts for undo/redo
 */
export function useIdeasUndoKeyboard() {
  const { executeUndo, executeRedo, canUndo, canRedo } = useIdeasUndo()

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Check for Cmd+Z (Mac) or Ctrl+Z (Windows/Linux)
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifierKey = isMac ? e.metaKey : e.ctrlKey

      if (modifierKey && e.key === 'z') {
        // Prevent default browser undo
        e.preventDefault()

        if (e.shiftKey) {
          // Cmd+Shift+Z = Redo
          if (canRedo()) {
            await executeRedo()
            log.debug('Redo executed via keyboard')
          }
        } else {
          // Cmd+Z = Undo
          if (canUndo()) {
            await executeUndo()
            log.debug('Undo executed via keyboard')
          }
        }
      }

      // Also support Cmd+Y for redo (Windows convention)
      if (modifierKey && e.key === 'y') {
        e.preventDefault()
        if (canRedo()) {
          await executeRedo()
          log.debug('Redo executed via keyboard (Cmd+Y)')
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [executeUndo, executeRedo, canUndo, canRedo])
}
