/**
 * LoopOS Desktop - Connectivity Detection
 * Monitors online/offline status and triggers sync when reconnecting
 */

import { useEffect, useState, useCallback } from 'react'
import { processQueue } from '../lib/offlineQueue'
import type { QueuedAction } from '../lib/offlineQueue'

export interface ConnectivityState {
  online: boolean
  lastOnlineAt: Date | null
  syncing: boolean
  queueSize: number
}

export function useConnectivity(
  onSync?: (action: QueuedAction) => Promise<void>
) {
  const [state, setState] = useState<ConnectivityState>({
    online: navigator.onLine,
    lastOnlineAt: navigator.onLine ? new Date() : null,
    syncing: false,
    queueSize: 0,
  })

  const sync = useCallback(async () => {
    if (!state.online || !onSync) return

    setState((prev) => ({ ...prev, syncing: true }))

    try {
      const result = await processQueue(onSync, (processed, total) => {
        setState((prev) => ({
          ...prev,
          queueSize: total - processed,
        }))
      })

      console.log('Sync complete:', result)

      setState((prev) => ({
        ...prev,
        syncing: false,
        queueSize: 0,
      }))
    } catch (error) {
      console.error('Sync failed:', error)
      setState((prev) => ({ ...prev, syncing: false }))
    }
  }, [state.online, onSync])

  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({
        ...prev,
        online: true,
        lastOnlineAt: new Date(),
      }))

      // Trigger sync when coming back online
      setTimeout(() => {
        sync()
      }, 1000)
    }

    const handleOffline = () => {
      setState((prev) => ({
        ...prev,
        online: false,
      }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [sync])

  return {
    ...state,
    sync,
  }
}
