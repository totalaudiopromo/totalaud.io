"use client"

/**
 * Campaign Mixdown Dashboard
 *
 * Aggregates and visualizes campaign metrics from all agents in real-time.
 * Design Principle: "The mixdown is the moment the work feels real."
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { getAgent, type AgentRole } from '@total-audio/core-agent-executor'
import { playAgentSound } from '@total-audio/core-theme-engine'

interface CampaignMetric {
  id: string
  agent_name: string
  metric_key: string
  metric_value: number
  metric_label: string
  metric_unit?: string
  updated_at: string
}

interface AgentSummary {
  agent: AgentRole
  metrics: CampaignMetric[]
  totalValue: number
  lastUpdate: string
}

interface CampaignDashboardProps {
  sessionId: string
  campaignName?: string
}

export function CampaignDashboard({ sessionId, campaignName = 'Campaign' }: CampaignDashboardProps) {
  const [metrics, setMetrics] = useState<CampaignMetric[]>([])
  const [agentSummaries, setAgentSummaries] = useState<Record<string, AgentSummary>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch initial metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('campaign_results')
          .select('*')
          .eq('session_id', sessionId)
          .order('updated_at', { ascending: false })

        if (fetchError) throw fetchError

        setMetrics((data as CampaignMetric[]) || [])
      } catch (err) {
        setError(err as Error)
        console.error('[CampaignDashboard] Failed to fetch metrics:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (sessionId) {
      fetchMetrics()
    }
  }, [sessionId])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!sessionId) return

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
        (payload: any) => {
          const newMetric = payload.new as CampaignMetric
          setMetrics((prev) => [newMetric, ...prev])

          // Play sound cue when new metric arrives
          const agent = getAgent(newMetric.agent_name)
          if (agent) {
            playAgentSound(agent.id as any, 'complete')
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'campaign_results',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload: any) => {
          const updatedMetric = payload.new as CampaignMetric
          setMetrics((prev) =>
            prev.map((m) => (m.id === updatedMetric.id ? updatedMetric : m))
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId])

  // Compute agent summaries
  useEffect(() => {
    const summaries: Record<string, AgentSummary> = {}

    metrics.forEach((metric) => {
      const agent = getAgent(metric.agent_name)
      if (!agent) return

      if (!summaries[agent.id]) {
        summaries[agent.id] = {
          agent,
          metrics: [],
          totalValue: 0,
          lastUpdate: metric.updated_at,
        }
      }

      summaries[agent.id].metrics.push(metric)
      summaries[agent.id].totalValue += metric.metric_value

      // Update last update time if newer
      if (new Date(metric.updated_at) > new Date(summaries[agent.id].lastUpdate)) {
        summaries[agent.id].lastUpdate = metric.updated_at
      }
    })

    setAgentSummaries(summaries)
  }, [metrics])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 font-mono">Loading campaign metrics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
        <div className="text-red-500 font-mono text-sm">
          Error loading metrics: {error.message}
        </div>
      </div>
    )
  }

  const agentOrder = ['broker', 'scout', 'coach', 'tracker', 'insight']
  const orderedSummaries = agentOrder
    .map((id) => agentSummaries[id])
    .filter(Boolean)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-slate-800 pb-4"
      >
        <h2 className="text-2xl font-bold text-white font-mono">
          🎵 Campaign Mixdown: {campaignName}
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Real-time metrics from your agent workflow
        </p>
      </motion.div>

      {/* Agent Summary Cards */}
      {orderedSummaries.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎭</div>
          <div className="text-slate-400 font-mono">
            No metrics yet. Run a campaign flow to see results.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {orderedSummaries.map((summary, index) => (
              <motion.div
                key={summary.agent.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-900 border-2 rounded-xl p-4"
                style={{ borderColor: summary.agent.color }}
              >
                {/* Agent Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${summary.agent.color}20` }}
                  >
                    {summary.agent.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white">{summary.agent.name}</div>
                    <div className="text-xs text-slate-500">{summary.agent.expertise}</div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="space-y-2">
                  {summary.metrics.slice(0, 3).map((metric) => (
                    <motion.div
                      key={metric.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-slate-400 font-mono">{metric.metric_label}</span>
                      <span className="font-bold text-white font-mono">
                        {metric.metric_value.toLocaleString()}
                        {metric.metric_unit && (
                          <span className="text-slate-500 ml-1">{metric.metric_unit}</span>
                        )}
                      </span>
                    </motion.div>
                  ))}

                  {summary.metrics.length > 3 && (
                    <div className="text-xs text-slate-600 font-mono">
                      +{summary.metrics.length - 3} more metrics
                    </div>
                  )}
                </div>

                {/* Last Update */}
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <div className="text-xs text-slate-600 font-mono">
                    Last update: {new Date(summary.lastUpdate).toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Action Buttons */}
      {orderedSummaries.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-4 pt-4 border-t border-slate-800"
        >
          <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors">
            Export Report
          </button>
          <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors">
            Send Follow-Ups
          </button>
          <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors">
            Try Another Flow
          </button>
        </motion.div>
      )}
    </div>
  )
}
