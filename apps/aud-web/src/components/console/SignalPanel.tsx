/**
 * SignalPanel Component
 * Phase 14.4: Signal Intelligence Panel
 *
 * Live panel showing:
 * - Artist identity (avatar, name, genre)
 * - Campaign intent (goal, horizon)
 * - Latest agent insights
 * - One-tap action buttons
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { flowCoreColours, flowCoreMotion } from '@aud-web/constants/flowCoreColours'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useSignalContext } from '@/hooks/useSignalContext'
import { toast } from 'sonner'
import {
  User,
  Target,
  Calendar,
  Sparkles,
  Radio,
  Music,
  FileText,
  TrendingUp,
  Zap,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'

interface SignalPanelProps {
  campaignId?: string
  isDrawerMode?: boolean
  onClose?: () => void
  emitActivity?: (event: string, metadata?: string) => void
}

const GOAL_ICONS = {
  radio: Radio,
  playlist: Music,
  press: FileText,
  growth: TrendingUp,
  experiment: Sparkles,
} as const

export function SignalPanel({
  campaignId,
  isDrawerMode = false,
  onClose,
  emitActivity,
}: SignalPanelProps) {
  const prefersReducedMotion = useReducedMotion()
  const { context, agentResults, isLoading, error, refetch } = useSignalContext(campaignId)
  const [isRunningAction, setIsRunningAction] = useState<string | null>(null)

  const animationDuration = prefersReducedMotion ? 0 : flowCoreMotion.normal / 1000

  // Helper to get initials from artist name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Execute agent with timeout and retries (Phase 14.8)
  const executeAgent = async (
    action: string,
    retries = 2,
    timeoutMs = 10000
  ): Promise<{ success: boolean; duration: number; summary?: string }> => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

      try {
        const startTime = Date.now()

        const response = await fetch('/api/agent/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            campaignId,
            context: {
              artist: context?.artist,
              goal: context?.goal,
            },
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        const duration = Date.now() - startTime

        return {
          success: true,
          duration,
          summary: data.summary,
        }
      } catch (err) {
        clearTimeout(timeoutId)

        // If this was the last retry, throw the error
        if (attempt === retries) {
          throw err
        }

        // Exponential backoff: 500ms, 1000ms
        const backoffMs = 500 * Math.pow(2, attempt)
        await new Promise((resolve) => setTimeout(resolve, backoffMs))
      }
    }

    // Should never reach here, but TypeScript needs this
    throw new Error('Max retries exceeded')
  }

  // Handle action button clicks (Phase 14.7 + 14.8)
  const handleAction = async (action: string) => {
    setIsRunningAction(action)

    try {
      // Execute agent with timeout and retries
      const { duration, summary } = await executeAgent(action)

      // Success toasts with FlowCore styling
      const toastMessages = {
        enrich: summary || `intel finished in ${duration} ms`,
        pitch: summary || 'pitch ready — check drafts',
        sync: summary || 'tracker synced ✅',
        insights: summary || 'insights updated',
      }

      toast.success(toastMessages[action as keyof typeof toastMessages] || `${action} completed`, {
        style: {
          background: flowCoreColours.darkGrey,
          color: flowCoreColours.textPrimary,
          border: `1px solid ${flowCoreColours.iceCyan}`, // Ice Cyan on success
          fontFamily: 'var(--font-mono)',
          fontSize: '14px',
          textTransform: 'lowercase',
        },
      })

      // Refresh signal context after agent completes
      refetch()

      // Emit agentRun event (Phase 14.8)
      emitActivity?.('agentRun', action)
    } catch (err) {
      const errorMessage =
        err instanceof Error && err.name === 'AbortError'
          ? `${action} timed out`
          : `${action} failed`

      toast.error(errorMessage, {
        style: {
          background: flowCoreColours.darkGrey,
          color: flowCoreColours.error,
          border: `1px solid ${flowCoreColours.error}`,
          fontFamily: 'var(--font-mono)',
          fontSize: '14px',
          textTransform: 'lowercase',
        },
      })
      console.error(`Action failed: ${action}`, err)
    } finally {
      setIsRunningAction(null)
    }
  }

  // Empty state
  if (!context && !isLoading && !error) {
    return (
      <div
        className="h-full flex items-center justify-center p-6"
        style={{
          backgroundColor: flowCoreColours.matteBlack,
          borderLeft: `2px solid ${flowCoreColours.borderGrey}`,
        }}
      >
        <div className="text-center space-y-4">
          <AlertCircle
            size={48}
            style={{ color: flowCoreColours.textTertiary, margin: '0 auto' }}
          />
          <p
            className="font-mono text-sm lowercase"
            style={{ color: flowCoreColours.textSecondary }}
          >
            no signal locked
          </p>
          <p
            className="font-mono text-xs lowercase"
            style={{ color: flowCoreColours.textTertiary }}
          >
            run operator to set your artist
          </p>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div
        className="h-full flex items-center justify-center p-6"
        style={{
          backgroundColor: flowCoreColours.matteBlack,
          borderLeft: `2px solid ${flowCoreColours.borderGrey}`,
        }}
      >
        <div className="text-center space-y-4">
          <Loader2
            size={48}
            className="animate-spin"
            style={{ color: flowCoreColours.slateCyan, margin: '0 auto' }}
          />
          <p
            className="font-mono text-sm lowercase"
            style={{ color: flowCoreColours.textSecondary }}
          >
            loading signal...
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div
        className="h-full flex items-center justify-center p-6"
        style={{
          backgroundColor: flowCoreColours.matteBlack,
          borderLeft: `2px solid ${flowCoreColours.borderGrey}`,
        }}
      >
        <div className="text-center space-y-4">
          <AlertCircle size={48} style={{ color: flowCoreColours.error, margin: '0 auto' }} />
          <p
            className="font-mono text-sm lowercase"
            style={{ color: flowCoreColours.textSecondary }}
          >
            couldn't load context
          </p>
          <button
            onClick={refetch}
            className="px-4 py-2 font-mono text-xs lowercase border rounded flex items-center gap-2 mx-auto transition-all"
            style={{
              borderColor: flowCoreColours.borderGrey,
              color: flowCoreColours.textSecondary,
            }}
          >
            <RefreshCw size={14} />
            retry
          </button>
        </div>
      </div>
    )
  }

  const GoalIcon = context?.goal ? GOAL_ICONS[context.goal] : Target

  return (
    <div
      className="h-full overflow-y-auto"
      style={{
        backgroundColor: flowCoreColours.matteBlack,
        borderLeft: isDrawerMode ? 'none' : `2px solid ${flowCoreColours.borderGrey}`,
      }}
    >
      {/* Grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          opacity: 0.02,
        }}
      />

      <div className="relative p-6 space-y-8">
        {/* Identity Section */}
        <section className="space-y-4">
          <h2
            className="font-mono text-xs uppercase tracking-wider"
            style={{ color: flowCoreColours.textTertiary }}
          >
            identity
          </h2>

          <div className="flex items-center gap-4">
            {/* Avatar */}
            {context?.imageUrl ? (
              <img
                src={context.imageUrl}
                alt={context.artist || 'Artist'}
                className="w-16 h-16 rounded-full object-cover"
                style={{ border: `2px solid ${flowCoreColours.borderGrey}` }}
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center font-mono text-lg font-semibold"
                style={{
                  backgroundColor: flowCoreColours.darkGrey,
                  border: `2px solid ${flowCoreColours.borderGrey}`,
                  color: flowCoreColours.slateCyan,
                }}
              >
                {context?.artist ? getInitials(context.artist) : 'AA'}
              </div>
            )}

            {/* Artist info */}
            <div className="flex-1 min-w-0">
              <p
                className="font-mono text-lg lowercase font-semibold truncate"
                style={{ color: flowCoreColours.textPrimary }}
              >
                {context?.artist || 'unknown artist'}
              </p>
              {context?.genre && (
                <p
                  className="font-mono text-xs lowercase truncate"
                  style={{ color: flowCoreColours.textSecondary }}
                >
                  {context.genre}
                </p>
              )}
              {context?.followers !== null &&
                context?.followers !== undefined &&
                context.followers > 0 && (
                  <p
                    className="font-mono text-xs lowercase"
                    style={{ color: flowCoreColours.textTertiary }}
                  >
                    {context.followers.toLocaleString()} listeners
                  </p>
                )}
            </div>
          </div>
        </section>

        {/* Intent Section */}
        <section className="space-y-4">
          <h2
            className="font-mono text-xs uppercase tracking-wider"
            style={{ color: flowCoreColours.textTertiary }}
          >
            intent
          </h2>

          <div className="space-y-3">
            {/* Goal chip */}
            {context?.goal && (
              <div
                className="inline-flex items-center gap-2 px-3 py-2 rounded font-mono text-sm lowercase"
                style={{
                  backgroundColor: `${flowCoreColours.slateCyan}15`,
                  border: `1px solid ${flowCoreColours.slateCyan}`,
                  color: flowCoreColours.slateCyan,
                }}
              >
                <GoalIcon size={16} />
                {context.goal}
              </div>
            )}

            {/* Horizon */}
            {context?.horizon !== undefined && (
              <div className="flex items-center gap-2">
                <Calendar size={16} style={{ color: flowCoreColours.textTertiary }} />
                <span
                  className="font-mono text-sm lowercase"
                  style={{ color: flowCoreColours.textSecondary }}
                >
                  {context.horizon} days horizon
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Insight Section */}
        <section className="space-y-4">
          <h2
            className="font-mono text-xs uppercase tracking-wider"
            style={{ color: flowCoreColours.textTertiary }}
          >
            latest insights
          </h2>

          {agentResults && agentResults.length > 0 ? (
            <div className="space-y-2">
              {agentResults.map((result) => (
                <div
                  key={result.agent}
                  className="p-3 rounded"
                  style={{
                    backgroundColor: flowCoreColours.darkGrey,
                    border: `1px solid ${flowCoreColours.borderGrey}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="font-mono text-xs lowercase font-semibold"
                      style={{ color: flowCoreColours.textPrimary }}
                    >
                      {result.agent}
                    </span>
                    <span
                      className="font-mono text-xs"
                      style={{ color: flowCoreColours.textTertiary }}
                    >
                      {result.tookMs}ms
                    </span>
                  </div>
                  {result.summary && (
                    <p
                      className="font-mono text-xs lowercase"
                      style={{ color: flowCoreColours.textSecondary }}
                    >
                      {result.summary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p
              className="font-mono text-xs lowercase"
              style={{ color: flowCoreColours.textTertiary }}
            >
              no agent runs yet
            </p>
          )}
        </section>

        {/* Actions Section */}
        <section className="space-y-4">
          <h2
            className="font-mono text-xs uppercase tracking-wider"
            style={{ color: flowCoreColours.textTertiary }}
          >
            actions
          </h2>

          <div className="grid grid-cols-1 gap-2">
            {[
              { id: 'enrich', label: 'enrich contacts', icon: Zap },
              { id: 'pitch', label: 'generate pitch', icon: FileText },
              { id: 'sync', label: 'sync tracking', icon: RefreshCw },
              { id: 'insights', label: 'generate insights', icon: Sparkles },
            ].map((action) => {
              const Icon = action.icon
              const isRunning = isRunningAction === action.id

              return (
                <button
                  key={action.id}
                  onClick={() => handleAction(action.id)}
                  disabled={isRunning}
                  className="px-4 py-3 font-mono text-sm lowercase font-medium rounded transition-all flex items-center gap-2 justify-center"
                  style={{
                    backgroundColor: isRunning
                      ? flowCoreColours.mediumGrey
                      : flowCoreColours.darkGrey,
                    border: `1px solid ${flowCoreColours.borderGrey}`,
                    color: isRunning ? flowCoreColours.textTertiary : flowCoreColours.textPrimary,
                    cursor: isRunning ? 'not-allowed' : 'pointer',
                    opacity: isRunning ? 0.6 : 1,
                  }}
                >
                  {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} />}
                  {action.label}
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
