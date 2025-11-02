/**
 * useConsoleActivity Hook
 * Phase 14.6: Adaptive Console Hints System
 *
 * Monitors user behaviour in the Console:
 * - Tracks events: saveSignal, shareSignal, agentRun, tabChange, idleStart/stop
 * - Stores state in localStorage for 24 hours
 * - Calculates derived metrics for adaptive hints
 * - Debounced updates every 10s
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { logger } from '@total-audio/core-logger'

const log = logger.scope('ConsoleActivity')

// Event types
export type ConsoleEvent =
  | 'saveSignal'
  | 'shareSignal'
  | 'agentRun'
  | 'tabChange'
  | 'idleStart'
  | 'idleStop'

// Activity state stored in localStorage
interface ActivityState {
  lastSaveAt: number | null
  lastAgentRunAt: number | null
  totalAgentRuns: number
  agentRunsByType: Record<string, number>
  lastTabChange: number | null
  currentTab: string | null
  idleStartedAt: number | null
  sessionStartedAt: number
  version: number // For migration
}

// Derived metrics
export interface ActivityMetrics {
  timeSinceLastSave: number | null // milliseconds
  totalAgentRuns: number
  idleDuration: number | null // milliseconds
  tabUsageMap: Record<string, number>
  isIdle: boolean
}

// Event payload for agentRun
export interface AgentRunPayload {
  type: string
}

// Event payload for tabChange
export type TabChangePayload = string

const STORAGE_KEY = 'totalaud_console_activity'
const STORAGE_TTL = 24 * 60 * 60 * 1000 // 24 hours
const IDLE_THRESHOLD = 2 * 60 * 1000 // 2 minutes
const DEBOUNCE_INTERVAL = 10 * 1000 // 10 seconds

// Initial state
const initialState: ActivityState = {
  lastSaveAt: null,
  lastAgentRunAt: null,
  totalAgentRuns: 0,
  agentRunsByType: {},
  lastTabChange: null,
  currentTab: null,
  idleStartedAt: null,
  sessionStartedAt: Date.now(),
  version: 1,
}

export function useConsoleActivity() {
  const [state, setState] = useState<ActivityState>(initialState)
  const [metrics, setMetrics] = useState<ActivityMetrics>({
    timeSinceLastSave: null,
    totalAgentRuns: 0,
    idleDuration: null,
    tabUsageMap: {},
    isIdle: false,
  })

  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  const idleCheckIntervalRef = useRef<NodeJS.Timeout>()
  const lastActivityRef = useRef<number>(Date.now())

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as ActivityState & { expiresAt: number }

        // Check if expired
        if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
          setState(parsed)
          log.debug('Loaded activity state from localStorage', { parsed })
        } else {
          log.debug('Activity state expired, using initial state')
          localStorage.removeItem(STORAGE_KEY)
        }
      }
    } catch (error) {
      log.error('Failed to load activity state', error)
    }
  }, [])

  // Save state to localStorage (debounced)
  const persistState = useCallback((newState: ActivityState) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        const toStore = {
          ...newState,
          expiresAt: Date.now() + STORAGE_TTL,
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
        log.debug('Persisted activity state', { state: newState })
      } catch (error) {
        log.error('Failed to persist activity state', error)
      }
    }, DEBOUNCE_INTERVAL)
  }, [])

  // Calculate derived metrics
  useEffect(() => {
    const now = Date.now()

    const newMetrics: ActivityMetrics = {
      timeSinceLastSave: state.lastSaveAt ? now - state.lastSaveAt : null,
      totalAgentRuns: state.totalAgentRuns,
      idleDuration: state.idleStartedAt ? now - state.idleStartedAt : null,
      tabUsageMap: state.agentRunsByType,
      isIdle: state.idleStartedAt !== null,
    }

    setMetrics(newMetrics)
  }, [state])

  // Idle detection
  useEffect(() => {
    const checkIdle = () => {
      const now = Date.now()
      const timeSinceActivity = now - lastActivityRef.current

      if (timeSinceActivity > IDLE_THRESHOLD && !state.idleStartedAt) {
        // User went idle
        setState((prev) => {
          const updated = { ...prev, idleStartedAt: now }
          persistState(updated)
          return updated
        })
        log.debug('User went idle')
      } else if (timeSinceActivity <= IDLE_THRESHOLD && state.idleStartedAt) {
        // User came back
        setState((prev) => {
          const updated = { ...prev, idleStartedAt: null }
          persistState(updated)
          return updated
        })
        log.debug('User became active')
      }
    }

    // Check every 30 seconds
    idleCheckIntervalRef.current = setInterval(checkIdle, 30 * 1000)

    // Track user activity
    const handleActivity = () => {
      lastActivityRef.current = Date.now()
    }

    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('keydown', handleActivity)
    window.addEventListener('click', handleActivity)

    return () => {
      if (idleCheckIntervalRef.current) {
        clearInterval(idleCheckIntervalRef.current)
      }
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('click', handleActivity)
    }
  }, [state.idleStartedAt, persistState])

  // Event emitter
  const emit = useCallback(
    (event: ConsoleEvent, payload?: AgentRunPayload | TabChangePayload) => {
      const now = Date.now()
      lastActivityRef.current = now // Reset idle timer

      setState((prev) => {
        let updated = { ...prev }

        switch (event) {
          case 'saveSignal':
            updated.lastSaveAt = now
            log.debug('Event: saveSignal')
            break

          case 'shareSignal':
            log.debug('Event: shareSignal')
            break

          case 'agentRun':
            updated.lastAgentRunAt = now
            updated.totalAgentRuns += 1
            if (payload && typeof payload === 'object' && 'type' in payload) {
              const agentType = payload.type
              updated.agentRunsByType = {
                ...updated.agentRunsByType,
                [agentType]: (updated.agentRunsByType[agentType] || 0) + 1,
              }
              log.debug('Event: agentRun', { type: agentType })
            }
            break

          case 'tabChange':
            updated.lastTabChange = now
            if (payload && typeof payload === 'string') {
              updated.currentTab = payload
              log.debug('Event: tabChange', { tab: payload })
            }
            break

          case 'idleStart':
            updated.idleStartedAt = now
            log.debug('Event: idleStart')
            break

          case 'idleStop':
            updated.idleStartedAt = null
            log.debug('Event: idleStop')
            break
        }

        persistState(updated)
        return updated
      })
    },
    [persistState]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  return {
    metrics,
    emit,
  }
}
