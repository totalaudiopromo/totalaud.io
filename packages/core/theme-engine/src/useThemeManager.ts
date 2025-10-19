/**
 * Theme Manager Hook
 * React hook for managing theme state and persistence
 */

import { useState, useEffect, useCallback } from 'react'
import type { ThemeId, ThemeManifest } from './types'
import { THEMES, THEME_IDS, getTheme } from './themeRegistry'
import { preloadTextures } from './textures'

const STORAGE_KEY = 'totalaud_theme'
const DEFAULT_THEME: ThemeId = 'ascii'

export function useThemeManager() {
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>(DEFAULT_THEME)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Load theme from storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeId | null
    if (stored && THEME_IDS.includes(stored)) {
      setCurrentThemeId(stored)
    }
    setIsLoaded(true)
  }, [])

  // Get current theme manifest
  const theme = getTheme(currentThemeId)

  // Change theme with transition
  const setTheme = useCallback(async (id: ThemeId) => {
    if (!THEME_IDS.includes(id)) {
      console.warn(`Invalid theme ID: ${id}`)
      return
    }

    setIsTransitioning(true)

    // Preload textures for new theme
    const newTheme = getTheme(id)
    await preloadTextures([
      newTheme.textures.overlay,
      newTheme.textures.pattern
    ])

    // Apply theme
    setCurrentThemeId(id)
    localStorage.setItem(STORAGE_KEY, id)

    // Apply CSS variables
    applyThemeVariables(newTheme)

    // Transition complete
    setTimeout(() => {
      setIsTransitioning(false)
    }, 300)
  }, [])

  // Cycle to next theme
  const cycleTheme = useCallback(() => {
    const currentIndex = THEME_IDS.indexOf(currentThemeId)
    const nextIndex = (currentIndex + 1) % THEME_IDS.length
    setTheme(THEME_IDS[nextIndex])
  }, [currentThemeId, setTheme])

  return {
    currentTheme: currentThemeId,
    theme,
    setTheme,
    cycleTheme,
    isLoaded,
    isTransitioning,
    allThemes: THEMES
  }
}

/**
 * Apply theme as CSS variables to document root
 */
function applyThemeVariables(theme: ThemeManifest) {
  const root = document.documentElement

  // Colors
  root.style.setProperty('--theme-bg', theme.palette.background)
  root.style.setProperty('--theme-fg', theme.palette.foreground)
  root.style.setProperty('--theme-accent', theme.palette.accent)
  root.style.setProperty('--theme-secondary', theme.palette.secondary)
  root.style.setProperty('--theme-border', theme.palette.border)
  root.style.setProperty('--theme-success', theme.palette.success)
  root.style.setProperty('--theme-warning', theme.palette.warning)
  root.style.setProperty('--theme-error', theme.palette.error)

  // Typography
  root.style.setProperty('--theme-font-family', theme.typography.fontFamily)
  root.style.setProperty('--theme-mono-family', theme.typography.monoFamily)
  root.style.setProperty('--theme-heading-weight', theme.typography.headingWeight.toString())
  root.style.setProperty('--theme-body-weight', theme.typography.bodyWeight.toString())
  root.style.setProperty('--theme-line-height', theme.typography.lineHeight.toString())

  // Motion
  root.style.setProperty('--theme-duration', `${theme.motion.duration}ms`)
  root.style.setProperty('--theme-easing', theme.motion.easing)

  // Apply data attribute for CSS selectors
  root.setAttribute('data-theme', theme.id)
}

