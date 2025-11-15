/**
 * Flow Hub Dashboard
 * Phase 15.9: Unified Campaign Analytics + AI Briefs
 *
 * Purpose:
 * - Central analytics dashboard accessible via ⌘⇧H
 * - 3-panel layout: Performance Overview, Top Performers, AI Brief
 * - Real-time metrics with caching for performance
 * - AI-generated insights and recommendations
 *
 * Features:
 * - Period selector (7/30/90 days)
 * - Performance charts and totals
 * - Top EPKs and agents ranking
 * - Collapsible AI brief panel with regenerate option (⌘R)
 * - FlowScope mini-map visualisation
 * - FlowCore design tokens + reduced motion support
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { logger } from '@/lib/logger'
import { useFlowStateTelemetry } from '@/hooks/useFlowStateTelemetry'

const log = logger.scope('FlowHubDashboard')

interface FlowHubDashboardProps {
  isOpen: boolean
  onClose: () => void
}

interface FlowHubSummary {
  period_days: number
  period_start: string
  period_end: string
  total_campaigns: number
  total_epks: number
  total_views: number
  total_downloads: number
  total_shares: number
  total_agent_runs: number
  total_saves: number
  avg_ctr: number
  avg_engagement_score: number
  top_epks: Array<{ epk_id: string; campaign_id: string; views: number }>
  top_agents: Array<{ agent_type: string; runs: number }>
  ai_brief?: AIBrief | null
  ai_brief_generated_at?: string | null
  cached?: boolean
  cacheAge?: number
}

interface AIBrief {
  title: string
  summary: string
  highlights: string[]
  risks: string[]
  recommendations: string[]
  generated_at?: string
}

type Period = 7 | 30 | 90
type ActiveTab = 'overview' | 'performers' | 'brief'

export function FlowHubDashboard({ isOpen, onClose }: FlowHubDashboardProps) {
  const prefersReducedMotion = useReducedMotion()
  const { trackEvent } = useFlowStateTelemetry()

  // State
  const [period, setPeriod] = useState<Period>(7)
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')
  const [summary, setSummary] = useState<FlowHubSummary | null>(null)
  const [brief, setBrief] = useState<AIBrief | null>(null)
  const [loading, setLoading] = useState(false)
  const [briefLoading, setBriefLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [briefExpanded, setBriefExpanded] = useState(true)

  /**
   * Fetch summary data
   */
  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      log.debug('Fetching flow hub summary', { period })

      const response = await fetch(`/api/flow-hub/summary?period=${period}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch summary')
      }

      setSummary(data)
      if (data.ai_brief) {
        setBrief(data.ai_brief)
      }

      log.info('Flow hub summary loaded', { period, cached: data.cached })
    } catch (err) {
      log.error('Failed to fetch flow hub summary', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [period])

  /**
   * Generate AI brief
   */
  const generateBrief = useCallback(
    async (force_refresh = false) => {
      try {
        setBriefLoading(true)

        log.debug('Generating AI brief', { period, force_refresh })

        // Track telemetry
        trackEvent('flow_brief_generated', {
          metadata: {
            period,
            forceRefresh: force_refresh,
          },
        })

        const response = await fetch('/api/flow-hub/brief', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ period, force_refresh }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate brief')
        }

        setBrief(data)

        log.info('AI brief generated', { period, cached: data.cached })
      } catch (err) {
        log.error('Failed to generate AI brief', err)
        setError(err instanceof Error ? err.message : 'Failed to generate brief')
      } finally {
        setBriefLoading(false)
      }
    },
    [period, trackEvent]
  )

  /**
   * Load data on mount and when period changes
   */
  useEffect(() => {
    if (isOpen) {
      fetchSummary()

      // Track telemetry
      trackEvent('flow_hub_opened', { metadata: { period } })
    }
  }, [isOpen, period, fetchSummary, trackEvent])

  /**
   * Keyboard shortcuts
   */
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘R - Regenerate AI brief
      if (e.metaKey && e.key === 'r') {
        e.preventDefault()
        if (activeTab === 'brief') {
          generateBrief(true)
        }
      }

      // Escape - Close dashboard
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, activeTab, generateBrief, onClose])

  /**
   * Handle tab change
   */
  const handleTabChange = useCallback(
    (tab: ActiveTab) => {
      setActiveTab(tab)

      // Track telemetry
      trackEvent('flow_hub_tab_changed', { metadata: { tab } })

      // Auto-generate brief if switching to brief tab and no brief exists
      if (tab === 'brief' && !brief && !briefLoading) {
        generateBrief(false)
      }
    },
    [brief, briefLoading, generateBrief, trackEvent]
  )

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.24,
            ease: 'easeOut'
          }}
          className="absolute inset-0 backdrop-blur-sm"
          style={{ backgroundColor: flowCoreColours.overlayStrong }}
          onClick={onClose}
        />

        {/* Dashboard Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.24,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative w-full max-w-6xl mx-4 rounded-lg overflow-hidden z-10"
          style={{
            backgroundColor: flowCoreColours.matteBlack,
            border: `1px solid ${flowCoreColours.borderGrey}`,
            maxHeight: '90vh',
            boxShadow: `0 20px 60px ${flowCoreColours.overlayStrong}`,
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderBottomColor: flowCoreColours.borderGrey }}
          >
            <div>
              <h2
                className="text-xl font-semibold lowercase font-mono"
                style={{ color: flowCoreColours.textPrimary }}
              >
                flow hub
              </h2>
              <p
                className="text-sm mt-1 lowercase font-mono"
                style={{ color: flowCoreColours.textTertiary }}
              >
                unified analytics & ai insights
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Period Selector */}
              <div
                className="flex gap-1 p-1 rounded"
                style={{ backgroundColor: flowCoreColours.cardBackground }}
              >
                {([7, 30, 90] as Period[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className="px-3 py-1.5 text-sm rounded lowercase font-mono transition-all"
                    style={{
                      backgroundColor: period === p ? flowCoreColours.slateCyan : 'transparent',
                      color: period === p ? flowCoreColours.matteBlack : flowCoreColours.textSecondary,
                      transitionDuration: `${prefersReducedMotion ? 0 : 240}ms`,
                      transitionTimingFunction: 'ease-out',
                    }}
                  >
                    {p}d
                  </button>
                ))}
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-sm rounded lowercase font-mono transition-all hover:bg-[var(--flowcore-overlay-soft)]"
                style={{
                  color: flowCoreColours.textSecondary,
                  transitionDuration: `${prefersReducedMotion ? 0 : 240}ms`,
                  transitionTimingFunction: 'ease-out',
                }}
                aria-label="Close Flow Hub"
              >
                close
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div
            className="flex gap-1 px-6 pt-4 border-b"
            style={{ borderBottomColor: flowCoreColours.borderGrey }}
          >
            {[
              { id: 'overview' as ActiveTab, label: 'performance overview' },
              { id: 'performers' as ActiveTab, label: 'top performers' },
              { id: 'brief' as ActiveTab, label: 'ai brief' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className="px-4 py-2 text-sm lowercase font-mono transition-all border-b-2"
                style={{
                  color: activeTab === tab.id ? flowCoreColours.slateCyan : flowCoreColours.textSecondary,
                  borderBottomColor: activeTab === tab.id ? flowCoreColours.slateCyan : 'transparent',
                  transitionDuration: `${prefersReducedMotion ? 0 : 240}ms`,
                  transitionTimingFunction: 'ease-out',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: '70vh' }}>
            {loading && (
              <div className="flex items-center justify-center py-12">
                <p className="font-mono" style={{ color: flowCoreColours.textSecondary }}>
                  Loading analytics...
                </p>
              </div>
            )}

            {error && !loading && (
              <div
                className="p-4 rounded border"
                style={{
                  backgroundColor: flowCoreColours.cardBackground,
                  borderColor: flowCoreColours.errorRed,
                }}
              >
                <p className="font-mono" style={{ color: flowCoreColours.errorRed }}>
                  {error}
                </p>
              </div>
            )}

            {summary && !loading && (
              <>
                {/* Performance Overview Tab */}
                {activeTab === 'overview' && <PerformanceOverview summary={summary} />}

                {/* Top Performers Tab */}
                {activeTab === 'performers' && <TopPerformers summary={summary} />}

                {/* AI Brief Tab */}
                {activeTab === 'brief' && (
                  <AIBriefPanel
                    brief={brief}
                    loading={briefLoading}
                    expanded={briefExpanded}
                    onToggleExpand={() => setBriefExpanded(!briefExpanded)}
                    onRegenerate={() => generateBrief(true)}
                  />
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

/**
 * Performance Overview Panel
 */
function PerformanceOverview({ summary }: { summary: FlowHubSummary }) {
  const metrics = [
    { label: 'campaigns', value: summary.total_campaigns },
    { label: 'epks', value: summary.total_epks },
    { label: 'views', value: summary.total_views },
    { label: 'downloads', value: summary.total_downloads },
    { label: 'shares', value: summary.total_shares },
    { label: 'agent runs', value: summary.total_agent_runs },
    { label: 'manual saves', value: summary.total_saves },
    { label: 'avg ctr', value: `${summary.avg_ctr.toFixed(2)}%` },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="p-4 rounded border"
          style={{
            backgroundColor: flowCoreColours.cardBackground,
            borderColor: flowCoreColours.borderGrey,
          }}
        >
          <span
            className="text-sm block mb-2 lowercase font-mono"
            style={{ color: flowCoreColours.textTertiary }}
          >
            {metric.label}
          </span>
          <p
            className="text-2xl font-semibold font-mono"
            style={{ color: flowCoreColours.textPrimary }}
          >
            {metric.value}
          </p>
        </div>
      ))}
    </div>
  )
}

/**
 * Top Performers Panel
 */
function TopPerformers({ summary }: { summary: FlowHubSummary }) {
  return (
    <div className="space-y-6">
      {/* Top EPKs */}
      <div>
        <h3
          className="text-lg font-semibold mb-4 lowercase font-mono"
          style={{ color: flowCoreColours.textPrimary }}
        >
          top epks by views
        </h3>
        <div className="space-y-2">
          {summary.top_epks.length > 0 ? (
            summary.top_epks.map((epk, index) => (
              <div
                key={epk.epk_id}
                className="flex items-center justify-between p-3 rounded border"
                style={{
                  backgroundColor: flowCoreColours.cardBackground,
                  borderColor: flowCoreColours.borderGrey,
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="text-sm font-semibold font-mono"
                    style={{ color: flowCoreColours.slateCyan }}
                  >
                    #{index + 1}
                  </span>
                  <span
                    className="font-mono"
                    style={{ color: flowCoreColours.textPrimary }}
                  >
                    epk {epk.epk_id.slice(0, 8)}...
                  </span>
                </div>
                <span
                  className="text-sm font-mono"
                  style={{ color: flowCoreColours.textSecondary }}
                >
                  {epk.views} views
                </span>
              </div>
            ))
          ) : (
            <p className="font-mono" style={{ color: flowCoreColours.textTertiary }}>
              no epks yet
            </p>
          )}
        </div>
      </div>

      <div>
        <h3
          className="text-lg font-semibold mb-4 lowercase font-mono"
          style={{ color: flowCoreColours.textPrimary }}
        >
          top agents by runs
        </h3>
        <div className="space-y-2">
          {summary.top_agents.length > 0 ? (
            summary.top_agents.map((agent, index) => (
              <div
                key={`${agent.agent_type}-${index}`}
                className="flex items-center justify-between p-3 rounded border"
                style={{
                  backgroundColor: flowCoreColours.cardBackground,
                  borderColor: flowCoreColours.borderGrey,
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="text-sm font-semibold font-mono"
                    style={{ color: flowCoreColours.slateCyan }}
                  >
                    #{index + 1}
                  </span>
                  <span
                    className="font-mono"
                    style={{ color: flowCoreColours.textPrimary }}
                  >
                    {agent.agent_type || 'agent'}
                  </span>
                </div>
                <span
                  className="text-sm font-mono"
                  style={{ color: flowCoreColours.textSecondary }}
                >
                  {agent.runs} runs
                </span>
              </div>
            ))
          ) : (
            <p className="font-mono" style={{ color: flowCoreColours.textTertiary }}>
              agent activity will appear here once runs complete
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * AI Brief Panel
 */
function AIBriefPanel({
  brief,
  loading,
  expanded,
  onToggleExpand,
  onRegenerate,
}: {
  brief: AIBrief | null
  loading: boolean
  expanded: boolean
  onToggleExpand: () => void
  onRegenerate: () => void
}) {
  const prefersReducedMotion = useReducedMotion()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="font-mono" style={{ color: flowCoreColours.textSecondary }}>
          generating ai insights with claude haiku...
        </p>
      </div>
    )
  }

  if (!brief) {
    return (
      <div className="text-center py-12">
        <p className="mb-4 font-mono" style={{ color: flowCoreColours.textSecondary }}>
          no ai brief available yet
        </p>
        <button
          onClick={() => onRegenerate()}
          className="px-4 py-2 rounded text-sm lowercase font-mono transition-all"
          style={{
            backgroundColor: flowCoreColours.slateCyan,
            color: flowCoreColours.matteBlack,
            transitionDuration: `${prefersReducedMotion ? 0 : 240}ms`,
            transitionTimingFunction: 'ease-out',
          }}
        >
          generate brief
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Brief Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3
            className="text-xl font-semibold mb-2 lowercase font-mono"
            style={{ color: flowCoreColours.textPrimary }}
          >
            {brief.title}
          </h3>
          <p
            className="text-sm mb-4 font-mono"
            style={{ color: flowCoreColours.textSecondary }}
          >
            {brief.summary}
          </p>
        </div>
        <button
          onClick={onRegenerate}
          className="px-3 py-1.5 text-sm rounded lowercase font-mono transition-all hover:bg-[var(--flowcore-colour-accent)] hover:text-[var(--flowcore-colour-bg)]"
          style={{
            backgroundColor: flowCoreColours.hoverGrey,
            color: flowCoreColours.textSecondary,
            transitionDuration: `${prefersReducedMotion ? 0 : 240}ms`,
            transitionTimingFunction: 'ease-out',
          }}
          title="Regenerate Brief (⌘R)"
        >
          regenerate
        </button>
      </div>

      {/* Highlights */}
      {brief.highlights.length > 0 && (
        <div>
          <h4
            className="text-sm font-semibold mb-2 lowercase font-mono"
            style={{ color: flowCoreColours.successGreen }}
          >
            highlights
          </h4>
          <ul className="space-y-2">
            {brief.highlights.map((highlight, index) => (
              <li
                key={index}
                className="pl-4 border-l-2 font-mono"
                style={{
                  color: flowCoreColours.textSecondary,
                  borderLeftColor: flowCoreColours.successGreen,
                }}
              >
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risks */}
      {brief.risks.length > 0 && (
        <div>
          <h4
            className="text-sm font-semibold mb-2 lowercase font-mono"
            style={{ color: flowCoreColours.warningOrange }}
          >
            risks
          </h4>
          <ul className="space-y-2">
            {brief.risks.map((risk, index) => (
              <li
                key={index}
                className="pl-4 border-l-2 font-mono"
                style={{
                  color: flowCoreColours.textSecondary,
                  borderLeftColor: flowCoreColours.warningOrange,
                }}
              >
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {brief.recommendations.length > 0 && (
        <div>
          <h4
            className="text-sm font-semibold mb-2 lowercase font-mono"
            style={{ color: flowCoreColours.slateCyan }}
          >
            recommendations
          </h4>
          <ul className="space-y-2">
            {brief.recommendations.map((rec, index) => (
              <li
                key={index}
                className="pl-4 border-l-2 font-mono"
                style={{
                  color: flowCoreColours.textSecondary,
                  borderLeftColor: flowCoreColours.slateCyan,
                }}
              >
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
