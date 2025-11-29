/**
 * Next Steps Widget
 *
 * Displays the next 3 upcoming events in a compact, floating card.
 * Shows relative dates ("in 3 days", "tomorrow") with lane badges.
 */

'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTimelineStore } from '@/stores/useTimelineStore'
import { LANES, type TimelineEvent } from '@/types/timeline'

// ============================================================================
// Helpers
// ============================================================================

function getRelativeDate(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'overdue'
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'tomorrow'
  if (diffDays <= 7) return `in ${diffDays} days`
  if (diffDays <= 14) return 'next week'
  return `in ${Math.ceil(diffDays / 7)} weeks`
}

function getRelativeDateColour(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return '#EF4444' // Red for overdue
  if (diffDays === 0) return '#F59E0B' // Amber for today
  if (diffDays <= 3) return '#3AA9BE' // Cyan for soon
  return 'rgba(255, 255, 255, 0.5)' // Muted for later
}

// ============================================================================
// Component
// ============================================================================

interface NextStepsProps {
  maxItems?: number
  className?: string
}

export function NextSteps({ maxItems = 3, className }: NextStepsProps) {
  const events = useTimelineStore((state) => state.events)

  // Get upcoming events sorted by date
  const upcomingEvents = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    return events
      .map((event) => ({
        ...event,
        dateObj: new Date(event.date),
      }))
      .filter((event) => {
        const eventDate = new Date(
          event.dateObj.getFullYear(),
          event.dateObj.getMonth(),
          event.dateObj.getDate()
        )
        // Include today and future events, plus anything overdue (within 7 days)
        const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return diffDays >= -7 // Include up to 7 days overdue
      })
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
      .slice(0, maxItems)
  }, [events, maxItems])

  // If no upcoming events, show empty state
  if (upcomingEvents.length === 0) {
    return (
      <div
        className={className}
        style={{
          padding: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.04)',
          borderRadius: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 14 }}>📋</span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            Next Steps
          </span>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.4)',
          }}
        >
          No upcoming events. Add events from Scout or create them manually.
        </p>
      </div>
    )
  }

  return (
    <div
      className={className}
      style={{
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.04)',
        borderRadius: 10,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>📋</span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            Next Steps
          </span>
        </div>
        <span
          style={{
            fontSize: 11,
            color: 'rgba(255, 255, 255, 0.3)',
          }}
        >
          {upcomingEvents.length} upcoming
        </span>
      </div>

      {/* Event list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AnimatePresence mode="popLayout">
          {upcomingEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '10px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                borderRadius: 8,
              }}
            >
              {/* Lane indicator */}
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: LANES.find((l) => l.id === event.lane)?.colour ?? '#6B7280',
                  marginTop: 5,
                  flexShrink: 0,
                }}
              />

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'rgba(255, 255, 255, 0.85)',
                    marginBottom: 2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {event.title}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 11,
                  }}
                >
                  <span
                    style={{
                      color: getRelativeDateColour(event.dateObj),
                      fontWeight: 500,
                    }}
                  >
                    {getRelativeDate(event.dateObj)}
                  </span>
                  <span
                    style={{
                      color: 'rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    •
                  </span>
                  <span
                    style={{
                      color:
                        LANES.find((l) => l.id === event.lane)?.colour ??
                        'rgba(255, 255, 255, 0.4)',
                      textTransform: 'capitalize',
                    }}
                  >
                    {event.lane.replace('-', ' ')}
                  </span>
                </div>
              </div>

              {/* Date badge */}
              <div
                style={{
                  fontSize: 10,
                  color: 'rgba(255, 255, 255, 0.4)',
                  whiteSpace: 'nowrap',
                }}
              >
                {event.dateObj.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                })}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
