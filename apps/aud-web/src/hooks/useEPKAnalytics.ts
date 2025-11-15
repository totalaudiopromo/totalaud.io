/**
 * useEPKAnalytics Hook
 * Phase 15.5: EPK Analytics
 *
 * Fetches EPK metrics and subscribes to real-time updates
 */

import { useState, useEffect, useCallback } from 'react'
import { createBrowserSupabaseClient } from '@aud-web/lib/supabase/client'
import { logger } from '@/lib/logger'
import { useFlowStateTelemetry } from './useFlowStateTelemetry'

const log = logger.scope('useEPKAnalytics')

export interface EPKMetricsGroup {
  name: string
  views: number
  downloads: number
  shares: number
}

export interface EPKMetricsTotals {
  views: number
  downloads: number
  shares: number
}

export interface EPKMetricsData {
  epkId: string
  groupBy: 'region' | 'device'
  totals: EPKMetricsTotals
  grouped: EPKMetricsGroup[]
  eventCount: number
}

export interface UseEPKAnalyticsOptions {
  epkId: string
  groupBy?: 'region' | 'device'
  enabled?: boolean
  realtime?: boolean
}

export function useEPKAnalytics(options: UseEPKAnalyticsOptions) {
  const { epkId, groupBy = 'region', enabled = true, realtime = true } = options

  const [data, setData] = useState<EPKMetricsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { trackEvent } = useFlowStateTelemetry()

  const fetchMetrics = useCallback(async () => {
    if (!enabled || !epkId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const url = `/api/epk/metrics?epkId=${epkId}&groupBy=${groupBy}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`EPK metrics API error: ${response.status}`)
      }

      const metrics: EPKMetricsData = await response.json()
      setData(metrics)

      // Track EPK metrics viewed event
      trackEvent('epk_metrics_viewed', {
        metadata: {
          epkId,
          groupBy,
          eventCount: metrics.eventCount,
        },
      })

      log.info('EPK metrics fetched', {
        epkId,
        groupBy,
        eventCount: metrics.eventCount,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch EPK metrics'
      log.error('Failed to fetch EPK metrics', err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [epkId, groupBy, enabled, trackEvent])

  // Initial fetch
  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  // Real-time subscription
  useEffect(() => {
    if (!enabled || !epkId || !realtime) return

    const supabase = createBrowserSupabaseClient()

    log.debug('Subscribing to EPK analytics real-time updates', { epkId })

    const channel = supabase
      .channel(`epk-analytics-${epkId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'epk_analytics',
          filter: `epk_id=eq.${epkId}`,
        },
        (payload) => {
          log.debug('Real-time EPK analytics event received', payload)

          // Refetch metrics when new event arrives
          fetchMetrics()
        }
      )
      .subscribe()

    return () => {
      log.debug('Unsubscribing from EPK analytics real-time updates', { epkId })
      supabase.removeChannel(channel)
    }
  }, [epkId, enabled, realtime, fetchMetrics])

  // Track event helper
  const trackEPKEvent = useCallback(
    async (eventType: 'view' | 'download' | 'share', assetId?: string) => {
      try {
        const response = await fetch('/api/epk/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            epkId,
            assetId,
            eventType,
          }),
        })

        if (!response.ok) {
          throw new Error(`Track event failed: ${response.status}`)
        }

        const result = await response.json()

        log.info('EPK event tracked', {
          epkId,
          eventType,
          assetId,
        })

        trackEvent('epk_asset_tracked', {
          metadata: {
            epkId,
            assetId,
            eventType,
          },
        })

        return result
      } catch (err) {
        log.error('Failed to track EPK event', err)
        throw err
      }
    },
    [epkId, trackEvent]
  )

  return {
    data,
    loading,
    error,
    refetch: fetchMetrics,
    trackEvent: trackEPKEvent,
  }
}
