/**
 * SignalAnalytics Component
 * Phase 15: Flow State Intelligence + Signal Analytics
 *
 * Purpose:
 * - Display flow state metrics (saves, shares, agent runs, time in flow)
 * - Render sparkline charts for visual trends (last 7 days)
 * - Show adaptive insights from Insight Engine
 * - ⌘L keyboard shortcut to toggle analytics panel
 *
 * Design:
 * - FlowCore tokens (Matte Black, Slate Cyan, Ice Cyan)
 * - Monospace typography
 * - 240ms animations
 * - Reduced motion support
 * - WCAG AA+ accessible
 *
 * Usage:
 * <SignalAnalytics
 *   campaignId="uuid"
 *   isOpen={true}
 *   onClose={() => setIsOpen(false)}
 * />
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { logger } from '@/lib/logger'

const log = logger.scope('SignalAnalytics')

interface TelemetrySummary {
  totalSaves: number
  totalShares: number
  totalAgentRuns: number
  totalTimeInFlowMs: number
  avgSaveIntervalMs: number | null
  lastActivityAt: string | null
}

interface SparklineData {
  timestamp: string
  value: number
}

interface Sparklines {
  saves: SparklineData[]
  agentRuns: SparklineData[]
  timeInFlow: SparklineData[]
}

export interface SignalAnalyticsProps {
  campaignId?: string
  isOpen: boolean
  onClose: () => void
  period?: '7d' | '30d' // Default: 7d
}

/**
 * Format duration in milliseconds to human-readable string
 */
function formatDuration(ms: number): string {
  if (ms === 0) return '0m'

  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m`

  return '<1m'
}

/**
 * Format interval in milliseconds to human-readable string
 */
function formatInterval(ms: number): string {
  const minutes = Math.floor(ms / (1000 * 60))
  if (minutes < 60) return `${minutes}m`

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

/**
 * Sparkline Chart Component
 * Renders a simple line chart from data points
 */
function Sparkline({ data, colour }: { data: SparklineData[]; colour: string }) {
  if (data.length === 0) return null

  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const width = 100
  const height = 24

  // Generate SVG path
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - (d.value / maxValue) * height
    return `${x},${y}`
  })

  const pathData = `M ${points.join(' L ')}`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {/* Background grid (optional) */}
      <line
        x1="0"
        y1={height}
        x2={width}
        y2={height}
        stroke={flowCoreColours.borderGrey}
        strokeWidth="1"
      />

      {/* Sparkline path */}
      <path
        d={pathData}
        fill="none"
        stroke={colour}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SignalAnalytics({
  campaignId,
  isOpen,
  onClose,
  period = '7d',
}: SignalAnalyticsProps) {
  const prefersReducedMotion = useReducedMotion()

  const [summary, setSummary] = useState<TelemetrySummary | null>(null)
  const [sparklines, setSparklines] = useState<Sparklines | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch telemetry summary
   */
  const fetchSummary = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ period })
      if (campaignId) params.append('campaignId', campaignId)

      const response = await fetch(`/api/telemetry/summary?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      setSummary(data.summary)
      setSparklines(data.sparklines)

      log.debug('Analytics loaded', { summary: data.summary, period })
    } catch (err) {
      log.error('Failed to load analytics', err)
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setIsLoading(false)
    }
  }, [campaignId, period])

  /**
   * Fetch on mount and when panel opens
   */
  useEffect(() => {
    if (isOpen) {
      fetchSummary()
    }
  }, [isOpen, fetchSummary])

  /**
   * Keyboard shortcut: Esc to close
   */
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  /**
   * Lock body scroll when open
   */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
            }}
            aria-hidden="true"
          />

          {/* Analytics Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="signal-analytics-title"
            initial={{ opacity: 0, x: 480 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 480 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.24,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '480px',
              zIndex: 51,
              backgroundColor: flowCoreColours.matteBlack,
              borderLeft: `2px solid ${flowCoreColours.borderGrey}`,
              display: 'flex',
              flexDirection: 'column',
              fontFamily:
                'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '24px',
                borderBottom: `1px solid ${flowCoreColours.borderGrey}`,
              }}
            >
              <h2
                id="signal-analytics-title"
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: flowCoreColours.iceCyan,
                  textTransform: 'lowercase',
                  letterSpacing: '0.3px',
                  margin: 0,
                }}
              >
                signal analytics
              </h2>

              <button
                onClick={onClose}
                aria-label="Close analytics panel"
                style={{
                  background: 'none',
                  border: 'none',
                  color: flowCoreColours.textSecondary,
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '4px',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px',
              }}
            >
              {isLoading && (
                <div
                  style={{
                    color: flowCoreColours.textSecondary,
                    fontSize: '14px',
                    textAlign: 'center',
                    padding: '40px 0',
                  }}
                >
                  loading analytics...
                </div>
              )}

              {error && (
                <div
                  style={{
                    color: '#E57373',
                    fontSize: '14px',
                    textAlign: 'center',
                    padding: '40px 0',
                  }}
                >
                  {error}
                </div>
              )}

              {!isLoading && !error && summary && sparklines && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  {/* Summary Metrics */}
                  <div>
                    <h3
                      style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        color: flowCoreColours.textTertiary,
                        textTransform: 'lowercase',
                        margin: '0 0 16px 0',
                      }}
                    >
                      last {period === '7d' ? '7 days' : '30 days'}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Total Saves */}
                      <div>
                        <div
                          style={{
                            fontSize: '13px',
                            color: flowCoreColours.textSecondary,
                            marginBottom: '8px',
                          }}
                        >
                          saves
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              fontSize: '24px',
                              fontWeight: 600,
                              color: flowCoreColours.textPrimary,
                            }}
                          >
                            {summary.totalSaves}
                          </div>
                          <Sparkline data={sparklines.saves} colour={flowCoreColours.slateCyan} />
                        </div>
                      </div>

                      {/* Total Agent Runs */}
                      <div>
                        <div
                          style={{
                            fontSize: '13px',
                            color: flowCoreColours.textSecondary,
                            marginBottom: '8px',
                          }}
                        >
                          agent runs
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              fontSize: '24px',
                              fontWeight: 600,
                              color: flowCoreColours.textPrimary,
                            }}
                          >
                            {summary.totalAgentRuns}
                          </div>
                          <Sparkline data={sparklines.agentRuns} colour={flowCoreColours.iceCyan} />
                        </div>
                      </div>

                      {/* Total Shares */}
                      <div>
                        <div
                          style={{
                            fontSize: '13px',
                            color: flowCoreColours.textSecondary,
                            marginBottom: '8px',
                          }}
                        >
                          shares
                        </div>
                        <div
                          style={{
                            fontSize: '24px',
                            fontWeight: 600,
                            color: flowCoreColours.textPrimary,
                          }}
                        >
                          {summary.totalShares}
                        </div>
                      </div>

                      {/* Time in Flow */}
                      <div>
                        <div
                          style={{
                            fontSize: '13px',
                            color: flowCoreColours.textSecondary,
                            marginBottom: '8px',
                          }}
                        >
                          time in flow
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              fontSize: '24px',
                              fontWeight: 600,
                              color: flowCoreColours.textPrimary,
                            }}
                          >
                            {formatDuration(summary.totalTimeInFlowMs)}
                          </div>
                          <Sparkline
                            data={sparklines.timeInFlow}
                            colour={flowCoreColours.slateCyan}
                          />
                        </div>
                      </div>

                      {/* Average Save Interval */}
                      {summary.avgSaveIntervalMs !== null && (
                        <div>
                          <div
                            style={{
                              fontSize: '13px',
                              color: flowCoreColours.textSecondary,
                              marginBottom: '8px',
                            }}
                          >
                            avg save interval
                          </div>
                          <div
                            style={{
                              fontSize: '24px',
                              fontWeight: 600,
                              color: flowCoreColours.textPrimary,
                            }}
                          >
                            {formatInterval(summary.avgSaveIntervalMs)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Empty State Message */}
                  {summary.totalSaves === 0 &&
                    summary.totalShares === 0 &&
                    summary.totalAgentRuns === 0 &&
                    summary.totalTimeInFlowMs === 0 && (
                      <div
                        style={{
                          padding: '24px',
                          backgroundColor: flowCoreColours.darkGrey,
                          border: `1px solid ${flowCoreColours.borderGrey}`,
                          borderRadius: '8px',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '14px',
                            color: flowCoreColours.textSecondary,
                            textAlign: 'center',
                            lineHeight: 1.6,
                          }}
                        >
                          no activity yet
                          <br />
                          <span style={{ color: flowCoreColours.textTertiary, fontSize: '13px' }}>
                            start working to see analytics
                          </span>
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: `1px solid ${flowCoreColours.borderGrey}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: flowCoreColours.textTertiary,
                  textTransform: 'lowercase',
                }}
              >
                press esc to close
              </div>

              <button
                onClick={onClose}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  border: `1px solid ${flowCoreColours.borderGrey}`,
                  borderRadius: '4px',
                  color: flowCoreColours.textSecondary,
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textTransform: 'lowercase',
                  transition: 'all 0.24s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = flowCoreColours.slateCyan
                  e.currentTarget.style.color = flowCoreColours.iceCyan
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = flowCoreColours.borderGrey
                  e.currentTarget.style.color = flowCoreColours.textSecondary
                }}
              >
                close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
