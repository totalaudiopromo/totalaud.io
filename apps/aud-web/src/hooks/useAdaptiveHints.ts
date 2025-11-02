/**
 * useAdaptiveHints Hook
 * Phase 14.6: Adaptive Console Hints System
 *
 * Consumes useConsoleActivity and generates adaptive hints based on user behaviour.
 *
 * Logic:
 * - No save in > 5 min → "try saving your signal 💾"
 * - 3+ agent runs without insight → "analyse your insights next"
 * - Idle > 2 min → "ready to get back into flow?"
 * - Rotates hints every 90s, one at a time
 * - Respects prefers-reduced-motion and mute preferences
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useReducedMotion } from './useReducedMotion'
import type { ActivityMetrics } from './useConsoleActivity'
import { logger } from '@total-audio/core-logger'

const log = logger.scope('AdaptiveHints')

export interface Hint {
  id: string
  message: string
  emoji?: string
  priority: number // Higher = more urgent
}

const HINT_ROTATION_INTERVAL = 90 * 1000 // 90 seconds
const NO_SAVE_THRESHOLD = 5 * 60 * 1000 // 5 minutes
const IDLE_THRESHOLD = 2 * 60 * 1000 // 2 minutes
const AGENT_RUN_THRESHOLD = 3 // 3 agent runs

// Hint templates
const HINTS = {
  NO_SAVE: {
    id: 'no-save',
    message: 'try saving your signal 💾',
    emoji: '💾',
    priority: 3,
  },
  MANY_AGENTS: {
    id: 'many-agents',
    message: 'analyse your insights next',
    emoji: '🔍',
    priority: 2,
  },
  IDLE_RETURN: {
    id: 'idle-return',
    message: 'ready to get back into flow?',
    emoji: '✨',
    priority: 4,
  },
  FIRST_SAVE: {
    id: 'first-save',
    message: 'save your work to resume later',
    emoji: '💾',
    priority: 1,
  },
} as const

export interface UseAdaptiveHintsOptions {
  enabled?: boolean
  muted?: boolean
}

export function useAdaptiveHints(metrics: ActivityMetrics, options: UseAdaptiveHintsOptions = {}) {
  const { enabled = true, muted = false } = options

  const [currentHint, setCurrentHint] = useState<Hint | null>(null)
  const [availableHints, setAvailableHints] = useState<Hint[]>([])
  const prefersReducedMotion = useReducedMotion()

  // Check if hints are enabled in localStorage
  const [hintsEnabled, setHintsEnabled] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('flowHintsEnabled')
      if (stored !== null) {
        setHintsEnabled(stored === 'true')
      }
    } catch (error) {
      log.error('Failed to load hints preference', error)
    }
  }, [])

  // Toggle hints
  const toggleHints = useCallback(() => {
    setHintsEnabled((prev) => {
      const newValue = !prev
      try {
        localStorage.setItem('flowHintsEnabled', String(newValue))
        log.debug('Toggled hints', { enabled: newValue })
      } catch (error) {
        log.error('Failed to save hints preference', error)
      }
      return newValue
    })
  }, [])

  // Generate hints based on metrics
  useEffect(() => {
    if (!enabled || !hintsEnabled) {
      setAvailableHints([])
      return
    }

    const hints: Hint[] = []

    // Check for idle return
    if (metrics.idleDuration && metrics.idleDuration > IDLE_THRESHOLD) {
      hints.push(HINTS.IDLE_RETURN)
    }

    // Check for no save
    if (metrics.timeSinceLastSave === null || metrics.timeSinceLastSave > NO_SAVE_THRESHOLD) {
      if (metrics.timeSinceLastSave === null) {
        hints.push(HINTS.FIRST_SAVE)
      } else {
        hints.push(HINTS.NO_SAVE)
      }
    }

    // Check for many agent runs
    if (metrics.totalAgentRuns >= AGENT_RUN_THRESHOLD) {
      hints.push(HINTS.MANY_AGENTS)
    }

    // Sort by priority (highest first)
    hints.sort((a, b) => b.priority - a.priority)

    setAvailableHints(hints)
    log.debug('Available hints updated', { count: hints.length, hints })
  }, [metrics, enabled, hintsEnabled])

  // Rotate hints every 90 seconds
  useEffect(() => {
    if (availableHints.length === 0) {
      setCurrentHint(null)
      return
    }

    // Show first hint immediately
    setCurrentHint(availableHints[0])

    // Rotate through hints
    let hintIndex = 0
    const interval = setInterval(() => {
      hintIndex = (hintIndex + 1) % availableHints.length
      setCurrentHint(availableHints[hintIndex])
      log.debug('Rotated hint', { hint: availableHints[hintIndex] })
    }, HINT_ROTATION_INTERVAL)

    return () => clearInterval(interval)
  }, [availableHints])

  // Respect mute and reduced motion
  const shouldShowHint = enabled && hintsEnabled && !muted && currentHint !== null

  return {
    currentHint: shouldShowHint ? currentHint : null,
    availableHints,
    hintsEnabled,
    toggleHints,
    prefersReducedMotion,
  }
}
