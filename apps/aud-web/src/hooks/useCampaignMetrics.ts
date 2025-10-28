/**
 * useCampaignMetrics Hook
 *
 * Fetches and subscribes to real-time campaign metrics from campaign_results table.
 * Aggregates metrics by agent and provides typed access to Tracker integration data.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@aud-web/lib/supabase'
import { playAgentSound } from '@total-audio/core-theme-engine'
import { logger } from '@total-audio/core-logger'

const log = logger.scope('useCampaignMetrics')

export interface CampaignMetric {
  id: string
  agent_name: string
  metric_key: string
  metric_value: number
  metric_label: string
  metric_unit?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface AgentMetrics {
  agent_name: string
  metrics: CampaignMetric[]
  last_update: string
}

export interface TrackerMetrics {
  emailsSent?: number
  emailReplies?: number
  openRate?: number
  followUpsDue?: number
  totalContacts?: number
  newContacts?: number
}

interface UseCampaignMetricsOptions {
  sessionId: string
  enableRealtime?: boolean
  playSoundCues?: boolean
}

interface UseCampaignMetricsReturn {
  metrics: CampaignMetric[]
  metricsByAgent: Record<string, AgentMetrics>
  trackerMetrics: TrackerMetrics
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useCampaignMetrics({
  sessionId,
  enableRealtime = true,
  playSoundCues = true,
}: UseCampaignMetricsOptions): UseCampaignMetricsReturn {
  const [metrics, setMetrics] = useState<CampaignMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient()

  // Fetch initial metrics
  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('campaign_results')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      setMetrics((data as CampaignMetric[]) || [])
    } catch (err) {
      log.error('Fetch error', err, { sessionId })
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics')
    } finally {
      setLoading(false)
    }
  }, [sessionId, supabase])

  // Initial fetch
  useEffect(() => {
    if (sessionId) {
      fetchMetrics()
    }
  }, [sessionId, fetchMetrics])

  // Subscribe to realtime updates
  useEffect(() => {
    if (!enableRealtime || !sessionId) return

    const channel = supabase
      .channel(`campaign-results-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'campaign_results',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const newMetric = payload.new as CampaignMetric

          setMetrics((prev) => [newMetric, ...prev])

          // Play sound cue for new metric
          if (playSoundCues) {
            const agentName = newMetric.agent_name as any
            if (['broker', 'scout', 'coach', 'tracker', 'insight'].includes(agentName)) {
              playAgentSound(agentName, 'complete')
            }
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [sessionId, enableRealtime, playSoundCues, supabase])

  // Aggregate metrics by agent
  const metricsByAgent: Record<string, AgentMetrics> = {}

  metrics.forEach((metric) => {
    if (!metricsByAgent[metric.agent_name]) {
      metricsByAgent[metric.agent_name] = {
        agent_name: metric.agent_name,
        metrics: [],
        last_update: metric.updated_at,
      }
    }

    metricsByAgent[metric.agent_name].metrics.push(metric)

    // Update last_update if this metric is newer
    if (new Date(metric.updated_at) > new Date(metricsByAgent[metric.agent_name].last_update)) {
      metricsByAgent[metric.agent_name].last_update = metric.updated_at
    }
  })

  // Extract Tracker-specific metrics
  const trackerMetrics: TrackerMetrics = {}

  if (metricsByAgent.tracker) {
    metricsByAgent.tracker.metrics.forEach((metric) => {
      switch (metric.metric_key) {
        case 'emails_sent':
          trackerMetrics.emailsSent = metric.metric_value
          break
        case 'email_replies':
          trackerMetrics.emailReplies = metric.metric_value
          break
        case 'open_rate':
          trackerMetrics.openRate = metric.metric_value
          break
        case 'follow_ups_due':
          trackerMetrics.followUpsDue = metric.metric_value
          break
        case 'total_contacts':
          trackerMetrics.totalContacts = metric.metric_value
          break
        case 'new_contacts':
          trackerMetrics.newContacts = metric.metric_value
          break
      }
    })
  }

  return {
    metrics,
    metricsByAgent,
    trackerMetrics,
    loading,
    error,
    refresh: fetchMetrics,
  }
}
