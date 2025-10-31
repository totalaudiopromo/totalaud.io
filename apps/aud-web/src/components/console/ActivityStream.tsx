/**
 * Activity Stream - Center Pane
 *
 * Live feed of agent actions + workflow events
 * Stage 6: Connected to Supabase realtime events
 * Stage 8.5: Collaborative visual accents + CSS variable migration (Slate Cyan)
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useConsoleStore } from '@aud-web/stores/consoleStore'
import { subscribeToCampaignEvents, unsubscribeFromCampaignEvents } from '@/lib/realtime'
import type { CampaignEvent } from '@/lib/supabaseClient'
import type { Collaborator } from '@/lib/realtimePresence'

interface ActivityEvent {
  id: string
  timestamp: Date
  type:
    | 'pitch_sent'
    | 'pitch_opened'
    | 'pitch_replied'
    | 'workflow_started'
    | 'release_planned'
    | 'agent'
    | 'workflow'
    | 'error'
  target?: string
  message: string
  user_id?: string // ID of user who triggered this event
}

// Theme colors for collaborator borders (matching PresenceAvatars)
const themeColors: Record<string, string> = {
  ascii: '#3AA9BE', // Slate Cyan (updated)
  xp: '#0078D7', // Blue
  aqua: '#007AFF', // Blue
  daw: '#FF6B35', // Orange
  analogue: '#D4A574', // Warm brown
}

interface ActivityStreamProps {
  /** Active collaborators for showing colored accents */
  collaborators?: Collaborator[]
  /** Current user ID to distinguish own actions */
  currentUserId?: string
}

export function ActivityStream({ collaborators = [], currentUserId }: ActivityStreamProps = {}) {
  const {
    activityFilter,
    timeRange,
    activeCampaignId,
    events: realtimeEvents,
    addEvent,
  } = useConsoleStore()
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [pendingEvents, setPendingEvents] = useState<ActivityEvent[]>([])
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Subscribe to realtime events when campaign is active
  useEffect(() => {
    if (!activeCampaignId) {
      console.log('[ActivityStream] No active campaign, skipping realtime subscription')
      return
    }

    console.log('[ActivityStream] Subscribing to campaign events', activeCampaignId)

    const subscription = subscribeToCampaignEvents({
      campaignId: activeCampaignId,
      onEvent: (event: CampaignEvent) => {
        console.log('[ActivityStream] Realtime event received', event)
        addEvent(event)
      },
    })

    return () => {
      console.log('[ActivityStream] Unsubscribing from campaign events')
      unsubscribeFromCampaignEvents()
    }
  }, [activeCampaignId, addEvent])

  // Convert Supabase events to ActivityEvent format and batch them
  useEffect(() => {
    if (realtimeEvents.length === 0) return

    const convertedEvents: ActivityEvent[] = realtimeEvents.map((event) => ({
      id: event.id,
      timestamp: new Date(event.created_at),
      type: event.type,
      target: event.target,
      message: event.message,
    }))

    setPendingEvents(convertedEvents)
  }, [realtimeEvents])

  // Batch render pending events every 5 seconds for smooth animation
  useEffect(() => {
    const renderTimer = setInterval(() => {
      setPendingEvents((pending) => {
        if (pending.length === 0) return pending

        setEvents((prev) => [...pending.reverse(), ...prev.slice(0, 195)])
        return []
      })
    }, 5000)

    return () => {
      clearInterval(renderTimer)
    }
  }, [])

  // Filter events based on filter setting
  const filteredEvents = events.filter((event) => {
    if (activityFilter === 'all') return true
    if (activityFilter === 'agents') return event.type === 'agent'
    if (activityFilter === 'workflows')
      return event.type === 'workflow' || event.type === 'workflow_started'
    if (activityFilter === 'errors') return event.type === 'error'
    return true
  })

  // Map event types to display categories
  const getEventCategory = (type: ActivityEvent['type']) => {
    if (type === 'pitch_sent' || type === 'pitch_opened' || type === 'pitch_replied') return 'pitch'
    if (type === 'workflow_started') return 'workflow'
    if (type === 'release_planned') return 'release'
    return type
  }

  // Map event types to colors (CSS variables - Slate Cyan)
  const getEventColor = (type: ActivityEvent['type']) => {
    const category = getEventCategory(type)
    if (category === 'pitch' || category === 'agent') return 'var(--accent)'
    if (category === 'workflow') return 'var(--text-secondary)'
    if (category === 'release') return 'var(--warning)'
    if (category === 'error') return 'var(--error)'
    return 'var(--text-secondary)'
  }

  // Get collaborator info for event
  const getCollaboratorInfo = (event: ActivityEvent) => {
    if (!event.user_id) return null
    return collaborators.find((c) => c.user_id === event.user_id)
  }

  // Get border style for event (collaborative visual accent)
  const getEventBorderStyle = (event: ActivityEvent) => {
    const isOwnAction = event.user_id === currentUserId
    const collaborator = getCollaboratorInfo(event)

    if (!collaborator) {
      // No collaborator info - default border
      return {
        border: '1px solid var(--border)',
      }
    }

    const borderColor = themeColors[collaborator.theme] || 'var(--accent)'

    if (isOwnAction) {
      // Own actions: subtle glow (20% opacity)
      return {
        border: '1px solid var(--border)',
        boxShadow: `0 0 12px ${borderColor}33`, // 20% opacity
      }
    } else {
      // Other collaborators: 3px solid border-left with theme color
      return {
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${borderColor}`,
      }
    }
  }

  // Get tooltip text for event
  const getEventTooltip = (event: ActivityEvent) => {
    const collaborator = getCollaboratorInfo(event)
    if (!collaborator) return undefined

    const name = collaborator.user_name || collaborator.user_email || 'Unknown user'
    return `${name} triggered this action`
  }

  // Spring motion config - 240ms tight spring
  const springVariants = {
    initial: { y: 12, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 30,
        mass: 0.8,
        duration: 0.24,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.15 },
    },
  }

  return (
    <div
      data-testid="activity-stream"
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', height: '100%' }}
    >
      {/* Filter Bar */}
      <div
        data-testid="activity-filter-bar"
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          paddingBottom: 'var(--space-3)',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Filter: {activityFilter}
        </span>
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>•</span>
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Range: {timeRange}</span>
      </div>

      {/* Event List with Spring Motion */}
      <div
        ref={scrollContainerRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          overflowY: 'auto',
          flex: 1,
        }}
      >
        {filteredEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 0' }}
          >
            No activity yet. Waiting for events...
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {filteredEvents.map((event, index) => {
              // Dim older entries (index > 5) to 60% opacity
              const isOlder = index > 5
              const eventOpacity = isOlder ? 0.6 : 1
              const borderStyle = getEventBorderStyle(event)
              const tooltip = getEventTooltip(event)

              return (
                <motion.div
                  key={event.id}
                  data-testid={`activity-event-${event.type}`}
                  variants={springVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  layout
                  title={tooltip}
                  style={{
                    padding: 'var(--space-3)',
                    backgroundColor: 'var(--surface)',
                    ...borderStyle,
                    borderRadius: '6px',
                    fontSize: '14px',
                    opacity: eventOpacity,
                    cursor: tooltip ? 'help' : 'default',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '4px',
                    }}
                  >
                    <span
                      style={{
                        color: getEventColor(event.type),
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        fontSize: '10px',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {getEventCategory(event.type)}
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>
                      {event.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-primary)' }}>
                    {event.message}
                    {event.target && (
                      <span style={{ color: 'var(--text-secondary)' }}> → {event.target}</span>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
