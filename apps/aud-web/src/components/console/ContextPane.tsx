/**
 * Context Pane - Dynamic Center Content
 *
 * Switches between Plan, Do, Track, Learn modes based on activeMode.
 * Uses AnimatePresence for smooth horizontal slide transitions.
 * Stage 6: Connected to Supabase realtime data
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useConsoleStore } from '@aud-web/stores/consoleStore'
import { consolePalette } from '@aud-web/themes/consolePalette'
import { useState, useEffect } from 'react'
import {
  getSupabaseClient,
  type CampaignMetrics,
  type CampaignEvent,
  type CampaignInsight,
} from '@/lib/supabaseClient'
import { subscribeToCampaignEvents, unsubscribeFromCampaignEvents } from '@/lib/realtime'
import { FlowPane } from './FlowPane'

// Helper function to format timestamps
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins === 1) return '1 minute ago'
  if (diffMins < 60) return `${diffMins} minutes ago`
  if (diffHours === 1) return '1 hour ago'
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays === 1) return '1 day ago'
  return `${diffDays} days ago`
}

// Helper function to determine next action
function getNextAction(status: string, created: Date): string | null {
  if (status === 'replied') return 'Schedule interview'
  if (status === 'opened') return null
  if (status === 'sent') {
    const daysSince = Math.floor((new Date().getTime() - created.getTime()) / 86400000)
    const daysUntilFollowUp = 3 - daysSince
    if (daysUntilFollowUp > 0) {
      return `Follow up in ${daysUntilFollowUp} day${daysUntilFollowUp === 1 ? '' : 's'}`
    }
    return 'Follow up now'
  }
  return null
}

// Mode-specific content components
function PlanMode({ onAddEvent }: { onAddEvent: (message: string) => void }) {
  const [releaseName, setReleaseName] = useState('')
  const [releaseDate, setReleaseDate] = useState('')
  const [feedback, setFeedback] = useState<{ message: string; timestamp: string } | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (releaseName && releaseDate) {
      onAddEvent(`Release planned: "${releaseName}" on ${releaseDate}`)

      // Show inline feedback
      const now = new Date()
      setFeedback({
        message: 'Saved',
        timestamp: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      })

      // Persist to localStorage
      localStorage.setItem(
        'currentRelease',
        JSON.stringify({
          name: releaseName,
          date: releaseDate,
          updatedAt: now.toISOString(),
        })
      )

      setReleaseName('')
      setReleaseDate('')

      // Clear feedback after 3 seconds
      setTimeout(() => setFeedback(null), 3000)
    }
  }

  // Load saved release on mount
  useEffect(() => {
    const saved = localStorage.getItem('currentRelease')
    if (saved) {
      const { name, date } = JSON.parse(saved)
      setReleaseName(name)
      setReleaseDate(date)
    }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: consolePalette.spacing.gap }}>
      <p style={{ color: consolePalette.text.secondary, marginBottom: '16px' }}>
        Define your release information to start planning your campaign.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <div>
          <label
            htmlFor="release-name"
            style={{
              display: 'block',
              fontSize: consolePalette.typography.fontSize.small,
              color: consolePalette.text.tertiary,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Release Name
          </label>
          <input
            id="release-name"
            type="text"
            value={releaseName}
            onChange={(e) => setReleaseName(e.target.value)}
            placeholder="Enter track or album name"
            style={{
              width: '100%',
              padding: consolePalette.spacing.elementPadding,
              backgroundColor: consolePalette.background.tertiary,
              border: `1px solid ${consolePalette.border.default}`,
              borderRadius: '6px',
              color: consolePalette.text.primary,
              fontSize: consolePalette.typography.fontSize.body,
              fontFamily: consolePalette.typography.fontFamily,
            }}
          />
        </div>

        <div>
          <label
            htmlFor="release-date"
            style={{
              display: 'block',
              fontSize: consolePalette.typography.fontSize.small,
              color: consolePalette.text.tertiary,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Release Date
          </label>
          <input
            id="release-date"
            type="date"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
            style={{
              width: '100%',
              padding: consolePalette.spacing.elementPadding,
              backgroundColor: consolePalette.background.tertiary,
              border: `1px solid ${consolePalette.border.default}`,
              borderRadius: '6px',
              color: consolePalette.text.primary,
              fontSize: consolePalette.typography.fontSize.body,
              fontFamily: consolePalette.typography.fontFamily,
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="submit"
            style={{
              flex: 1,
              padding: consolePalette.spacing.elementPadding,
              backgroundColor: consolePalette.accent.primary,
              color: consolePalette.background.primary,
              border: 'none',
              borderRadius: '6px',
              fontSize: consolePalette.typography.fontSize.body,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = consolePalette.accent.hover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = consolePalette.accent.primary
            }}
          >
            Save Release Info
          </button>

          {feedback && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              style={{
                fontSize: consolePalette.typography.fontSize.small,
                color: consolePalette.accent.primary,
                whiteSpace: 'nowrap',
              }}
            >
              {feedback.message} • Last updated {feedback.timestamp}
            </motion.div>
          )}
        </div>
      </form>
    </div>
  )
}

function DoMode({ onAddEvent }: { onAddEvent: (message: string) => void }) {
  const [pitchTarget, setPitchTarget] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pitchTarget) {
      onAddEvent(`Pitch launched to: ${pitchTarget}`)

      // Show success feedback
      setFeedback(`Pitch sent to ${pitchTarget} (queued)`)

      setPitchTarget('')

      // Clear feedback after 3 seconds
      setTimeout(() => setFeedback(null), 3000)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: consolePalette.spacing.gap }}>
      <p style={{ color: consolePalette.text.secondary, marginBottom: '16px' }}>
        Execute your campaign by launching pitches to curators and contacts.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <div>
          <label
            htmlFor="pitch-target"
            style={{
              display: 'block',
              fontSize: consolePalette.typography.fontSize.small,
              color: consolePalette.text.tertiary,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Pitch Target
          </label>
          <input
            id="pitch-target"
            type="text"
            value={pitchTarget}
            onChange={(e) => setPitchTarget(e.target.value)}
            placeholder="e.g., BBC Radio 1, Spotify Editorial"
            style={{
              width: '100%',
              padding: consolePalette.spacing.elementPadding,
              backgroundColor: consolePalette.background.tertiary,
              border: `1px solid ${consolePalette.border.default}`,
              borderRadius: '6px',
              color: consolePalette.text.primary,
              fontSize: consolePalette.typography.fontSize.body,
              fontFamily: consolePalette.typography.fontFamily,
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: consolePalette.spacing.elementPadding,
            backgroundColor: consolePalette.accent.primary,
            color: consolePalette.background.primary,
            border: 'none',
            borderRadius: '6px',
            fontSize: consolePalette.typography.fontSize.body,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = consolePalette.accent.hover
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = consolePalette.accent.primary
          }}
        >
          Launch Pitch
        </button>
      </form>

      {/* Success Feedback */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
            padding: consolePalette.spacing.elementPadding,
            backgroundColor: consolePalette.background.tertiary,
            border: `1px solid ${consolePalette.accent.primary}`,
            borderRadius: '6px',
            fontSize: consolePalette.typography.fontSize.small,
            color: consolePalette.accent.primary,
          }}
        >
          ✓ {feedback}
        </motion.div>
      )}

      <div
        style={{
          marginTop: '24px',
          padding: consolePalette.spacing.elementPadding,
          backgroundColor: consolePalette.background.tertiary,
          border: `1px solid ${consolePalette.border.default}`,
          borderRadius: '6px',
          fontSize: consolePalette.typography.fontSize.small,
          color: consolePalette.text.tertiary,
        }}
      >
        <strong style={{ color: consolePalette.text.secondary }}>Tip:</strong> Use ⌘K to access
        "generate pitch" and "find curators" commands.
      </div>
    </div>
  )
}

function TrackMode() {
  const { activeCampaignId } = useConsoleStore()
  const [progress, setProgress] = useState({
    pitchesSent: 0,
    pitchesTotal: 50,
    opened: 0,
    replied: 0,
    openRate: 0,
    replyRate: 0,
  })
  const [timeline, setTimeline] = useState<
    Array<{
      status: string
      contact: string
      time: string
      next: string | null
    }>
  >([])
  const [loading, setLoading] = useState(true)

  // Fetch campaign metrics from Supabase
  useEffect(() => {
    if (!activeCampaignId) {
      setLoading(false)
      return
    }

    const fetchMetrics = async () => {
      const supabase = getSupabaseClient()

      // Fetch campaign metrics
      const { data: metricsData, error: metricsError } = (await supabase
        .from('campaign_metrics')
        .select('*')
        .eq('campaign_id', activeCampaignId!)
        .single()) as { data: CampaignMetrics | null; error: any }

      if (metricsError) {
        console.error('[ContextPane] Failed to fetch campaign metrics', metricsError)
      } else if (metricsData) {
        setProgress({
          pitchesSent: metricsData.pitches_sent,
          pitchesTotal: metricsData.pitches_total,
          opened: metricsData.opens,
          replied: metricsData.replies,
          openRate: metricsData.open_rate,
          replyRate: metricsData.reply_rate,
        })
      }

      // Fetch recent events for timeline
      const { data: eventsData, error: eventsError } = (await supabase
        .from('campaign_events')
        .select('*')
        .eq('campaign_id', activeCampaignId!)
        .order('created_at', { ascending: false })
        .limit(10)) as { data: CampaignEvent[] | null; error: any }

      if (eventsError) {
        console.error('[ContextPane] Failed to fetch campaign events', eventsError)
      } else if (eventsData) {
        const timelineEvents = eventsData.map((event) => ({
          status: event.status,
          contact: event.target,
          time: formatTimeAgo(new Date(event.created_at)),
          next: getNextAction(event.status, new Date(event.created_at)),
        }))
        setTimeline(timelineEvents)
      }

      setLoading(false)
    }

    fetchMetrics()

    // Subscribe to metrics updates
    const subscription = subscribeToCampaignEvents({
      campaignId: activeCampaignId,
      onEvent: () => {
        fetchMetrics() // Refetch when new events come in
      },
      onMetricsUpdate: () => {
        fetchMetrics() // Refetch when metrics are updated
      },
    })

    return () => {
      unsubscribeFromCampaignEvents()
    }
  }, [activeCampaignId])

  const progressPercentage =
    progress.pitchesTotal > 0 ? Math.round((progress.pitchesSent / progress.pitchesTotal) * 100) : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'replied':
        return consolePalette.accent.primary
      case 'opened':
        return consolePalette.grid.lineWarning
      case 'sent':
        return consolePalette.text.secondary
      default:
        return consolePalette.text.tertiary
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'replied':
        return '✓'
      case 'opened':
        return '◉'
      case 'sent':
        return '→'
      default:
        return '•'
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: consolePalette.spacing.gap }}>
        <p style={{ color: consolePalette.text.tertiary, textAlign: 'center', padding: '40px 0' }}>
          Loading campaign metrics...
        </p>
      </div>
    )
  }

  if (!activeCampaignId) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: consolePalette.spacing.gap }}>
        <p style={{ color: consolePalette.text.tertiary, textAlign: 'center', padding: '40px 0' }}>
          No active campaign. Create a release in Plan mode to start tracking progress.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: consolePalette.spacing.gap }}>
      <p style={{ color: consolePalette.text.secondary, marginBottom: '16px' }}>
        See how your campaign is resonating with curators and contacts.
      </p>

      {/* Progress Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span
            style={{
              fontSize: consolePalette.typography.fontSize.small,
              color: consolePalette.text.tertiary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Campaign Progress
          </span>
          <span
            style={{
              fontSize: consolePalette.typography.fontSize.small,
              color: consolePalette.accent.primary,
              fontWeight: 600,
            }}
          >
            {progress.pitchesSent} / {progress.pitchesTotal} pitches
          </span>
        </div>
        <div
          style={{
            height: '8px',
            backgroundColor: consolePalette.background.tertiary,
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              height: '100%',
              backgroundColor: consolePalette.accent.primary,
            }}
          />
        </div>
        <div
          style={{
            marginTop: '8px',
            fontSize: consolePalette.typography.fontSize.small,
            color: consolePalette.text.tertiary,
          }}
        >
          {progress.opened} opened • {progress.replied} replied
        </div>
      </div>

      {/* Timeline */}
      <div style={{ marginTop: '16px' }}>
        <h4
          style={{
            fontSize: consolePalette.typography.fontSize.small,
            color: consolePalette.text.tertiary,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '12px',
          }}
        >
          Recent Activity
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {timeline.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              style={{
                padding: consolePalette.spacing.elementPadding,
                backgroundColor: consolePalette.background.tertiary,
                border: `1px solid ${consolePalette.border.default}`,
                borderRadius: '6px',
                borderLeft: `3px solid ${getStatusColor(event.status)}`,
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}
              >
                <span
                  style={{
                    fontSize: consolePalette.typography.fontSize.small,
                    color: getStatusColor(event.status),
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {getStatusIcon(event.status)} {event.status}
                </span>
                <span
                  style={{
                    fontSize: consolePalette.typography.fontSize.small,
                    color: consolePalette.text.tertiary,
                  }}
                >
                  {event.time}
                </span>
              </div>
              <div style={{ color: consolePalette.text.primary, marginBottom: '4px' }}>
                {event.contact}
              </div>
              {event.next && (
                <div
                  style={{
                    fontSize: consolePalette.typography.fontSize.small,
                    color: consolePalette.accent.primary,
                    marginTop: '8px',
                    padding: '6px 8px',
                    backgroundColor: 'rgba(58, 169, 190, 0.1)', // Slate Cyan
                    borderRadius: '4px',
                  }}
                >
                  Next: {event.next}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function LearnMode() {
  const { activeCampaignId } = useConsoleStore()
  const [insights, setInsights] = useState<
    Array<{
      title: string
      insight: string
      metric: string
      trend: 'up' | 'down' | 'neutral'
    }>
  >([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  // Fetch campaign insights from Supabase
  useEffect(() => {
    if (!activeCampaignId) {
      setLoading(false)
      return
    }

    const fetchInsights = async () => {
      const supabase = getSupabaseClient()

      const { data, error } = (await supabase
        .from('campaign_insights')
        .select('*')
        .eq('campaign_id', activeCampaignId!)
        .order('created_at', { ascending: false })
        .limit(5)) as { data: CampaignInsight[] | null; error: any }

      if (error) {
        console.error('[ContextPane] Failed to fetch campaign insights', error)
      } else if (data && data.length > 0) {
        const formattedInsights = data.map((insight) => ({
          title: insight.key,
          insight: insight.value,
          metric: insight.metric,
          trend: insight.trend,
        }))
        setInsights(formattedInsights)
      }

      setLoading(false)
    }

    fetchInsights()

    // Subscribe to new insights
    // @ts-expect-error - RealtimeConfig type incomplete
    const subscription = subscribeToCampaignEvents({
      campaignId: activeCampaignId,
      onInsightGenerated: () => {
        fetchInsights() // Refetch when new insights are generated
      },
    })

    return () => {
      unsubscribeFromCampaignEvents()
    }
  }, [activeCampaignId])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: consolePalette.spacing.gap }}>
        <p style={{ color: consolePalette.text.tertiary, textAlign: 'center', padding: '40px 0' }}>
          Loading campaign insights...
        </p>
      </div>
    )
  }

  if (!activeCampaignId || insights.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: consolePalette.spacing.gap }}>
        <p style={{ color: consolePalette.text.secondary, marginBottom: '16px' }}>
          Discover what's working and refine your approach for the next campaign.
        </p>
        <p style={{ color: consolePalette.text.tertiary, textAlign: 'center', padding: '40px 0' }}>
          No insights yet. Insights will be generated automatically as your campaign progresses.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: consolePalette.spacing.gap }}>
      <p style={{ color: consolePalette.text.secondary, marginBottom: '16px' }}>
        Discover what's working and refine your approach for the next campaign.
      </p>

      {/* Insights Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {insights.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
              padding: consolePalette.spacing.panePadding,
              backgroundColor: consolePalette.background.tertiary,
              border: `1px solid ${consolePalette.border.default}`,
              borderRadius: '6px',
              borderLeft: `3px solid ${consolePalette.accent.primary}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '8px',
              }}
            >
              <h4
                style={{
                  fontSize: consolePalette.typography.fontSize.body,
                  fontWeight: 600,
                  color: consolePalette.text.primary,
                }}
              >
                {item.title}
              </h4>
              <span
                style={{
                  fontSize: consolePalette.typography.fontSize.h3,
                  fontWeight: 600,
                  color:
                    item.trend === 'up'
                      ? consolePalette.accent.primary
                      : consolePalette.text.secondary,
                }}
              >
                {item.metric}
              </span>
            </div>
            <p
              style={{
                fontSize: consolePalette.typography.fontSize.small,
                color: consolePalette.text.secondary,
                lineHeight: '1.5',
              }}
            >
              {item.insight}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Generate Insights CTA */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        disabled={generating || !activeCampaignId}
        onClick={async () => {
          if (!activeCampaignId) return

          setGenerating(true)
          try {
            const response = await fetch('/api/insights/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ campaignId: activeCampaignId }),
            })

            if (response.ok) {
              const data = await response.json()
              console.log('[ContextPane] Insights generated', data.count)
              // Insights will be automatically loaded via realtime subscription
            } else {
              const error = await response.json()
              console.error('[ContextPane] Failed to generate insights', error)
            }
          } catch (error) {
            console.error('[ContextPane] Error generating insights', error)
          } finally {
            setGenerating(false)
          }
        }}
        style={{
          marginTop: '16px',
          padding: consolePalette.spacing.elementPadding,
          backgroundColor: 'transparent',
          color: generating ? consolePalette.text.tertiary : consolePalette.accent.primary,
          border: `1px solid ${generating ? consolePalette.border.default : consolePalette.accent.primary}`,
          borderRadius: '6px',
          fontSize: consolePalette.typography.fontSize.body,
          fontWeight: 600,
          cursor: generating ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s',
          opacity: generating ? 0.5 : 1,
        }}
        onMouseEnter={(e) => {
          if (!generating) {
            e.currentTarget.style.backgroundColor = 'rgba(58, 169, 190, 0.1)' // Slate Cyan
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        {generating ? 'Generating insights...' : 'Generate New Insights'}
      </motion.button>

      {/* Historical Comparison */}
      <div
        style={{
          marginTop: '24px',
          padding: consolePalette.spacing.elementPadding,
          backgroundColor: consolePalette.background.tertiary,
          border: `1px solid ${consolePalette.border.default}`,
          borderRadius: '6px',
        }}
      >
        <div
          style={{
            fontSize: consolePalette.typography.fontSize.small,
            color: consolePalette.text.tertiary,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '8px',
          }}
        >
          Campaign Comparison
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            fontSize: consolePalette.typography.fontSize.small,
          }}
        >
          <div>
            <div style={{ color: consolePalette.text.tertiary }}>This Campaign</div>
            <div
              style={{
                color: consolePalette.text.primary,
                fontWeight: 600,
                fontSize: consolePalette.typography.fontSize.body,
              }}
            >
              24% open rate
            </div>
          </div>
          <div>
            <div style={{ color: consolePalette.text.tertiary }}>Previous</div>
            <div
              style={{
                color: consolePalette.text.secondary,
                fontWeight: 600,
                fontSize: consolePalette.typography.fontSize.body,
              }}
            >
              21% open rate
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ContextPane({ onAddEvent }: { onAddEvent: (message: string) => void }) {
  const { activeMode } = useConsoleStore()

  // Horizontal slide transition - 20px slide + fade
  const slideVariants = {
    initial: (direction: number) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.15,
        ease: [0.25, 0.1, 0.25, 1], // easeOutSoft
      },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -20 : 20,
      opacity: 0,
      transition: {
        duration: 0.15,
        ease: [0.25, 0.1, 0.25, 1],
      },
    }),
  }

  // Track mode order for slide direction
  const modeOrder = ['plan', 'do', 'track', 'learn']
  const currentIndex = modeOrder.indexOf(activeMode)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: consolePalette.spacing.gap,
        height: '100%',
      }}
    >
      {/* Mode Header */}
      <div
        style={{
          fontSize: consolePalette.typography.fontSize.h3,
          fontWeight: 600,
          color: consolePalette.accent.primary,
          textTransform: 'uppercase',
          letterSpacing: consolePalette.typography.letterSpacing.wide,
          paddingBottom: consolePalette.spacing.elementPadding,
          borderBottom: `1px solid ${consolePalette.border.default}`,
          flexShrink: 0,
        }}
      >
        {activeMode}
      </div>

      {/* Dynamic Content with AnimatePresence */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <AnimatePresence mode="wait" custom={currentIndex}>
          <motion.div
            key={activeMode}
            custom={currentIndex}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {activeMode === 'plan' && (
              <div style={{ height: '100%', width: '100%' }}>
                <FlowPane />
              </div>
            )}
            {activeMode === 'do' && <DoMode onAddEvent={onAddEvent} />}
            {activeMode === 'track' && <TrackMode />}
            {activeMode === 'learn' && <LearnMode />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
