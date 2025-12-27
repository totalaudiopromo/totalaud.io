/**
 * Offline Detection Hook
 *
 * Detects when the user is offline and provides state for UI feedback.
 * Works with Ideas Mode to show "Offline" banner when disconnected.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'

interface OfflineState {
  isOnline: boolean
  wasOffline: boolean
  lastOnlineAt: string | null
}

/**
 * Hook to detect online/offline status
 */
export function useOfflineDetection() {
  const [state, setState] = useState<OfflineState>({
    isOnline: true,
    wasOffline: false,
    lastOnlineAt: null,
  })

  useEffect(() => {
    // Check initial status
    const initialOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
    setState((prev) => ({
      ...prev,
      isOnline: initialOnline,
      lastOnlineAt: initialOnline ? new Date().toISOString() : null,
    }))

    const handleOnline = () => {
      setState((prev) => ({
        isOnline: true,
        wasOffline: true,
        lastOnlineAt: new Date().toISOString(),
      }))
    }

    const handleOffline = () => {
      setState((prev) => ({
        ...prev,
        isOnline: false,
      }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const clearWasOffline = useCallback(() => {
    setState((prev) => ({ ...prev, wasOffline: false }))
  }, [])

  return {
    ...state,
    clearWasOffline,
  }
}

/**
 * Hook to retry failed operations with exponential backoff
 */
export function useRetryWithBackoff() {
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  const retry = useCallback(
    async <T>(operation: () => Promise<T>, maxRetries: number = 3): Promise<T | null> => {
      setIsRetrying(true)
      let attempt = 0

      while (attempt < maxRetries) {
        try {
          const result = await operation()
          setRetryCount(0)
          setIsRetrying(false)
          return result
        } catch (error) {
          attempt++
          setRetryCount(attempt)

          if (attempt >= maxRetries) {
            setIsRetrying(false)
            throw error
          }

          // Exponential backoff: 1s, 2s, 4s, 8s...
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000)
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }

      setIsRetrying(false)
      return null
    },
    []
  )

  const reset = useCallback(() => {
    setRetryCount(0)
    setIsRetrying(false)
  }, [])

  return {
    retry,
    retryCount,
    isRetrying,
    reset,
  }
}
