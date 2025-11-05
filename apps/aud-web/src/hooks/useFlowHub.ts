/**
 * useFlowHub Hook
 * Phase 15.9: Unified Campaign Analytics + AI Briefs
 *
 * Purpose:
 * - Manages Flow Hub dashboard visibility state
 * - Handles ⌘⇧H keyboard shortcut
 * - Tracks telemetry for hub interactions
 *
 * Usage:
 * ```tsx
 * const { isFlowHubOpen, openFlowHub, closeFlowHub } = useFlowHub()
 * ```
 */

import { useState, useEffect, useCallback } from 'react'
import { useFlowStateTelemetry } from './useFlowStateTelemetry'
import { logger } from '@/lib/logger'

const log = logger.scope('useFlowHub')

export function useFlowHub() {
  const [isFlowHubOpen, setIsFlowHubOpen] = useState(false)
  const { trackEvent } = useFlowStateTelemetry()

  /**
   * Open Flow Hub
   */
  const openFlowHub = useCallback(() => {
    setIsFlowHubOpen(true)
    trackEvent('flow_hub_opened', {})
    log.debug('Flow Hub opened')
  }, [trackEvent])

  /**
   * Close Flow Hub
   */
  const closeFlowHub = useCallback(() => {
    setIsFlowHubOpen(false)
    log.debug('Flow Hub closed')
  }, [])

  /**
   * Toggle Flow Hub
   */
  const toggleFlowHub = useCallback(() => {
    if (isFlowHubOpen) {
      closeFlowHub()
    } else {
      openFlowHub()
    }
  }, [isFlowHubOpen, openFlowHub, closeFlowHub])

  /**
   * Handle ⌘⇧H keyboard shortcut
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘⇧H (Command+Shift+H on Mac, Ctrl+Shift+H on Windows)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'H') {
        e.preventDefault()
        toggleFlowHub()
        log.debug('Flow Hub toggled via keyboard shortcut', { isOpen: !isFlowHubOpen })
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFlowHubOpen, toggleFlowHub])

  return {
    isFlowHubOpen,
    openFlowHub,
    closeFlowHub,
    toggleFlowHub,
  }
}
