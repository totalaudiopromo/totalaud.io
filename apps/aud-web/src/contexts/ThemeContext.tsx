/**
 * Theme Context - Wrapper around Theme Engine
 * Provides backward compatibility with old THEME_CONFIGS format
 * while using the new @total-audio/core-theme-engine under the hood
 */

'use client'

import {
  ThemeProvider as EngineThemeProvider,
  useTheme as useEngineTheme,
} from '@total-audio/core-theme-engine'
import type { ThemeId, ThemeManifest } from '@total-audio/core-theme-engine'
import { createContext, useContext, ReactNode } from 'react'
import type { OSTheme, ThemeConfig } from '@aud-web/types/themes'
import { THEME_CONFIGS } from '@aud-web/types/themes'

interface LegacyThemeContextValue {
  theme: OSTheme
  themeConfig: ThemeConfig
  setTheme: (theme: OSTheme) => void
  isLoading: boolean
}

const LegacyThemeContext = createContext<LegacyThemeContextValue | undefined>(undefined)

/**
 * Convert new ThemeManifest to old ThemeConfig format
 * for backward compatibility
 */
function manifestToLegacyConfig(manifest: ThemeManifest): ThemeConfig {
  return {
    id: manifest.id as OSTheme,
    name: manifest.name,
    displayName: manifest.name.toUpperCase(),
    description: manifest.description,
    tagline: manifest.mood,
    colors: {
      primary: manifest.palette.accent,
      secondary: manifest.palette.secondary,
      accent: manifest.palette.accent,
      background: manifest.palette.background,
      text: manifest.palette.foreground,
      border: manifest.palette.border,
    },
    fontFamily: manifest.typography.fontFamily,
    textures: {
      overlay: manifest.textures.overlay || '',
      pattern: manifest.textures.pattern || '',
    },
    effects: manifest.effects,
    sounds: {
      boot: String(manifest.sounds.boot.frequency || 440),
      click: String(manifest.sounds.click.frequency || 1200),
      ambient: manifest.sounds.ambient?.noiseType || 'pink',
    },
  }
}

function LegacyThemeWrapper({ children }: { children: ReactNode }) {
  const engineTheme = useEngineTheme()

  // Map engine theme to legacy format
  const legacyValue: LegacyThemeContextValue = {
    theme: engineTheme.currentTheme as OSTheme,
    themeConfig: manifestToLegacyConfig(engineTheme.theme),
    setTheme: (theme: OSTheme) => engineTheme.setTheme(theme as ThemeId),
    isLoading: !engineTheme.isLoaded,
  }

  return <LegacyThemeContext.Provider value={legacyValue}>{children}</LegacyThemeContext.Provider>
}

/**
 * Main ThemeProvider - uses new Theme Engine
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <EngineThemeProvider>
      <LegacyThemeWrapper>{children}</LegacyThemeWrapper>
    </EngineThemeProvider>
  )
}

/**
 * Legacy hook - maintains old API for backward compatibility
 * New code should use `import { useTheme } from '@total-audio/core-theme-engine'`
 */
export function useTheme() {
  const context = useContext(LegacyThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
