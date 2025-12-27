/**
 * IdeasUndoProvider Component
 *
 * Provides undo/redo keyboard shortcuts for Ideas Mode.
 * Wraps children and sets up Cmd+Z / Cmd+Shift+Z handlers.
 */

'use client'

import { useEffect, useCallback, useRef, type ReactNode } from 'react'
import { useIdeasStore, type IdeaCard } from '@/stores/useIdeasStore'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'

const log = logger.scope('Ideas Undo')

const MAX_HISTORY_SIZE = 50

// History action type
type HistoryAction = { type: 'delete'; card: IdeaCard }

interface IdeasUndoProviderProps {
  children: ReactNode
}

/**
 * Provider component that enables undo/redo for Ideas Mode.
 * Place this around the Ideas content in the workspace.
 */
export function IdeasUndoProvider({ children }: IdeasUndoProviderProps) {
  // Simple history stack for deleted cards
  const historyRef = useRef<HistoryAction[]>([])
  const historyIndexRef = useRef(-1)

  // Subscribe to card deletions
  const cardsRef = useRef<IdeaCard[]>([])

  useEffect(() => {
    // Initialize with current cards
    cardsRef.current = useIdeasStore.getState().cards

    // Subscribe to store changes to track deletions
    const unsubscribe = useIdeasStore.subscribe((state) => {
      const newCards = state.cards
      const prevCards = cardsRef.current

      // Find deleted cards
      const deletedCards = prevCards.filter(
        (prev: IdeaCard) => !newCards.find((curr: IdeaCard) => curr.id === prev.id)
      )

      // Track deletions for undo
      deletedCards.forEach((card: IdeaCard) => {
        // Truncate redo history
        const history = historyRef.current.slice(0, historyIndexRef.current + 1)
        history.push({ type: 'delete', card })

        // Keep within limit
        if (history.length > MAX_HISTORY_SIZE) {
          history.shift()
        }

        historyRef.current = history
        historyIndexRef.current = history.length - 1
      })

      cardsRef.current = newCards
    })

    return () => unsubscribe()
  }, [])

  // Restore card to Supabase
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
      log.error('Failed to restore card', error)
    }
  }, [])

  // Undo last delete
  const handleUndo = useCallback(async () => {
    const index = historyIndexRef.current
    if (index < 0) return false

    const action = historyRef.current[index]
    historyIndexRef.current = index - 1

    if (action.type === 'delete') {
      // Restore the card to the store
      useIdeasStore.setState((state) => ({
        cards: [...state.cards, action.card],
      }))
      await restoreCardToSupabase(action.card)
      log.debug('Undid delete', { cardId: action.card.id })
      return true
    }

    return false
  }, [restoreCardToSupabase])

  // Redo last undone delete
  const handleRedo = useCallback(async () => {
    const index = historyIndexRef.current
    const history = historyRef.current

    if (index >= history.length - 1) return false

    const action = history[index + 1]
    historyIndexRef.current = index + 1

    if (action.type === 'delete') {
      // Delete the card again
      useIdeasStore.setState((state) => ({
        cards: state.cards.filter((c) => c.id !== action.card.id),
        selectedCardId: state.selectedCardId === action.card.id ? null : state.selectedCardId,
      }))

      // Also delete from Supabase
      try {
        const supabase = createBrowserSupabaseClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          await supabase.from('user_ideas').delete().eq('id', action.card.id).eq('user_id', user.id)
        }
      } catch (error) {
        log.error('Failed to redo delete', error)
      }

      log.debug('Redid delete', { cardId: action.card.id })
      return true
    }

    return false
  }, [])

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Only handle in Ideas mode (check if we're focused in the workspace)
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return // Don't intercept text editing
      }

      // Check for Cmd+Z (Mac) or Ctrl+Z (Windows/Linux)
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifierKey = isMac ? e.metaKey : e.ctrlKey

      if (modifierKey && e.key === 'z') {
        e.preventDefault()

        if (e.shiftKey) {
          await handleRedo()
        } else {
          await handleUndo()
        }
      }

      // Cmd+Y for redo (Windows convention)
      if (modifierKey && e.key === 'y') {
        e.preventDefault()
        await handleRedo()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleUndo, handleRedo])

  return <>{children}</>
}
