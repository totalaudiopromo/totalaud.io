'use client'

import { useEffect } from 'react'

interface OSHotkeysProps {
  isQuickSwitchOpen: boolean
  onToggleQuickSwitch: () => void
  onCloseQuickSwitch: () => void
}

export function OSHotkeys({
  isQuickSwitchOpen,
  onToggleQuickSwitch,
  onCloseQuickSwitch,
}: OSHotkeysProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMetaCombo = (event.metaKey || event.ctrlKey) && event.shiftKey
      const key = event.key.toLowerCase()

      const target = event.target as HTMLElement | null
      const isTypingTarget =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.getAttribute('contenteditable') === 'true')

      if (isTypingTarget) return

      if (isMetaCombo && key === 'o') {
        event.preventDefault()
        onToggleQuickSwitch()
        return
      }

      if (event.key === 'Escape' && isQuickSwitchOpen) {
        onCloseQuickSwitch()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isQuickSwitchOpen, onCloseQuickSwitch, onToggleQuickSwitch])

  return null
}


