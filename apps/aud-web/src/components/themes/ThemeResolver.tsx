/**
 * ThemeResolver Component
 *
 * Manages theme selection and configuration based on user preferences.
 * Provides theme context to all child components.
 * Integrates palettes, motion, sound, tone, and adaptive logic.
 */

'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { OSTheme, ThemeConfig, ThemeContextValue } from './types'
import { operatorTheme } from './operator.theme'
import { guideTheme } from './guide.theme'
import { mapTheme } from './map.theme'
import { timelineTheme } from './timeline.theme'
import { tapeTheme } from './tape.theme'
import { useUserPrefs } from '@aud-web/hooks/useUserPrefs'
import { applyPalette } from './palettes'
import { getMotionProfile } from './motionProfiles'
import { playSound } from './soundPalettes'
import { getTone } from './toneSystem'
import {
  getAdaptiveAdjustments,
  getTimeOfDay,
  ActivityMonitor,
  type AdaptiveContext,
} from './adaptiveLogic'

// Theme registry - all 5 posture-based workflows fully implemented
const THEME_REGISTRY: Record<OSTheme, ThemeConfig> = {
  operator: operatorTheme,
  guide: guideTheme,
  map: mapTheme,
  timeline: timelineTheme,
  tape: tapeTheme,
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

interface ThemeResolverProps {
  children: ReactNode
  defaultTheme?: OSTheme
}

export function ThemeResolver({ children, defaultTheme = 'operator' }: ThemeResolverProps) {
  const { prefs, updatePrefs, loading: prefsLoading } = useUserPrefs()
  const [currentTheme, setCurrentTheme] = useState<OSTheme>(defaultTheme)
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(THEME_REGISTRY[defaultTheme])
  const [activityMonitor] = useState(() => new ActivityMonitor())
  const [adaptiveContext, setAdaptiveContext] = useState<AdaptiveContext>({
    activityIntensity: 'low',
    timeOfDay: getTimeOfDay(),
    campaignProgress: 0,
  })

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
  const setTheme = async (theme: OSTheme, playTransitionSound: boolean = true) => {
    if (!THEME_REGISTRY[theme]) {
      console.warn(`[ThemeResolver] Theme "${theme}" not found in registry`)
      return
    }

    console.log(`[ThemeResolver] Switching to theme: ${theme}`)

    // Play transition sound if enabled
    if (playTransitionSound && !prefs?.mute_sounds) {
      playSound(currentTheme, 'interact', false)
    }

    setCurrentTheme(theme)
    setThemeConfig(THEME_REGISTRY[theme])

    // Apply new palette
    applyPalette(theme)

    // Persist to user preferences
    await updatePrefs({ preferred_theme: theme })
  }

  // Monitor time of day changes
  useEffect(() => {
    const interval = setInterval(
      () => {
        const newTimeOfDay = getTimeOfDay()
        if (newTimeOfDay !== adaptiveContext.timeOfDay) {
          setAdaptiveContext((prev) => ({
            ...prev,
            timeOfDay: newTimeOfDay,
          }))
        }
      },
      60000 // Check every minute
    )

    return () => clearInterval(interval)
  }, [adaptiveContext.timeOfDay])

  // Update activity intensity from monitor
  useEffect(() => {
    const interval = setInterval(() => {
      const intensity = activityMonitor.getIntensity()
      if (intensity !== adaptiveContext.activityIntensity) {
        setAdaptiveContext((prev) => ({
          ...prev,
          activityIntensity: intensity,
        }))
      }
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [activityMonitor, adaptiveContext.activityIntensity])

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
    root.style.setProperty(
      '--theme-opacity-overlay',
      themeConfig.effects.opacity.overlay.toString()
    )
    root.style.setProperty(
      '--theme-opacity-disabled',
      themeConfig.effects.opacity.disabled.toString()
    )

    console.log(`[ThemeResolver] Applied CSS variables for theme: ${themeConfig.name}`)
  }, [themeConfig])

  const contextValue: ThemeContextValue = {
    currentTheme,
    themeConfig,
    setTheme,
    isLoading: prefsLoading,
    // Expose adaptive utilities
    adaptiveContext,
    activityMonitor,
    getAdaptiveAdjustments: () => getAdaptiveAdjustments(adaptiveContext),
    // Helper functions
    getTone: (messageType: string) => getTone(currentTheme, messageType as any),
    playSound: (soundType: string) =>
      playSound(currentTheme, soundType as any, prefs?.mute_sounds === true),
    getMotionProfile: () => getMotionProfile(currentTheme),
  }

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
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
