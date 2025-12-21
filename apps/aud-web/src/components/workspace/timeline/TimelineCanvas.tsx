/**
 * Timeline Canvas Component
 * 2025 Brand Pivot - Cinematic Editorial
 *
 * 5 swim lanes for release planning with drag-drop support:
 * - Pre-release (preparation)
 * - Release (launch day)
 * - Promo (promotion activities)
 * - Content (social/video content)
 * - Analytics (tracking & insights)
 */

'use client'

import { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { useTimelineStore } from '@/stores/useTimelineStore'
import { LANES, type LaneType, type TimelineEvent } from '@/types/timeline'
import { DraggableEvent } from './DraggableEvent'
import { DroppableLane } from './DroppableLane'
import { TimelineEventCard } from './TimelineEventCard'
import { EmptyState, emptyStates } from '@/components/ui/EmptyState'

// ============================================================================
// Helpers
// ============================================================================

function getWeeksInRange(start: Date, weeks: number): Date[] {
  const result: Date[] = []
  const current = new Date(start)
  for (let i = 0; i < weeks; i++) {
    result.push(new Date(current))
    current.setDate(current.getDate() + 7)
  }
  return result
}

function formatWeek(date: Date): string {
  const day = date.getDate()
  const month = date.toLocaleDateString('en-GB', { month: 'short' })
  return `${day} ${month}`
}

// ============================================================================
// Main Component
// ============================================================================

export function TimelineCanvas() {
  const events = useTimelineStore((state) => state.events)
  const updateEvent = useTimelineStore((state) => state.updateEvent)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Get the event being edited
  const editingEvent = useMemo(
    () => (editingEventId ? events.find((e) => e.id === editingEventId) : null),
    [events, editingEventId]
  )

  // Timeline starts from today and spans 12 weeks
  const today = useMemo(() => {
    const now = new Date()
    // Start from beginning of current week (Monday)
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(now.setDate(diff))
  }, [])
  const startDate = today
  const weeks = getWeeksInRange(startDate, 12)
  const weekWidth = 120

  // Calculate today's position for scrolling
  const getTodayPosition = useCallback((): number => {
    const now = new Date()
    const daysDiff = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, (daysDiff / 7) * weekWidth)
  }, [startDate, weekWidth])

  // Scroll to today on mount
  useEffect(() => {
    if (scrollRef.current) {
      const todayPos = getTodayPosition()
      scrollRef.current.scrollTo({
        left: todayPos,
        behavior: 'smooth',
      })
    }
  }, [getTodayPosition])

  // Handle Today button click
  const handleScrollToToday = useCallback(() => {
    if (scrollRef.current) {
      const todayPos = getTodayPosition()
      scrollRef.current.scrollTo({
        left: todayPos,
        behavior: 'smooth',
      })
    }
  }, [getTodayPosition])

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  )

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
  const getEventPosition = useCallback(
    (date: Date): number => {
      const daysDiff = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      return (daysDiff / 7) * weekWidth + 16
    },
    [startDate, weekWidth]
  )

  // Get the active event being dragged
  const activeEvent = useMemo(
    () => eventsWithDates.find((e) => e.id === activeId),
    [eventsWithDates, activeId]
  )

  // Drag handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverId(event.over?.id as string | null)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)
      setOverId(null)

      if (!over) return

      const eventId = active.id as string
      const targetLaneId = over.id as LaneType

      // Validate it's a valid lane
      const isValidLane = LANES.some((l) => l.id === targetLaneId)
      if (!isValidLane) return

      // Update the event's lane
      const currentEvent = events.find((e) => e.id === eventId)
      if (currentEvent && currentEvent.lane !== targetLaneId) {
        const laneColour = LANES.find((l) => l.id === targetLaneId)?.colour ?? currentEvent.colour
        updateEvent(eventId, {
          lane: targetLaneId,
          colour: laneColour,
        })
      }
    },
    [events, updateEvent]
  )

  const handleDragCancel = useCallback(() => {
    setActiveId(null)
    setOverId(null)
  }, [])

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundColor: '#0F1113',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        }}
      >
        {/* Empty state when no events */}
        {events.length === 0 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              backgroundColor: 'rgba(15, 17, 19, 0.95)',
            }}
          >
            <EmptyState
              title={emptyStates.timeline.firstTime.title}
              description={emptyStates.timeline.firstTime.description}
              variant="large"
              action={
                <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255, 255, 255, 0.3)' }}>
                  Visit <span style={{ color: '#3AA9BE' }}>Scout</span> to discover opportunities
                </div>
              }
            />
          </div>
        )}
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
            <DroppableLane
              key={lane.id}
              lane={lane}
              isOver={overId === lane.id}
              weekWidth={weekWidth}
            >
              {eventsWithDates
                .filter((e) => e.lane === lane.id)
                .map((event) => (
                  <DraggableEvent
                    key={event.id}
                    event={event}
                    position={getEventPosition(event.dateObj)}
                    isDragging={activeId === event.id}
                    onEdit={() => setEditingEventId(event.id)}
                  />
                ))}
            </DroppableLane>
          ))}
        </div>

        {/* Drag overlay - shows a copy of the dragged item */}
        <DragOverlay dropAnimation={{ duration: 240, easing: 'ease-out' }}>
          {activeEvent ? (
            <motion.div
              initial={{ scale: 1.05, opacity: 0.9 }}
              animate={{ scale: 1.08, opacity: 0.95 }}
              style={{
                padding: '8px 12px',
                backgroundColor: `${activeEvent.colour}25`,
                border: `2px solid ${activeEvent.colour}`,
                borderRadius: 6,
                boxShadow: `0 8px 24px ${activeEvent.colour}40`,
                maxWidth: 140,
                cursor: 'grabbing',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: activeEvent.colour,
                  marginBottom: 2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {activeEvent.title}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: 'rgba(255, 255, 255, 0.4)',
                }}
              >
                {activeEvent.dateObj.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                })}
              </div>
            </motion.div>
          ) : null}
        </DragOverlay>

        {/* Footer hint */}
        <div
          style={{
            padding: '12px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <span
            className="hidden md:inline"
            style={{
              fontSize: 12,
              color: 'rgba(255, 255, 255, 0.4)',
            }}
          >
            Drag events between lanes • Scroll to view weeks
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={handleScrollToToday}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 500,
                color: '#3AA9BE',
                backgroundColor: 'rgba(58, 169, 190, 0.1)',
                border: '1px solid rgba(58, 169, 190, 0.2)',
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(58, 169, 190, 0.15)'
                e.currentTarget.style.borderColor = 'rgba(58, 169, 190, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(58, 169, 190, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(58, 169, 190, 0.2)'
              }}
            >
              <span style={{ fontSize: 10 }}>◉</span>
              Today
            </button>
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
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {editingEvent && (
          <TimelineEventCard event={editingEvent} onClose={() => setEditingEventId(null)} />
        )}
      </AnimatePresence>
    </DndContext>
  )
}
