/**
 * ThemeResolver Component
 *
 * Manages theme selection and configuration based on user preferences.
 * Provides theme context to all child components.
 */

'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { OSTheme, ThemeConfig, ThemeContextValue } from './types'
import { asciiTheme } from './ascii.theme'
import { xpTheme } from './xp.theme'
import { aquaTheme } from './aqua.theme'
import { dawTheme } from './daw.theme'
import { analogueTheme } from './analogue.theme'
import { useUserPrefs } from '@aud-web/hooks/useUserPrefs'

// Theme registry - all 5 themes fully implemented
const THEME_REGISTRY: Record<OSTheme, ThemeConfig> = {
  ascii: asciiTheme,
  xp: xpTheme,
  aqua: aquaTheme,
  daw: dawTheme,
  analogue: analogueTheme,
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

interface ThemeResolverProps {
  children: ReactNode
  defaultTheme?: OSTheme
}

export function ThemeResolver({ children, defaultTheme = 'ascii' }: ThemeResolverProps) {
  const { prefs, updatePrefs, loading: prefsLoading } = useUserPrefs()
  const [currentTheme, setCurrentTheme] = useState<OSTheme>(defaultTheme)
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(THEME_REGISTRY[defaultTheme])

  // Sync with user preferences
  useEffect(() => {
    if (prefs?.preferred_theme) {
      const theme = prefs.preferred_theme as OSTheme
      if (THEME_REGISTRY[theme]) {
        setCurrentTheme(theme)
        setThemeConfig(THEME_REGISTRY[theme])
      }
    }
  }, [prefs?.preferred_theme])

  // Update theme and persist to preferences
  const setTheme = async (theme: OSTheme) => {
    if (!THEME_REGISTRY[theme]) {
      console.warn(`[ThemeResolver] Theme "${theme}" not found in registry`)
      return
    }

    console.log(`[ThemeResolver] Switching to theme: ${theme}`)
    setCurrentTheme(theme)
    setThemeConfig(THEME_REGISTRY[theme])

    // Persist to user preferences
    await updatePrefs({ preferred_theme: theme })
  }

  // Apply theme CSS variables to document
  useEffect(() => {
    const root = document.documentElement

    // Apply color variables
    root.style.setProperty('--theme-bg', themeConfig.colors.bg)
    root.style.setProperty('--theme-bg-secondary', themeConfig.colors.bgSecondary)
    root.style.setProperty('--theme-border', themeConfig.colors.border)
    root.style.setProperty('--theme-accent', themeConfig.colors.accent)
    root.style.setProperty('--theme-text', themeConfig.colors.text)
    root.style.setProperty('--theme-text-secondary', themeConfig.colors.textSecondary)
    root.style.setProperty('--theme-success', themeConfig.colors.success)
    root.style.setProperty('--theme-error', themeConfig.colors.error)
    root.style.setProperty('--theme-warning', themeConfig.colors.warning)
    root.style.setProperty('--theme-info', themeConfig.colors.info)

    // Apply motion variables
    root.style.setProperty('--theme-duration-fast', `${themeConfig.motion.duration.fast}ms`)
    root.style.setProperty('--theme-duration-medium', `${themeConfig.motion.duration.medium}ms`)
    root.style.setProperty('--theme-duration-slow', `${themeConfig.motion.duration.slow}ms`)
    root.style.setProperty('--theme-easing', themeConfig.motion.easing)

    // Apply typography variables
    root.style.setProperty('--theme-font-family', themeConfig.typography.fontFamily)
    root.style.setProperty('--theme-font-family-mono', themeConfig.typography.fontFamilyMono)
    root.style.setProperty('--theme-letter-spacing', themeConfig.typography.letterSpacing)

    // Apply text transform
    root.style.setProperty('--theme-text-transform', themeConfig.typography.textTransform)

    // Apply effects
    root.style.setProperty('--theme-blur', themeConfig.effects.blur)
    root.style.setProperty('--theme-opacity-dim', themeConfig.effects.opacity.dim.toString())
    root.style.setProperty('--theme-opacity-overlay', themeConfig.effects.opacity.overlay.toString())
    root.style.setProperty('--theme-opacity-disabled', themeConfig.effects.opacity.disabled.toString())

    console.log(`[ThemeResolver] Applied CSS variables for theme: ${themeConfig.name}`)
  }, [themeConfig])

  const contextValue: ThemeContextValue = {
    currentTheme,
    themeConfig,
    setTheme,
    isLoading: prefsLoading,
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook to access theme context
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within ThemeResolver')
  }

  return context
}
