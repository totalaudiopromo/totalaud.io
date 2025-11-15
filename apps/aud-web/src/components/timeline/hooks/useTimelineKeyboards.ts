/**
 * Timeline Keyboard Shortcuts Hook
 * Handles keyboard shortcuts for timeline operations
 */

import { useEffect } from 'react'

interface TimelineKeyboardOptions {
  onSpacePress?: () => void
  onEscPress?: () => void
  onDeletePress?: () => void
}

export function useTimelineKeyboards({
  onSpacePress,
  onEscPress,
  onDeletePress,
}: TimelineKeyboardOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          onSpacePress?.()
          break

        case 'Escape':
          e.preventDefault()
          onEscPress?.()
          break

        case 'Delete':
        case 'Backspace':
          e.preventDefault()
          onDeletePress?.()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onSpacePress, onEscPress, onDeletePress])
}
