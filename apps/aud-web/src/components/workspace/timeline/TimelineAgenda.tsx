/**
 * Timeline Agenda — the mobile face of the Release Timeline.
 *
 * The desktop timeline is a horizontal, drag-between-lanes grid (TimelineCanvas).
 * On a phone that grid forces ~1400px of content through a ~360px viewport and
 * pits touch-drag against scroll — cramped and fiddly. This view is the calm
 * mobile alternative: one vertical, chronological list grouped by month, with a
 * lane filter and tap-to-edit. No horizontal scroll, no drag. Lane changes,
 * date edits and deletes all happen in the existing TimelineEventCard sheet, so
 * nothing about the data model or the store changes.
 */

'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTimelineStore } from '@/stores/useTimelineStore'
import { LANE_MAP, type LaneType, type TimelineEvent } from '@/types/timeline'
import { TimelineEventCard } from './TimelineEventCard'
import { EmptyState, emptyStates } from '@/components/ui/EmptyState'
import { CrossModePrompt } from '@/components/workspace/CrossModePrompt'

type LaneFilter = LaneType | 'all'

const FILTERS: { id: LaneFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pre-release', label: 'Pre' },
  { id: 'release', label: 'Release' },
  { id: 'post-release', label: 'Post' },
]

/** Midnight today, so "past" is a whole-day comparison rather than time-of-day. */
function startOfToday(): number {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
}

function monthKey(date: Date): string {
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

interface Section {
  key: string
  events: (TimelineEvent & { dateObj: Date })[]
}

export function TimelineAgenda() {
  const events = useTimelineStore((state) => state.events)
  const [filter, setFilter] = useState<LaneFilter>('all')
  const [editingEventId, setEditingEventId] = useState<string | null>(null)

  const editingEvent = useMemo(
    () => (editingEventId ? (events.find((e) => e.id === editingEventId) ?? null) : null),
    [events, editingEventId]
  )

  // Sort ascending, filter by lane, group by month.
  const sections = useMemo<Section[]>(() => {
    const withDates = events
      .map((event) => ({ ...event, dateObj: new Date(event.date) }))
      .filter((event) => filter === 'all' || event.lane === filter)
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())

    const grouped: Section[] = []
    for (const event of withDates) {
      const key = monthKey(event.dateObj)
      const last = grouped[grouped.length - 1]
      if (last && last.key === key) {
        last.events.push(event)
      } else {
        grouped.push({ key, events: [event] })
      }
    }
    return grouped
  }, [events, filter])

  const laneCounts = useMemo(() => {
    const counts: Record<LaneFilter, number> = {
      all: events.length,
      'pre-release': 0,
      release: 0,
      'post-release': 0,
    }
    for (const event of events) counts[event.lane] += 1
    return counts
  }, [events])

  const today = startOfToday()

  // Empty state — matches the desktop canvas so the two views feel like one.
  if (events.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: 24,
          backgroundColor: '#0F1113',
        }}
      >
        <EmptyState
          title={emptyStates.timeline.firstTime.title}
          description={emptyStates.timeline.firstTime.description}
          variant="large"
          action={<CrossModePrompt currentMode="timeline" />}
        />
      </div>
    )
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
      {/* Lane filter — replaces the W/M/Q scale toggle, which is meaningless
          without a horizontal axis. */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: '12px 16px',
          overflowX: 'auto',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          flexShrink: 0,
        }}
      >
        {FILTERS.map((f) => {
          const active = filter === f.id
          const accent = f.id === 'all' ? '#3AA9BE' : LANE_MAP[f.id].colour
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 999,
                border: `1px solid ${active ? accent : 'rgba(255, 255, 255, 0.1)'}`,
                backgroundColor: active ? `${accent}1F` : 'transparent',
                color: active ? accent : 'rgba(255, 255, 255, 0.6)',
                fontSize: 13,
                fontWeight: 500,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              {f.label}
              <span style={{ opacity: 0.6, fontSize: 12 }}>{laneCounts[f.id]}</span>
            </button>
          )
        })}
      </div>

      {/* Agenda list */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 24px' }}>
        {sections.length === 0 && (
          <p
            style={{
              padding: '32px 8px',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.4)',
              fontSize: 13,
            }}
          >
            Nothing in this lane yet.
          </p>
        )}

        {sections.map((section) => (
          <div key={section.key} style={{ marginTop: 16 }}>
            <h3
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 1,
                margin: 0,
                padding: '6px 0',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'rgba(255, 255, 255, 0.4)',
                backgroundColor: '#0F1113',
              }}
            >
              {section.key}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
              {section.events.map((event) => {
                const lane = LANE_MAP[event.lane]
                const isPast = event.dateObj.getTime() < today
                return (
                  <motion.button
                    key={event.id}
                    type="button"
                    onClick={() => setEditingEventId(event.id)}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      display: 'flex',
                      alignItems: 'stretch',
                      gap: 12,
                      width: '100%',
                      textAlign: 'left',
                      padding: 12,
                      borderRadius: 12,
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      cursor: 'pointer',
                      opacity: isPast ? 0.55 : 1,
                    }}
                  >
                    {/* Date column */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 44,
                        borderRight: '1px solid rgba(255, 255, 255, 0.06)',
                        paddingRight: 12,
                      }}
                    >
                      <span
                        style={{ fontSize: 18, fontWeight: 600, color: '#F7F8F9', lineHeight: 1 }}
                      >
                        {event.dateObj.getDate()}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          color: 'rgba(255, 255, 255, 0.4)',
                          marginTop: 3,
                        }}
                      >
                        {event.dateObj.toLocaleDateString('en-GB', { weekday: 'short' })}
                      </span>
                    </div>

                    {/* Body */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 999,
                            backgroundColor: lane.colour,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 11,
                            color: lane.colour,
                            fontWeight: 500,
                          }}
                        >
                          {lane.label}
                        </span>
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 14,
                          fontWeight: 500,
                          color: '#F7F8F9',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {event.title}
                      </p>
                      {event.description && (
                        <p
                          style={{
                            margin: '2px 0 0',
                            fontSize: 12,
                            color: 'rgba(255, 255, 255, 0.45)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {event.description}
                        </p>
                      )}
                      {event.tags && event.tags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                          {event.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              style={{
                                fontSize: 10,
                                padding: '2px 6px',
                                borderRadius: 4,
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                color: 'rgba(255, 255, 255, 0.5)',
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Edit sheet — reuses the desktop modal (lane, date, delete, outcomes) */}
      <AnimatePresence>
        {editingEvent && (
          <TimelineEventCard event={editingEvent} onClose={() => setEditingEventId(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
