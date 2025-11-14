/**
 * useInsightEngine Hook
 * Phase 15: Flow State Intelligence + Adaptive Insights
 *
 * Purpose:
 * - Analyze telemetry patterns every 2 minutes
 * - Generate adaptive suggestions based on user behaviour
 * - Integrate with useAdaptiveHints for contextual guidance
 * - Support privacy-first local-only mode
 *
 * Patterns Detected:
 * - Low save frequency (> 10 min between saves) → Suggest auto-save
 * - High agent usage (> 5 runs/day) → Suggest agent shortcuts
 * - No shares yet → Suggest collaboration features
 * - Long idle periods (> 5 min) → Suggest taking breaks
 * - Consistent daily usage → Congratulate on flow state
 *
 * Usage:
 * const { insights, isAnalyzing } = useInsightEngine({ campaignId: '...' })
 */

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { logger } from '@/lib/logger'

const log = logger.scope('InsightEngine')

export interface Insight {
  id: string
  type: 'suggestion' | 'warning' | 'achievement'
  category: 'save' | 'agent' | 'share' | 'idle' | 'flow'
  title: string
  message: string
  actionLabel?: string
  actionHref?: string
  priority: number // 1 = high, 2 = medium, 3 = low
  createdAt: string
}

interface UseInsightEngineOptions {
  campaignId?: string
  enabled?: boolean // Default: true
  analysisIntervalMs?: number // Default: 120000 (2 minutes)
  maxInsights?: number // Default: 5
}

interface UseInsightEngineReturn {
  insights: Insight[]
  isAnalyzing: boolean
  dismissInsight: (id: string) => void
  clearInsights: () => void
}

/**
 * Check if telemetry is enabled via localStorage
 */
function isTelemetryEnabled(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const setting = localStorage.getItem('analytics_enabled')
    return setting !== 'false'
  } catch (error) {
    log.warn('Could not access localStorage for analytics setting', { error })
    return true
  }
}

/**
 * Get dismissed insights from localStorage
 */
function getDismissedInsights(): Set<string> {
  if (typeof window === 'undefined') return new Set()

  try {
    const dismissed = localStorage.getItem('dismissed_insights')
    return dismissed ? new Set(JSON.parse(dismissed)) : new Set()
  } catch (error) {
    log.warn('Could not load dismissed insights', { error })
    return new Set()
  }
}

/**
 * Save dismissed insights to localStorage
 */
function saveDismissedInsights(dismissed: Set<string>): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem('dismissed_insights', JSON.stringify(Array.from(dismissed)))
  } catch (error) {
    log.warn('Could not save dismissed insights', { error })
  }
}

/**
 * useInsightEngine Hook
 * Analyzes telemetry data and generates adaptive insights
 */
export function useInsightEngine(options: UseInsightEngineOptions = {}): UseInsightEngineReturn {
  const { campaignId, enabled = true, analysisIntervalMs = 120000, maxInsights = 5 } = options

  const [insights, setInsights] = useState<Insight[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const dismissedRef = useRef<Set<string>>(getDismissedInsights())
  const analysisTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  /**
   * Analyze telemetry data and generate insights
   */
  const analyzePatterns = useCallback(async () => {
    if (!isTelemetryEnabled() || !enabled) {
      log.debug('Telemetry disabled, skipping analysis')
      return
    }

    setIsAnalyzing(true)

    try {
      // Fetch telemetry summary
      const params = new URLSearchParams({ period: '7d' })
      if (campaignId) params.append('campaignId', campaignId)

      const response = await fetch(`/api/telemetry/summary?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      const summary = data.summary

      const newInsights: Insight[] = []

      // Pattern 1: Low save frequency (> 10 min between saves)
      if (summary.avgSaveIntervalMs !== null && summary.avgSaveIntervalMs > 10 * 60 * 1000) {
        const insightId = 'low-save-frequency'
        if (!dismissedRef.current.has(insightId)) {
          newInsights.push({
            id: insightId,
            type: 'suggestion',
            category: 'save',
            title: 'infrequent saves detected',
            message: `You save every ${Math.floor(summary.avgSaveIntervalMs / (1000 * 60))} minutes on average. Auto-save is enabled every 60s to prevent data loss.`,
            actionLabel: 'learn more',
            actionHref: '/docs/auto-save',
            priority: 2,
            createdAt: new Date().toISOString(),
          })
        }
      }

      // Pattern 2: High agent usage (> 5 runs in 7 days)
      if (summary.totalAgentRuns > 5) {
        const insightId = 'high-agent-usage'
        if (!dismissedRef.current.has(insightId)) {
          newInsights.push({
            id: insightId,
            type: 'achievement',
            category: 'agent',
            title: 'agent power user!',
            message: `You've run ${summary.totalAgentRuns} agent actions in the last 7 days. You're making great use of automation.`,
            priority: 3,
            createdAt: new Date().toISOString(),
          })
        }
      }

      // Pattern 3: No shares yet (but has saves)
      if (summary.totalShares === 0 && summary.totalSaves > 3) {
        const insightId = 'no-shares-yet'
        if (!dismissedRef.current.has(insightId)) {
          newInsights.push({
            id: insightId,
            type: 'suggestion',
            category: 'share',
            title: 'share your signal',
            message:
              'You have built a great flow scene. Consider sharing it with collaborators or for feedback.',
            actionLabel: 'share now',
            actionHref: '#share',
            priority: 2,
            createdAt: new Date().toISOString(),
          })
        }
      }

      // Pattern 4: Consistent daily usage (active 5+ days)
      if (summary.totalTimeInFlowMs > 5 * 60 * 60 * 1000) {
        // > 5 hours total
        const insightId = 'consistent-flow-state'
        if (!dismissedRef.current.has(insightId)) {
          newInsights.push({
            id: insightId,
            type: 'achievement',
            category: 'flow',
            title: 'flow state master',
            message: `You've spent ${Math.floor(summary.totalTimeInFlowMs / (1000 * 60 * 60))} hours in flow over the last 7 days. Keep up the momentum!`,
            priority: 1,
            createdAt: new Date().toISOString(),
          })
        }
      }

      // Pattern 5: First session (welcome message)
      if (summary.totalSaves === 0 && summary.totalAgentRuns === 0 && summary.totalShares === 0) {
        const insightId = 'first-session'
        if (!dismissedRef.current.has(insightId)) {
          newInsights.push({
            id: insightId,
            type: 'suggestion',
            category: 'flow',
            title: 'welcome to signal analytics',
            message:
              'Start working in the console to see insights about your flow state and productivity patterns.',
            priority: 1,
            createdAt: new Date().toISOString(),
          })
        }
      }

      // Sort by priority (1 = high, 3 = low) and limit to maxInsights
      newInsights.sort((a, b) => a.priority - b.priority)
      const limitedInsights = newInsights.slice(0, maxInsights)

      setInsights(limitedInsights)

      log.debug('Insights generated', { count: limitedInsights.length, summary })
    } catch (error) {
    log.error('Failed to analyze patterns', { error })
    } finally {
      setIsAnalyzing(false)
    }
  }, [campaignId, enabled, maxInsights])

  /**
   * Dismiss an insight
   */
  const dismissInsight = useCallback((id: string) => {
    dismissedRef.current.add(id)
    saveDismissedInsights(dismissedRef.current)

    setInsights((prev) => prev.filter((insight) => insight.id !== id))

    log.debug('Insight dismissed', { id })
  }, [])

  /**
   * Clear all insights
   */
  const clearInsights = useCallback(() => {
    setInsights([])
    log.debug('All insights cleared')
  }, [])

  /**
   * Setup: Run initial analysis and schedule periodic analysis
   */
  useEffect(() => {
    isMountedRef.current = true

    if (enabled && isTelemetryEnabled()) {
      // Run initial analysis after 5 seconds (avoid startup noise)
      const initialDelay = setTimeout(() => {
        if (isMountedRef.current) {
          analyzePatterns()
        }
      }, 5000)

      // Schedule periodic analysis
      analysisTimerRef.current = setInterval(() => {
        if (isMountedRef.current) {
          analyzePatterns()
        }
      }, analysisIntervalMs)

      return () => {
        isMountedRef.current = false
        clearTimeout(initialDelay)
        if (analysisTimerRef.current) {
          clearInterval(analysisTimerRef.current)
        }
      }
    }
  }, [enabled, analysisIntervalMs, analyzePatterns])

  return {
    insights,
    isAnalyzing,
    dismissInsight,
    clearInsights,
  }
}
