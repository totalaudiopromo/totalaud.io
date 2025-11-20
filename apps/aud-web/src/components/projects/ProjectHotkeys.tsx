'use client'

import { useEffect } from 'react'

interface ProjectHotkeysProps {
  isProjectSwitchOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export function ProjectHotkeys({
  isProjectSwitchOpen,
  onOpen,
  onClose,
}: ProjectHotkeysProps) {
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

      if (isMetaCombo && key === 'p') {
        event.preventDefault()
        onOpen()
        return
      }

      if (event.key === 'Escape' && isProjectSwitchOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isProjectSwitchOpen, onClose, onOpen])

  return null
}


