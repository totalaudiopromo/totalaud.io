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
  top_agents: Array<{ agent_id: string; name: string; runs: number }>
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
          period,
          force_refresh,
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
      trackEvent('flow_hub_opened', { period })
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
      trackEvent('flow_hub_tab_changed', { tab })

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
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.24 }}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
          }}
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
          className="relative w-full max-w-6xl mx-4 rounded-lg overflow-hidden"
          style={{
            backgroundColor: flowCoreColours.matteBlack,
            border: `1px solid ${flowCoreColours.borderGrey}`,
            maxHeight: '90vh',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            zIndex: 1,
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{
              borderBottom: `1px solid ${flowCoreColours.borderGrey}`,
            }}
          >
            <div>
              <h2
                className="text-xl font-semibold"
                style={{
                  color: flowCoreColours.textPrimary,
                  textTransform: 'lowercase',
                  fontFamily:
                    'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
                }}
              >
                flow hub
              </h2>
              <p
                className="text-sm mt-1"
                style={{
                  color: flowCoreColours.textTertiary,
                  textTransform: 'lowercase',
                }}
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
                    className="px-3 py-1.5 text-sm rounded transition-colours duration-120"
                    style={{
                      backgroundColor: period === p ? flowCoreColours.slateCyan : 'transparent',
                      color:
                        period === p ? flowCoreColours.matteBlack : flowCoreColours.textSecondary,
                    }}
                  >
                    {p}d
                  </button>
                ))}
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-sm rounded transition-colours duration-120"
                style={{
                  backgroundColor: 'transparent',
                  color: flowCoreColours.textSecondary,
                  fontFamily:
                    'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
                  textTransform: 'lowercase',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = flowCoreColours.hoverGrey
                  e.currentTarget.style.color = flowCoreColours.textPrimary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = flowCoreColours.textSecondary
                }}
                aria-label="Close Flow Hub"
              >
                close
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div
            className="flex gap-1 px-6 pt-4"
            style={{
              borderBottom: `1px solid ${flowCoreColours.borderGrey}`,
            }}
          >
            {[
              { id: 'overview' as ActiveTab, label: 'performance overview' },
              { id: 'performers' as ActiveTab, label: 'top performers' },
              { id: 'brief' as ActiveTab, label: 'ai brief' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className="px-4 py-2 text-sm transition-colours duration-120"
                style={{
                  color:
                    activeTab === tab.id
                      ? flowCoreColours.slateCyan
                      : flowCoreColours.textSecondary,
                  borderBottom:
                    activeTab === tab.id
                      ? `2px solid ${flowCoreColours.slateCyan}`
                      : '2px solid transparent',
                  fontFamily:
                    'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
                  textTransform: 'lowercase',
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
                <p style={{ color: flowCoreColours.textSecondary }}>Loading analytics...</p>
              </div>
            )}

            {error && !loading && (
              <div
                className="p-4 rounded"
                style={{
                  backgroundColor: flowCoreColours.cardBackground,
                  border: `1px solid ${flowCoreColours.errorRed}`,
                }}
              >
                <p style={{ color: flowCoreColours.errorRed }}>{error}</p>
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
          className="p-4 rounded"
          style={{
            backgroundColor: flowCoreColours.cardBackground,
            border: `1px solid ${flowCoreColours.borderGrey}`,
          }}
        >
          <span
            className="text-sm block mb-2"
            style={{
              color: flowCoreColours.textTertiary,
              textTransform: 'lowercase',
            }}
          >
            {metric.label}
          </span>
          <p
            className="text-2xl font-semibold"
            style={{
              color: flowCoreColours.textPrimary,
              fontFamily:
                'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
            }}
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
        <h3 className="text-lg font-semibold mb-4" style={{ color: flowCoreColours.textPrimary }}>
          Top EPKs by Views
        </h3>
        <div className="space-y-2">
          {summary.top_epks.length > 0 ? (
            summary.top_epks.map((epk, index) => (
              <div
                key={epk.epk_id}
                className="flex items-center justify-between p-3 rounded"
                style={{
                  backgroundColor: flowCoreColours.cardBackground,
                  border: `1px solid ${flowCoreColours.borderGrey}`,
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: flowCoreColours.slateCyan }}
                  >
                    #{index + 1}
                  </span>
                  <span style={{ color: flowCoreColours.textPrimary }}>
                    EPK {epk.epk_id.slice(0, 8)}...
                  </span>
                </div>
                <span className="text-sm" style={{ color: flowCoreColours.textSecondary }}>
                  {epk.views} views
                </span>
              </div>
            ))
          ) : (
            <p style={{ color: flowCoreColours.textTertiary }}>No EPKs yet</p>
          )}
        </div>
      </div>

      {/* Top Agents (placeholder) */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: flowCoreColours.textPrimary }}>
          Top Agents by Runs
        </h3>
        <p style={{ color: flowCoreColours.textTertiary }}>Agent tracking coming soon</p>
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
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p style={{ color: flowCoreColours.textSecondary }}>
          Generating AI insights with Claude 3.5 Sonnet...
        </p>
      </div>
    )
  }

  if (!brief) {
    return (
      <div className="text-center py-12">
        <p className="mb-4" style={{ color: flowCoreColours.textSecondary }}>
          No AI brief available yet
        </p>
        <button
          onClick={() => onRegenerate()}
          className="px-4 py-2 rounded text-sm transition-colours duration-120"
          style={{
            backgroundColor: flowCoreColours.slateCyan,
            color: flowCoreColours.matteBlack,
          }}
        >
          Generate Brief
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Brief Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: flowCoreColours.textPrimary }}>
            {brief.title}
          </h3>
          <p className="text-sm mb-4" style={{ color: flowCoreColours.textSecondary }}>
            {brief.summary}
          </p>
        </div>
        <button
          onClick={onRegenerate}
          className="px-3 py-1.5 text-sm rounded transition-colours duration-120"
          style={{
            backgroundColor: flowCoreColours.hoverGrey,
            color: flowCoreColours.textSecondary,
            fontFamily:
              'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
            textTransform: 'lowercase',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = flowCoreColours.slateCyan
            e.currentTarget.style.color = flowCoreColours.matteBlack
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = flowCoreColours.hoverGrey
            e.currentTarget.style.color = flowCoreColours.textSecondary
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
            className="text-sm font-semibold mb-2"
            style={{
              color: flowCoreColours.successGreen,
              textTransform: 'lowercase',
            }}
          >
            highlights
          </h4>
          <ul className="space-y-2">
            {brief.highlights.map((highlight, index) => (
              <li
                key={index}
                className="pl-4"
                style={{
                  color: flowCoreColours.textSecondary,
                  borderLeft: `2px solid ${flowCoreColours.successGreen}`,
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
            className="text-sm font-semibold mb-2"
            style={{
              color: flowCoreColours.warningOrange,
              textTransform: 'lowercase',
            }}
          >
            risks
          </h4>
          <ul className="space-y-2">
            {brief.risks.map((risk, index) => (
              <li
                key={index}
                className="pl-4"
                style={{
                  color: flowCoreColours.textSecondary,
                  borderLeft: `2px solid ${flowCoreColours.warningOrange}`,
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
            className="text-sm font-semibold mb-2"
            style={{
              color: flowCoreColours.slateCyan,
              textTransform: 'lowercase',
            }}
          >
            recommendations
          </h4>
          <ul className="space-y-2">
            {brief.recommendations.map((rec, index) => (
              <li
                key={index}
                className="pl-4"
                style={{
                  color: flowCoreColours.textSecondary,
                  borderLeft: `2px solid ${flowCoreColours.slateCyan}`,
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
