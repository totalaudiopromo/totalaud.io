/**
 * useCampaignDashboard Hook
 * Phase 15.5: Connected Campaign Dashboard
 *
 * Fetches and manages campaign dashboard metrics with 30s revalidation
 */

import { useState, useEffect, useCallback } from 'react'
import { logger } from '@/lib/logger'
import { useFlowStateTelemetry } from './useFlowStateTelemetry'

const log = logger.scope('useCampaignDashboard')

export interface DashboardMetrics {
  views: number
  downloads: number
  shares: number
  engagementScore: number
}

export interface DashboardSummary {
  campaignId: string
  period: 7 | 30
  periodStart: string
  periodEnd: string
  metrics: DashboardMetrics
  dataPoints: number
}

export interface UseCampaignDashboardOptions {
  campaignId: string
  period?: 7 | 30
  revalidateInterval?: number // milliseconds
  enabled?: boolean
}

export function useCampaignDashboard(options: UseCampaignDashboardOptions) {
  const { campaignId, period = 7, revalidateInterval = 30000, enabled = true } = options

  const [data, setData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { trackEvent } = useFlowStateTelemetry()

  const fetchDashboard = useCallback(async () => {
    if (!enabled || !campaignId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const url = `/api/dashboard/summary?campaignId=${campaignId}&period=${period}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Dashboard API error: ${response.status}`)
      }

      const summary: DashboardSummary = await response.json()
      setData(summary)

      // Track dashboard opened event
      trackEvent('dashboard_opened', {
        metadata: {
          campaignId,
          period,
          dataPoints: summary.dataPoints,
        },
      })

      log.info('Dashboard data fetched', {
        campaignId,
        period,
        dataPoints: summary.dataPoints,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch dashboard'
      log.error('Failed to fetch dashboard', err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [campaignId, period, enabled, trackEvent])

  // Initial fetch
  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  // Revalidation interval
  useEffect(() => {
    if (!enabled || !campaignId) return

    const intervalId = setInterval(() => {
      log.debug('Revalidating dashboard data', { campaignId })
      fetchDashboard()
    }, revalidateInterval)

    return () => clearInterval(intervalId)
  }, [campaignId, enabled, revalidateInterval, fetchDashboard])

  return {
    data,
    loading,
    error,
    refetch: fetchDashboard,
  }
}
