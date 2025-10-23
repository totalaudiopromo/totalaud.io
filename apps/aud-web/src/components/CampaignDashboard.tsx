'use client'

/**
 * Campaign Mixdown Dashboard
 *
 * Aggregates and visualizes campaign metrics from all agents in real-time.
 * Design Principle: "The mixdown is the moment the work feels real."
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAgent, type AgentRole } from '@total-audio/core-agent-executor'
import { useCampaignMetrics } from '@aud-web/hooks/useCampaignMetrics'
import { IntegrationManager } from './IntegrationManager'
import { SmartComposer } from './SmartComposer'
import { createBrowserClient } from '@aud-web/lib/supabase'

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

export function CampaignDashboard({
  sessionId,
  campaignName = 'Campaign',
}: CampaignDashboardProps) {
  const [showIntegrations, setShowIntegrations] = useState(false)
  const [hasIntegrations, setHasIntegrations] = useState(false)
  const [agentSummaries, setAgentSummaries] = useState<Record<string, AgentSummary>>({})

  const supabase = createBrowserClient()

  // Use the new useCampaignMetrics hook
  const {
    metrics,
    trackerMetrics,
    loading: isLoading,
    error: metricsError,
  } = useCampaignMetrics({
    sessionId,
    enableRealtime: true,
    playSoundCues: true,
  })

  const error = metricsError ? new Error(metricsError) : null

  // Check if user has any integrations connected
  useEffect(() => {
    const checkIntegrations = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from('integration_connections')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .limit(1)

        setHasIntegrations((data?.length || 0) > 0)
      } catch (err) {
        console.error('[CampaignDashboard] Failed to check integrations:', err)
      }
    }

    checkIntegrations()
  }, [supabase])

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
        <div className="text-red-500 font-mono text-sm">Error loading metrics: {error.message}</div>
      </div>
    )
  }

  const agentOrder = ['broker', 'scout', 'coach', 'tracker', 'insight']
  const orderedSummaries = agentOrder.map((id) => agentSummaries[id]).filter(Boolean)

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
        <p className="text-slate-400 text-sm mt-1">Real-time metrics from your agent workflow</p>
      </motion.div>

      {/* Integrations Status Strip */}
      {!hasIntegrations && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/50 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔗</span>
              <div>
                <h3 className="font-mono font-bold text-white">
                  Connect integrations to see live stats
                </h3>
                <p className="text-sm text-slate-400 mt-0.5">
                  Sync Gmail and Google Sheets to automatically track campaign metrics
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowIntegrations(!showIntegrations)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded font-mono text-white text-sm transition-colors"
            >
              {showIntegrations ? 'Hide Integrations' : 'Connect Now'}
            </button>
          </div>

          {showIntegrations && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-indigo-500/30"
            >
              <IntegrationManager
                inline
                onSyncComplete={() => {
                  setShowIntegrations(false)
                  setHasIntegrations(true)
                }}
              />
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Tracker Metrics Summary (if integrations connected) */}
      {hasIntegrations && Object.keys(trackerMetrics).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-500/50 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <h3 className="font-mono font-bold text-white">Live Campaign Metrics</h3>
            </div>
            <div className="flex items-center gap-2">
              {trackerMetrics.emailsSent !== undefined && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-900/30 border border-green-500 rounded text-xs text-green-400">
                  📧 Gmail
                </span>
              )}
              {trackerMetrics.totalContacts !== undefined && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-900/30 border border-green-500 rounded text-xs text-green-400">
                  📊 Sheets
                </span>
              )}
              <button
                onClick={() => setShowIntegrations(!showIntegrations)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs font-mono text-slate-300 transition-colors"
              >
                {showIntegrations ? 'Hide' : 'Manage'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {trackerMetrics.emailsSent !== undefined && (
              <div>
                <div className="text-2xl font-mono font-bold text-white">
                  {trackerMetrics.emailsSent}
                </div>
                <div className="text-xs text-slate-400">Emails Sent</div>
              </div>
            )}
            {trackerMetrics.emailReplies !== undefined && (
              <div>
                <div className="text-2xl font-mono font-bold text-white">
                  {trackerMetrics.emailReplies}
                </div>
                <div className="text-xs text-slate-400">Replies</div>
              </div>
            )}
            {trackerMetrics.openRate !== undefined && (
              <div>
                <div className="text-2xl font-mono font-bold text-white">
                  {trackerMetrics.openRate}%
                </div>
                <div className="text-xs text-slate-400">Open Rate</div>
              </div>
            )}
            {trackerMetrics.followUpsDue !== undefined && (
              <div>
                <div className="text-2xl font-mono font-bold text-amber-400">
                  {trackerMetrics.followUpsDue}
                </div>
                <div className="text-xs text-slate-400">Follow-Ups Due</div>
              </div>
            )}
            {trackerMetrics.totalContacts !== undefined && (
              <div>
                <div className="text-2xl font-mono font-bold text-white">
                  {trackerMetrics.totalContacts}
                </div>
                <div className="text-xs text-slate-400">Total Contacts</div>
              </div>
            )}
            {trackerMetrics.newContacts !== undefined && (
              <div>
                <div className="text-2xl font-mono font-bold text-green-400">
                  +{trackerMetrics.newContacts}
                </div>
                <div className="text-xs text-slate-400">New Contacts</div>
              </div>
            )}
          </div>

          {showIntegrations && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-amber-500/30"
            >
              <IntegrationManager inline onSyncComplete={() => setShowIntegrations(false)} />
            </motion.div>
          )}
        </motion.div>
      )}

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

      {/* Smart Composer - Follow-Up Suggestions */}
      {hasIntegrations && trackerMetrics.emailsSent !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-900 border border-blue-500/50 rounded-lg p-6"
        >
          <SmartComposer
            sessionId={sessionId}
            onDraftSent={() => {
              // Refresh metrics after sending
              window.location.reload()
            }}
          />
        </motion.div>
      )}

      {/* Action Buttons */}
      {orderedSummaries.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex gap-4 pt-4 border-t border-slate-800"
        >
          <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors">
            Export Report
          </button>
          <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors">
            View All Drafts
          </button>
          <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors">
            Try Another Flow
          </button>
        </motion.div>
      )}
    </div>
  )
}
