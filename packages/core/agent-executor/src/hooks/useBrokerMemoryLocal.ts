/**
 * useBrokerMemoryLocal Hook
 *
 * Simplified localStorage-based memory for Broker conversations.
 * This is a temporary implementation until Supabase is fully configured.
 *
 * TODO: Replace with useBrokerMemory (Supabase-based) when auth is ready.
 */

import { useState, useCallback, useEffect } from 'react'
import type { BrokerMemoryData, BrokerSessionSnapshot } from './types'

export interface UseBrokerMemoryLocalReturn {
  /** Save a conversation field to localStorage */
  save: (key: keyof BrokerMemoryData, value: string) => void

  /** Recall a previously saved field */
  recall: (key: keyof BrokerMemoryData) => string | null

  /** Get all saved conversation data */
  getAll: () => BrokerMemoryData

  /** Mark broker onboarding as complete */
  complete: () => void

  /** Clear all broker memory */
  clear: () => void

  /** Save a session snapshot (for resuming later) */
  saveSessionSnapshot: (flowTemplate?: any) => void

  /** Get the last session snapshot */
  getLastSession: () => BrokerSessionSnapshot | null

  /** Check if user is returning */
  isReturningUser: () => boolean

  /** Local state of saved data */
  data: BrokerMemoryData
}

const STORAGE_KEY = 'broker_memory'
const SESSION_KEY = 'broker_last_session'

/**
 * Hook for managing Broker's conversation memory (localStorage version)
 *
 * @param sessionId - Unique session identifier for this conversation
 */
export function useBrokerMemoryLocal(sessionId: string): UseBrokerMemoryLocalReturn {
  const [data, setData] = useState<BrokerMemoryData>({})

  // Load initial data from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setData(parsed)
        console.log('[BrokerMemoryLocal] Loaded from localStorage:', parsed)
      }
    } catch (err) {
      console.error('[BrokerMemoryLocal] Error loading from localStorage:', err)
    }
  }, [])

  /**
   * Save a conversation field to localStorage
   */
  const save = useCallback(
    (key: keyof BrokerMemoryData, value: string) => {
      setData((prev: BrokerMemoryData) => {
        const updated = { ...prev, [key]: value }

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
          console.log(`[BrokerMemoryLocal] Saved ${key}:`, value)
        } catch (err) {
          console.error(`[BrokerMemoryLocal] Error saving ${key}:`, err)
        }

        return updated
      })
    },
    []
  )

  /**
   * Recall a previously saved field
   */
  const recall = useCallback((key: keyof BrokerMemoryData): string | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return null

      const parsed = JSON.parse(stored)
      const value = parsed[key] || null

      console.log(`[BrokerMemoryLocal] Recalled ${key}:`, value)
      return value
    } catch (err) {
      console.error(`[BrokerMemoryLocal] Error recalling ${key}:`, err)
      return null
    }
  }, [])

  /**
   * Get all saved conversation data
   */
  const getAll = useCallback((): BrokerMemoryData => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return {}

      const parsed = JSON.parse(stored)
      console.log('[BrokerMemoryLocal] Got all data:', parsed)
      return parsed
    } catch (err) {
      console.error('[BrokerMemoryLocal] Error getting all data:', err)
      return {}
    }
  }, [])

  /**
   * Mark broker onboarding as complete
   */
  const complete = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const parsed = stored ? JSON.parse(stored) : {}

      const updated = {
        ...parsed,
        onboarding_completed: true,
        completed_at: new Date().toISOString(),
        session_id: sessionId,
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      console.log('[BrokerMemoryLocal] Marked onboarding as complete')
    } catch (err) {
      console.error('[BrokerMemoryLocal] Error completing onboarding:', err)
    }
  }, [sessionId])

  /**
   * Clear all broker memory
   */
  const clear = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(SESSION_KEY)
      setData({})
      console.log('[BrokerMemoryLocal] Cleared all broker memory')
    } catch (err) {
      console.error('[BrokerMemoryLocal] Error clearing memory:', err)
    }
  }, [])

  /**
   * Save a session snapshot for resuming later
   */
  const saveSessionSnapshot = useCallback(
    (flowTemplate?: any) => {
      try {
        const currentData = getAll()

        const snapshot: BrokerSessionSnapshot = {
          session_id: sessionId,
          artist_name: currentData.artist_name,
          goal: currentData.goal,
          flow_template: flowTemplate,
          last_accessed: new Date().toISOString(),
          onboarding_completed: true,
        }

        localStorage.setItem(SESSION_KEY, JSON.stringify(snapshot))
        console.log('[BrokerMemoryLocal] Saved session snapshot:', snapshot)
      } catch (err) {
        console.error('[BrokerMemoryLocal] Error saving session snapshot:', err)
      }
    },
    [sessionId, getAll]
  )

  /**
   * Get the last session snapshot
   */
  const getLastSession = useCallback((): BrokerSessionSnapshot | null => {
    try {
      const stored = localStorage.getItem(SESSION_KEY)
      if (!stored) return null

      const snapshot = JSON.parse(stored)
      console.log('[BrokerMemoryLocal] Retrieved last session:', snapshot)
      return snapshot
    } catch (err) {
      console.error('[BrokerMemoryLocal] Error getting last session:', err)
      return null
    }
  }, [])

  /**
   * Check if user is returning
   */
  const isReturningUser = useCallback((): boolean => {
    const lastSession = getLastSession()
    return !!lastSession && !!lastSession.onboarding_completed
  }, [getLastSession])

  return {
    save,
    recall,
    getAll,
    complete,
    clear,
    saveSessionSnapshot,
    getLastSession,
    isReturningUser,
    data,
  }
}

/**
 * Design Principle: "Broker remembers so the user can stay in flow."
 *
 * This hook provides temporary localStorage-based memory until
 * Supabase authentication and persistence is fully configured.
 */
