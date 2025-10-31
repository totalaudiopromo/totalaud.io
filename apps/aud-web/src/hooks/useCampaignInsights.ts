/**
 * useCampaignInsights Hook
 *
 * Provides live campaign metrics for the Insight Panel.
 * Phase 12.3.5: Console UX & Visual Fixes
 *
 * Features:
 * - Real-time metric updates
 * - Agent activity tracking
 * - Task completion stats
 * - Contact enrichment progress
 * - Open rate analytics
 */

'use client'

import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabaseClient'

export interface CampaignMetrics {
  activeAgents: number
  activeAgentsTrend: 'up' | 'down' | 'neutral'
  tasksCompleted: number
  tasksCompletedTrend: 'up' | 'down' | 'neutral'
  contactsEnriched: number
  contactsEnrichedTrend: 'up' | 'down' | 'neutral'
  openRate: number
  openRateTrend: 'up' | 'down' | 'neutral'
}

export interface CampaignGoal {
  id: string
  description: string
  completed: boolean
}

export interface AIRecommendation {
  id: string
  text: string
  priority: 'high' | 'medium' | 'low'
}

export interface CampaignInsights {
  metrics: CampaignMetrics
  goals: CampaignGoal[]
  recommendations: AIRecommendation[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * useCampaignInsights - Live campaign data for Insight Panel
 *
 * @param campaignId - Active campaign ID (null = use mock data)
 * @param refreshInterval - Auto-refresh interval in ms (default: 30000 = 30s)
 *
 * @example
 * ```tsx
 * const { metrics, goals, recommendations, isLoading } = useCampaignInsights(campaignId)
 * ```
 */
export function useCampaignInsights(
  campaignId: string | null,
  refreshInterval = 30000
): CampaignInsights {
  const supabase = getSupabaseClient()

  const [metrics, setMetrics] = useState<CampaignMetrics>({
    activeAgents: 0,
    activeAgentsTrend: 'neutral',
    tasksCompleted: 0,
    tasksCompletedTrend: 'neutral',
    contactsEnriched: 0,
    contactsEnrichedTrend: 'neutral',
    openRate: 0,
    openRateTrend: 'neutral',
  })

  const [goals, setGoals] = useState<CampaignGoal[]>([])
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInsights = async () => {
    if (!campaignId) {
      // Use mock data for development
      setMetrics({
        activeAgents: 3,
        activeAgentsTrend: 'up',
        tasksCompleted: 12,
        tasksCompletedTrend: 'up',
        contactsEnriched: 47,
        contactsEnrichedTrend: 'neutral',
        openRate: 24,
        openRateTrend: 'up',
      })

      setGoals([
        {
          id: '1',
          description: 'Enrich 100 radio contacts',
          completed: false,
        },
        {
          id: '2',
          description: 'Send 50 personalised pitches',
          completed: false,
        },
        {
          id: '3',
          description: 'Achieve 30% open rate',
          completed: false,
        },
      ])

      setRecommendations([
        {
          id: '1',
          text: 'Focus on BBC Radio contacts for highest engagement potential based on your track genre.',
          priority: 'high',
        },
      ])

      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Fetch active agents count
      const { data: agents, error: agentsError } = await supabase
        .from('agent_manifests')
        .select('id')
        .eq('campaign_id', campaignId)

      if (agentsError) throw agentsError

      // Fetch completed tasks count
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('status', 'completed')

      if (tasksError) throw tasksError

      // Fetch contacts enriched
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('id')
        .eq('campaign_id', campaignId)
        .not('enriched_data', 'is', null)

      if (contactsError) throw contactsError

      // Fetch campaign goals
      const { data: campaignGoals, error: goalsError } = await supabase
        .from('campaign_goals')
        .select('id, description, completed')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: true })

      if (goalsError) throw goalsError

      // Calculate open rate (mock for now - would need email tracking)
      const openRate = 24 // TODO: Calculate from email_events table

      setMetrics({
        activeAgents: agents?.length || 0,
        activeAgentsTrend: 'up', // TODO: Calculate from historical data
        tasksCompleted: tasks?.length || 0,
        tasksCompletedTrend: 'up',
        contactsEnriched: contacts?.length || 0,
        contactsEnrichedTrend: 'neutral',
        openRate,
        openRateTrend: 'up',
      })

      setGoals(campaignGoals || [])

      // Generate AI recommendations (mock for now)
      setRecommendations([
        {
          id: '1',
          text: 'Focus on BBC Radio contacts for highest engagement potential based on your track genre.',
          priority: 'high',
        },
      ])

      setIsLoading(false)
    } catch (err) {
      console.error('Error fetching campaign insights:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch insights')
      setIsLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchInsights()
  }, [campaignId])

  // Auto-refresh interval
  useEffect(() => {
    if (!refreshInterval) return

    const interval = setInterval(() => {
      fetchInsights()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [campaignId, refreshInterval])

  return {
    metrics,
    goals,
    recommendations,
    isLoading,
    error,
    refresh: fetchInsights,
  }
}
