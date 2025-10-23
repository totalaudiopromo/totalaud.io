'use client'

import { useState, useCallback, useEffect } from 'react'
import { useUISound } from './useUISound'

export type OSTheme = 'ascii' | 'xp' | 'aqua' | 'daw' | 'analogue'

interface OSOption {
  id: OSTheme
  label: string
}

const OS_OPTIONS: OSOption[] = [
  { id: 'ascii', label: 'ascii terminal' },
  { id: 'xp', label: 'xp workstation' },
  { id: 'aqua', label: 'aqua interface' },
  { id: 'daw', label: 'daw console' },
  { id: 'analogue', label: 'analogue studio' },
]

interface UseOSSelectionReturn {
  options: OSOption[]
  activeIndex: number
  selectedTheme: OSTheme | null
  isConfirmed: boolean
  handleKeyPress: (e: KeyboardEvent) => void
}

/**
 * Handles arrow-key navigation and theme selection.
 * Plays click sound on navigation, persists theme on confirm.
 */
export function useOSSelection(onConfirm: (theme: OSTheme) => void): UseOSSelectionReturn {
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedTheme, setSelectedTheme] = useState<OSTheme | null>(null)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const sound = useUISound()

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (isConfirmed) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((prev) => {
          const next = prev + 1 >= OS_OPTIONS.length ? 0 : prev + 1
          // Play click sound
          sound.click()
          return next
        })
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((prev) => {
          const next = prev - 1 < 0 ? OS_OPTIONS.length - 1 : prev - 1
          // Play click sound
          sound.click()
          return next
        })
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const selected = OS_OPTIONS[activeIndex].id
        setSelectedTheme(selected)
        setIsConfirmed(true)

        // Save theme to localStorage for FlowStudio
        if (typeof window !== 'undefined') {
          localStorage.setItem('selected_theme', selected)
        }

        // Play success sound
        sound.success()

        // Trigger callback after brief delay
        setTimeout(() => {
          onConfirm(selected)
        }, 400)
      }
    },
    [activeIndex, isConfirmed, sound, onConfirm]
  )

  return {
    options: OS_OPTIONS,
    activeIndex,
    selectedTheme,
    isConfirmed,
    handleKeyPress,
  }
}
