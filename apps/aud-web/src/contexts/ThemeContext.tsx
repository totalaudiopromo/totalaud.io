"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { OSTheme, THEME_CONFIGS, ThemeConfig } from "@/types/themes"

interface ThemeContextValue {
  theme: OSTheme
  themeConfig: ThemeConfig
  setTheme: (theme: OSTheme) => void
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<OSTheme>("ascii")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load theme from localStorage
    const saved = localStorage.getItem("ui_mode") as OSTheme
    if (saved && saved in THEME_CONFIGS) {
      setThemeState(saved)
      applyTheme(saved)
    }
    setIsLoading(false)
  }, [])

  const applyTheme = (newTheme: OSTheme) => {
    const config = THEME_CONFIGS[newTheme]
    
    // Apply to document body
    document.body.setAttribute("data-os-theme", newTheme)
    
    // Apply CSS variables
    const root = document.documentElement
    root.style.setProperty("--theme-primary", config.colors.primary)
    root.style.setProperty("--theme-secondary", config.colors.secondary)
    root.style.setProperty("--theme-accent", config.colors.accent)
    root.style.setProperty("--theme-background", config.colors.background)
    root.style.setProperty("--theme-text", config.colors.text)
    root.style.setProperty("--theme-border", config.colors.border)
    root.style.setProperty("--theme-font", config.fontFamily)
  }

  const setTheme = (newTheme: OSTheme) => {
    setThemeState(newTheme)
    localStorage.setItem("ui_mode", newTheme)
    applyTheme(newTheme)
    
    // TODO: Sync to Supabase when auth is ready
    // await updateUserProfile({ ui_mode: newTheme })
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeConfig: THEME_CONFIGS[theme],
        setTheme,
        isLoading
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

