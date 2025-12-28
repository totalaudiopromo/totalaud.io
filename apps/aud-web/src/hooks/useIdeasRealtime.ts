/**
 * Ideas Realtime Hook
 *
 * Connects the Ideas store to Supabase Realtime for multi-device sync.
 * Use this hook in components that display ideas to enable live updates.
 *
 * @example
 * ```tsx
 * function IdeasCanvas() {
 *   const userId = useCurrentUserId()
 *   useIdeasRealtime(userId)
 *
 *   // Ideas will now sync across devices in real-time
 *   const { cards } = useIdeasStore()
 *   // ...
 * }
 * ```
 */

import { useCallback } from 'react'
import { useIdeasStore, type IdeaCard, type IdeaTag } from '@/stores/useIdeasStore'
import { useSupabaseRealtime, type RealtimeStatus } from './useSupabaseRealtime'
import { logger } from '@/lib/logger'

const log = logger.scope('IdeasRealtime')

// Database row type (matches Supabase schema)
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

// Convert database row to local IdeaCard
function fromDatabaseIdea(data: DatabaseIdea): IdeaCard {
  return {
    id: data.id,
    content: data.content,
    tag: data.tag as IdeaTag,
    position: { x: data.position_x ?? 100, y: data.position_y ?? 100 },
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    isStarter: data.is_starter ?? false,
  }
}

/**
 * Hook to enable realtime sync for ideas
 *
 * @param userId - Current user ID (from auth)
 * @param options - Optional configuration
 * @returns Realtime connection status
 */
export function useIdeasRealtime(
  userId: string | null | undefined,
  options?: { debug?: boolean; disabled?: boolean }
): RealtimeStatus {
  const store = useIdeasStore()

  // Handle remote insert (from another device)
  const handleInsert = useCallback(
    (record: DatabaseIdea) => {
      const currentCards = store.cards
      const idea = fromDatabaseIdea(record)

      // Only add if not already present (prevents duplicates from optimistic updates)
      if (!currentCards.find((card) => card.id === idea.id)) {
        log.debug('Remote insert', { id: idea.id })
        useIdeasStore.setState((state) => ({
          cards: [...state.cards, idea],
        }))
      }
    },
    [store.cards]
  )

  // Handle remote update (from another device)
  const handleUpdate = useCallback((record: DatabaseIdea) => {
    const idea = fromDatabaseIdea(record)
    log.debug('Remote update', { id: idea.id })

    useIdeasStore.setState((state) => ({
      cards: state.cards.map((card) => (card.id === idea.id ? idea : card)),
    }))
  }, [])

  // Handle remote delete (from another device)
  const handleDelete = useCallback((oldRecord: DatabaseIdea) => {
    log.debug('Remote delete', { id: oldRecord.id })

    useIdeasStore.setState((state) => ({
      cards: state.cards.filter((card) => card.id !== oldRecord.id),
      selectedCardId: state.selectedCardId === oldRecord.id ? null : state.selectedCardId,
    }))
  }, [])

  return useSupabaseRealtime<DatabaseIdea>({
    table: 'user_ideas',
    userId,
    onInsert: handleInsert,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
    debug: options?.debug,
    disabled: options?.disabled,
  })
}
