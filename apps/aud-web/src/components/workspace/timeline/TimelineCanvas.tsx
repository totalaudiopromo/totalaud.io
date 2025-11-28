/**
 * Timeline Canvas Component
 * 2025 Brand Pivot - Cinematic Editorial
 *
 * 5 swim lanes for release planning:
 * - Pre-release (preparation)
 * - Release (launch day)
 * - Promo (promotion activities)
 * - Content (social/video content)
 * - Analytics (tracking & insights)
 */

'use client'

import { useState, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTimelineStore } from '@/stores/useTimelineStore'
import { LANES } from '@/types/timeline'

// Helper to get weeks array
function getWeeksInRange(start: Date, weeks: number): Date[] {
  const result: Date[] = []
  const current = new Date(start)
  for (let i = 0; i < weeks; i++) {
    result.push(new Date(current))
    current.setDate(current.getDate() + 7)
  }
  return result
}

// Format date for display
function formatWeek(date: Date): string {
  const day = date.getDate()
  const month = date.toLocaleDateString('en-GB', { month: 'short' })
  return `${day} ${month}`
}

export function TimelineCanvas() {
  // Use the Timeline store
  const events = useTimelineStore((state) => state.events)
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Timeline spans 12 weeks from Jan 1, 2025
  const startDate = new Date(2025, 0, 1)
  const weeks = getWeeksInRange(startDate, 12)
  const weekWidth = 120

  // Convert ISO date strings to Date objects for positioning
  const eventsWithDates = useMemo(
    () =>
      events.map((event) => ({
        ...event,
        dateObj: new Date(event.date),
      })),
    [events]
  )

  // Calculate event position
  const getEventPosition = (date: Date): number => {
    const daysDiff = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    return (daysDiff / 7) * weekWidth + 16
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#0F1113',
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
      }}
    >
      {/* Timeline header with weeks */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        {/* Lane labels column */}
        <div
          style={{
            width: 100,
            minWidth: 100,
            flexShrink: 0,
            borderRight: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '12px 12px',
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Lanes
          </span>
        </div>

        {/* Week headers - scrollable */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowX: 'auto',
            display: 'flex',
          }}
        >
          {weeks.map((week, i) => (
            <div
              key={i}
              style={{
                width: weekWidth,
                flexShrink: 0,
                padding: '12px 8px',
                borderRight: '1px solid rgba(255, 255, 255, 0.03)',
                textAlign: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.5)',
                }}
              >
                {formatWeek(week)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Lanes */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {LANES.map((lane) => (
          <div
            key={lane.id}
            style={{
              flex: 1,
              display: 'flex',
              borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
              minHeight: 80,
            }}
          >
            {/* Lane label */}
            <div
              style={{
                width: 100,
                minWidth: 100,
                flexShrink: 0,
                borderRight: '1px solid rgba(255, 255, 255, 0.06)',
                padding: '12px 10px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 6,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: lane.colour,
                  marginTop: 4,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: lane.colour,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {lane.label}
              </span>
            </div>

            {/* Lane content - scrollable */}
            <div
              style={{
                flex: 1,
                position: 'relative',
                overflowX: 'auto',
                background: `repeating-linear-gradient(
                  to right,
                  transparent,
                  transparent ${weekWidth - 1}px,
                  rgba(255, 255, 255, 0.02) ${weekWidth - 1}px,
                  rgba(255, 255, 255, 0.02) ${weekWidth}px
                )`,
              }}
            >
              {/* Events in this lane */}
              {eventsWithDates
                .filter((e) => e.lane === lane.id)
                .map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    onMouseEnter={() => setHoveredEvent(event.id)}
                    onMouseLeave={() => setHoveredEvent(null)}
                    style={{
                      position: 'absolute',
                      top: 12,
                      left: getEventPosition(event.dateObj),
                      padding: '8px 12px',
                      backgroundColor: `${event.colour}15`,
                      border: `1px solid ${event.colour}40`,
                      borderRadius: 6,
                      cursor: 'pointer',
                      transition: 'transform 0.12s ease, box-shadow 0.12s ease',
                      transform: hoveredEvent === event.id ? 'scale(1.02)' : 'scale(1)',
                      boxShadow:
                        hoveredEvent === event.id ? `0 4px 12px ${event.colour}25` : 'none',
                      zIndex: hoveredEvent === event.id ? 10 : 1,
                      maxWidth: 140,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: event.colour,
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
                        fontSize: 10,
                        color: 'rgba(255, 255, 255, 0.4)',
                      }}
                    >
                      {event.dateObj.toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </div>

                    {/* Tooltip on hover */}
                    {hoveredEvent === event.id && event.description && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          marginTop: 8,
                          padding: '8px 12px',
                          backgroundColor: '#1A1D21',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: 6,
                          fontSize: 11,
                          color: 'rgba(255, 255, 255, 0.7)',
                          whiteSpace: 'nowrap',
                          zIndex: 20,
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                        }}
                      >
                        {event.description}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <div
        style={{
          padding: '12px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.4)',
          }}
        >
          Scroll horizontally to view more weeks
        </span>
        <span
          style={{
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.3)',
          }}
        >
          {events.length} events
        </span>
      </div>
    </div>
  )
}
