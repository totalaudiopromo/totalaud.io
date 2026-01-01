/**
 * Ideas Keyboard Shortcuts Hook
 *
 * Phase 2: DESSA Speed Improvement - Keyboard Shortcuts for Ideas Mode
 *
 * Provides keyboard shortcuts for common Ideas Mode actions:
 * - Cmd/Ctrl + N: Create new idea
 * - Cmd/Ctrl + E: Export ideas (future enhancement)
 * - Escape: Deselect current card
 *
 * This hook works alongside useIdeasStore to provide keyboard access.
 */

'use client'

import { useEffect, useCallback } from 'react'
import { useIdeasStore } from '@/stores/useIdeasStore'
import { logger } from '@/lib/logger'

const log = logger.scope('Ideas Keyboard')

/**
 * Hook to set up keyboard shortcuts for Ideas Mode
 */
export function useIdeasKeyboard() {
  const addCard = useIdeasStore((state) => state.addCard)
  const selectCard = useIdeasStore((state) => state.selectCard)
  const selectedCardId = useIdeasStore((state) => state.selectedCardId)
  const filter = useIdeasStore((state) => state.filter)

  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      // Check if user is typing in an input/textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      // Check for Cmd (Mac) or Ctrl (Windows/Linux)
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifierKey = isMac ? e.metaKey : e.ctrlKey

      // Cmd/Ctrl + N: Create new idea
      if (modifierKey && e.key === 'n') {
        e.preventDefault()
        const tag = filter ?? 'content' // Use current filter or default to 'content'
        await addCard('', tag)
        log.debug('New idea created via keyboard shortcut', { tag })
      }

      // Escape: Deselect current card
      if (e.key === 'Escape' && selectedCardId) {
        e.preventDefault()
        selectCard(null)
        log.debug('Card deselected via keyboard shortcut')
      }
    },
    [addCard, selectCard, selectedCardId, filter]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
