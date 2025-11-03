/**
 * Console Tabs Hook
 * Phase 15.3: Connected Console & Orchestration
 *
 * Purpose:
 * - Manage console tab state (plan / do / track / learn)
 * - Persist tab selection to localStorage
 * - Emit telemetry on tab changes
 * - Keyboard navigation support
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import type { ConsoleTab } from '@/types/console'
import { useFlowStateTelemetry } from './useFlowStateTelemetry'
import { logger } from '@/lib/logger'

const log = logger.scope('useConsoleTabs')

const TABS: readonly ConsoleTab[] = ['plan', 'do', 'track', 'learn'] as const

interface UseConsoleTabsOptions {
  campaignId?: string
  defaultTab?: ConsoleTab
  persist?: boolean
}

interface UseConsoleTabsReturn {
  tab: ConsoleTab
  setTab: (tab: ConsoleTab) => void
  nextTab: () => void
  prevTab: () => void
  tabs: readonly ConsoleTab[]
  isTab: (checkTab: ConsoleTab) => boolean
}

/**
 * Get localStorage key for tab persistence
 */
function getStorageKey(campaignId?: string): string {
  if (campaignId) {
    return `console:tab:${campaignId}`
  }
  return 'console:tab:global'
}

/**
 * Load persisted tab from localStorage
 */
function loadPersistedTab(campaignId?: string, defaultTab: ConsoleTab = 'plan'): ConsoleTab {
  if (typeof window === 'undefined') return defaultTab

  try {
    const key = getStorageKey(campaignId)
    const stored = localStorage.getItem(key)
    if (stored && TABS.includes(stored as ConsoleTab)) {
      return stored as ConsoleTab
    }
  } catch (error) {
    log.warn('Failed to load persisted tab', error)
  }

  return defaultTab
}

/**
 * Save tab to localStorage
 */
function persistTab(tab: ConsoleTab, campaignId?: string): void {
  if (typeof window === 'undefined') return

  try {
    const key = getStorageKey(campaignId)
    localStorage.setItem(key, tab)
  } catch (error) {
    log.warn('Failed to persist tab', error)
  }
}

/**
 * Console tabs hook with persistence and telemetry
 */
export function useConsoleTabs(options: UseConsoleTabsOptions = {}): UseConsoleTabsReturn {
  const { campaignId, defaultTab = 'plan', persist = true } = options
  const { trackEvent } = useFlowStateTelemetry()

  // Initialize from persisted value or default
  const [tab, setTabState] = useState<ConsoleTab>(() =>
    persist ? loadPersistedTab(campaignId, defaultTab) : defaultTab
  )

  /**
   * Set tab with persistence and telemetry
   */
  const setTab = useCallback(
    (newTab: ConsoleTab) => {
      if (newTab === tab) return

      const previousTab = tab

      log.info('Tab changed', { from: previousTab, to: newTab, campaignId })

      // Update state
      setTabState(newTab)

      // Persist if enabled
      if (persist) {
        persistTab(newTab, campaignId)
      }

      // Track telemetry
      trackEvent('save', {
        metadata: {
          action: 'console_tab_change',
          from: previousTab,
          to: newTab,
          campaignId: campaignId || 'global',
        },
      })
    },
    [tab, campaignId, persist, trackEvent]
  )

  /**
   * Navigate to next tab (wraps around)
   */
  const nextTab = useCallback(() => {
    const currentIndex = TABS.indexOf(tab)
    const nextIndex = (currentIndex + 1) % TABS.length
    setTab(TABS[nextIndex])
  }, [tab, setTab])

  /**
   * Navigate to previous tab (wraps around)
   */
  const prevTab = useCallback(() => {
    const currentIndex = TABS.indexOf(tab)
    const prevIndex = currentIndex === 0 ? TABS.length - 1 : currentIndex - 1
    setTab(TABS[prevIndex])
  }, [tab, setTab])

  /**
   * Check if a tab is currently active
   */
  const isTab = useCallback(
    (checkTab: ConsoleTab) => {
      return tab === checkTab
    },
    [tab]
  )

  /**
   * Sync tab state when campaignId changes
   */
  useEffect(() => {
    if (persist && campaignId) {
      const persistedTab = loadPersistedTab(campaignId, defaultTab)
      if (persistedTab !== tab) {
        setTabState(persistedTab)
      }
    }
  }, [campaignId]) // Intentionally omit tab/defaultTab/persist to avoid loops

  return {
    tab,
    setTab,
    nextTab,
    prevTab,
    tabs: TABS,
    isTab,
  }
}

/**
 * Keyboard shortcut hook for tab navigation
 * ⌘⌥→ (next tab) and ⌘⌥← (prev tab)
 */
export function useConsoleTabKeyboard(
  nextTab: () => void,
  prevTab: () => void,
  enabled = true
): void {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle if Cmd+Alt (or Ctrl+Alt on Windows)
      const isMod = event.metaKey || event.ctrlKey
      if (!isMod || !event.altKey) return

      // Ignore if inside input/textarea
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        nextTab()
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        prevTab()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextTab, prevTab, enabled])
}
