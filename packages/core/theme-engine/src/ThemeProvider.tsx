/**
 * Theme Provider Component
 * React context provider for theme management
 */

'use client'

import React, { createContext, useContext, useEffect } from 'react'
import type { ThemeContextValue } from './types'
import { useThemeManager } from './useThemeManager'

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeManager = useThemeManager()

  // Keyboard shortcut: Ctrl/Cmd + Shift + T to cycle themes
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault()
        themeManager.cycleTheme()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [themeManager])

  if (!themeManager.isLoaded) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <ThemeContext.Provider value={themeManager}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

