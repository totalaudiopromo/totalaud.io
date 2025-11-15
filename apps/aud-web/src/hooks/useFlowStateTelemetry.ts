/**
 * useFlowStateTelemetry Hook
 * Phase 15: Flow State Intelligence + Signal Analytics
 *
 * Purpose:
 * - Buffer telemetry events for batch submission (10s intervals)
 * - Track user interactions: saves, shares, agent runs, tab changes, idle time
 * - Support privacy-first local-only mode via localStorage opt-in check
 * - Graceful degradation when offline or API unavailable
 *
 * Usage:
 * const { trackEvent } = useFlowStateTelemetry({ campaignId: '...' })
 * trackEvent('save', { duration: 1500 })
 * trackEvent('agentRun', { agent: 'enrich', success: true })
 *
 * Event Types:
 * - save: Manual or auto-save (duration = time since last save)
 * - share: Scene share action (metadata = shareId, permissions)
 * - agentRun: Agent execution (metadata = agent type, success/failure)
 * - tabChange: Console tab switch (metadata = fromTab, toTab)
 * - idle: User inactive for 2+ minutes (duration = idle time in ms)
 * - sessionStart: New console session
 * - sessionEnd: Console session end
 */

'use client'

import { useEffect, useRef, useCallback } from 'react'
import { logger } from '@/lib/logger'
import type { TelemetryEvent, TelemetryEventType, TelemetryMetadata } from '@/types/telemetry'

const log = logger.scope('FlowStateTelemetry')
const TELEMETRY_STORAGE_KEY = 'flowTelemetry'

interface UseFlowStateTelemetryOptions {
  campaignId?: string
  enabled?: boolean // Default: true
  batchIntervalMs?: number // Default: 10000 (10 seconds)
  maxBatchSize?: number // Default: 50 events
}

interface UseFlowStateTelemetryReturn {
  trackEvent: (
    eventType: TelemetryEventType,
    options?: { duration?: number; metadata?: Record<string, any> }
  ) => void
  flushEvents: () => Promise<void>
  clearBuffer: () => void
  isEnabled: boolean
  pendingEventCount: number
}

function isTelemetryEnabled(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const setting = localStorage.getItem(TELEMETRY_STORAGE_KEY)
    return setting === 'true'
  } catch (error) {
    log.warn('Could not access localStorage for telemetry setting', { error })
    return false
  }
}

/**
 * useFlowStateTelemetry Hook
 * Buffers telemetry events and submits in batches every 10 seconds
 */
export function useFlowStateTelemetry(
  options: UseFlowStateTelemetryOptions = {}
): UseFlowStateTelemetryReturn {
  const { campaignId, enabled = true, batchIntervalMs = 10000, maxBatchSize = 50 } = options

  const eventBuffer = useRef<TelemetryEvent[]>([])
  const flushTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)
  const isEnabledRef = useRef(isTelemetryEnabled() && enabled)
  const offlineQueueRef = useRef<TelemetryEvent[]>([])

  /**
   * Flush buffered events to API
   */
  const flushEvents = useCallback(async () => {
    if (eventBuffer.current.length === 0) return

    const eventsToSend = [...eventBuffer.current]
    eventBuffer.current = [] // Clear buffer immediately

    if (!isEnabledRef.current) {
      log.debug('Telemetry disabled, skipping flush', { eventCount: eventsToSend.length })
      return
    }

    try {
      log.debug('Flushing telemetry events', { count: eventsToSend.length })

      const response = await fetch('/api/telemetry/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          events: eventsToSend,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      log.debug('Telemetry batch submitted', {
        inserted: data.inserted,
        count: eventsToSend.length,
      })
    } catch (error) {
      log.warn('Failed to submit telemetry batch', { error })

      if (isMountedRef.current) {
        const remaining = [...eventsToSend, ...eventBuffer.current].slice(0, maxBatchSize)
        eventBuffer.current = remaining
      }
    }
  }, [campaignId, maxBatchSize])

  /**
   * Track a telemetry event
   * Adds to buffer and schedules flush if needed
   */
  const trackEvent = useCallback(
    <T extends TelemetryEventType>(
      eventType: T,
      options?: { duration?: number; metadata?: TelemetryMetadata<T> }
    ) => {
      if (!isEnabledRef.current) {
        log.debug('Telemetry disabled, skipping event', { eventType })
        return
      }

      const event: TelemetryEvent<T> = {
        event_type: eventType,
        duration_ms: options?.duration,
        metadata: options?.metadata,
        created_at: new Date().toISOString(),
      }

      const isOnline = typeof navigator === 'undefined' ? true : navigator.onLine

      if (!isOnline) {
        offlineQueueRef.current.push(event)
        log.debug('Telemetry queued offline', {
          eventType,
          offlineCount: offlineQueueRef.current.length,
        })
        return
      }

      eventBuffer.current.push(event)

      log.debug('Telemetry event tracked', { eventType, bufferSize: eventBuffer.current.length })

      // Auto-flush if buffer is full
      if (eventBuffer.current.length >= maxBatchSize) {
        log.debug('Buffer full, flushing immediately')
        flushEvents()
      }

      // Reset flush timer
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current)
      }

      flushTimerRef.current = setTimeout(() => {
        flushEvents()
      }, batchIntervalMs)
    },
    [batchIntervalMs, maxBatchSize, flushEvents]
  )

  /**
   * Clear event buffer
   */
  const clearBuffer = useCallback(() => {
    eventBuffer.current = []
    offlineQueueRef.current = []
    log.debug('Event buffer cleared')
  }, [])

  /**
   * Setup: Track session start and schedule periodic flushes
   */
  useEffect(() => {
    isMountedRef.current = true
    isEnabledRef.current = isTelemetryEnabled() && enabled

    if (isEnabledRef.current) {
      // Track session start
      trackEvent('sessionStart')

      log.debug('Telemetry initialized', { campaignId, batchIntervalMs })
    }

    const handleOnline = () => {
      if (offlineQueueRef.current.length === 0) return
      eventBuffer.current.push(...offlineQueueRef.current.splice(0, offlineQueueRef.current.length))
      log.debug('Flushing offline telemetry events', { count: eventBuffer.current.length })
      void flushEvents()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline)
    }

    return () => {
      isMountedRef.current = false

      // Track session end and flush remaining events
      if (isEnabledRef.current) {
        trackEvent('sessionEnd')

        // Flush immediately on unmount
        if (eventBuffer.current.length > 0) {
          flushEvents()
        } else if (offlineQueueRef.current.length > 0) {
          eventBuffer.current.push(
            ...offlineQueueRef.current.splice(0, offlineQueueRef.current.length)
          )
          flushEvents()
        }
      }

      // Clear flush timer
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current)
      }

      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline)
      }
    }
  }, [campaignId, enabled, batchIntervalMs, trackEvent, flushEvents])

  return {
    trackEvent,
    flushEvents,
    clearBuffer,
    isEnabled: isEnabledRef.current,
    pendingEventCount: eventBuffer.current.length,
  }
}
