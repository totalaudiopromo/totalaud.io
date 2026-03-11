/**
 * Timeline Canvas Component
 * 2025 Brand Pivot - Cinematic Editorial
 *
 * 3 swim lanes for release planning with drag-drop support:
 * - Pre-release (preparation)
 * - Release (launch day)
 * - Post-release (promotion, content, analytics)
 *
 * Phase 2: Signal Threads integration
 * - Visual connectors between threaded events
 * - Side panel for thread management
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
import { useTimelineStore, type ViewScale } from '@/stores/useTimelineStore'
import { useSignalThreadStore } from '@/stores/useSignalThreadStore'
import { useTrackContext } from '@/hooks/useTrackContext'
import { LANES, type LaneType, type TimelineEvent } from '@/types/timeline'
import { DraggableEvent } from './DraggableEvent'
import { DroppableLane } from './DroppableLane'
import { TimelineEventCard } from './TimelineEventCard'
import { ThreadConnector } from './ThreadConnector'
import { ThreadsPanel } from './ThreadsPanel'
import { EmptyState, emptyStates } from '@/components/ui/EmptyState'
import { CrossModePrompt } from '@/components/workspace/CrossModePrompt'

import {
  getWeeksInRange,
  getMonthsInRange,
  getQuartersInRange,
  formatWeek,
  formatMonth,
  formatQuarter,
  VIEW_SCALE_CONFIG,
} from './TimelineUtils'
import { TimelineHeader } from './TimelineHeader'
import { TimelineFooter } from './TimelineFooter'

// ============================================================================
// Main Component
// ============================================================================

export function TimelineCanvas() {
  const events = useTimelineStore((state) => state.events)
  const updateEvent = useTimelineStore((state) => state.updateEvent)

  // Track memory context (Read-only integration)
  const { intent } = useTrackContext()
  const viewScale = useTimelineStore((state) => state.viewScale)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [threadsPanelOpen, setThreadsPanelOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lanesRef = useRef<HTMLDivElement>(null)

  // Signal Threads integration
  const loadThreads = useSignalThreadStore((state) => state.loadFromSupabase)

  // Load threads on mount
  useEffect(() => {
    loadThreads()
  }, [loadThreads])

  // Calculate lane heights for ThreadConnector
  const laneHeights = useMemo(() => {
    const heights = new Map<string, { top: number; height: number }>()
    const laneHeight = 80 // Approximate lane height
    LANES.forEach((lane, index) => {
      heights.set(lane.id, {
        top: index * laneHeight + laneHeight / 2,
        height: laneHeight,
      })
    })
    return heights
  }, [])

  // Get the event being edited
  const editingEvent = useMemo(
    () => (editingEventId ? events.find((e) => e.id === editingEventId) : null),
    [events, editingEventId]
  )

  // Get view scale configuration
  const scaleConfig = VIEW_SCALE_CONFIG[viewScale]
  const columnWidth = scaleConfig.columnWidth

  // Timeline starts from today and spans based on view scale
  const startDate = useMemo(() => {
    const now = new Date()
    if (viewScale === 'weeks') {
      // Start from beginning of current week (Monday)
      const day = now.getDay()
      const diff = now.getDate() - day + (day === 0 ? -6 : 1)
      return new Date(now.setDate(diff))
    } else if (viewScale === 'months') {
      // Start from beginning of current month
      return new Date(now.getFullYear(), now.getMonth(), 1)
    } else {
      // Start from beginning of current quarter
      const quarterMonth = Math.floor(now.getMonth() / 3) * 3
      return new Date(now.getFullYear(), quarterMonth, 1)
    }
  }, [viewScale])

  // Get time columns based on view scale
  const timeColumns = useMemo(() => {
    switch (viewScale) {
      case 'weeks':
        return getWeeksInRange(startDate, scaleConfig.count)
      case 'months':
        return getMonthsInRange(startDate, scaleConfig.count)
      case 'quarters':
        return getQuartersInRange(startDate, scaleConfig.count)
    }
  }, [viewScale, startDate, scaleConfig.count])

  // Format column header based on view scale
  const formatColumnHeader = useCallback(
    (date: Date): string => {
      switch (viewScale) {
        case 'weeks':
          return formatWeek(date)
        case 'months':
          return formatMonth(date)
        case 'quarters':
          return formatQuarter(date)
      }
    },
    [viewScale]
  )

  // Calculate today's position for scrolling
  const getTodayPosition = useCallback((): number => {
    const now = new Date()
    const daysDiff = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, (daysDiff / scaleConfig.daysPerUnit) * columnWidth)
  }, [startDate, scaleConfig.daysPerUnit, columnWidth])

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
      return (daysDiff / scaleConfig.daysPerUnit) * columnWidth + 16
    },
    [startDate, scaleConfig.daysPerUnit, columnWidth]
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
        role="region"
        aria-label="Timeline canvas - plan your release activities"
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
              action={<CrossModePrompt currentMode="timeline" />}
            />
          </div>
        )}

        {/* Track Context Anchor (Read-only integration) */}
        {intent && (
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              backgroundColor: 'rgba(58, 169, 190, 0.02)',
            }}
          >
            <h3
              style={{
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'rgba(58, 169, 190, 0.5)',
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              Release Focus
            </h3>
            <p
              style={{
                fontSize: 13,
                color: 'rgba(255, 255, 255, 0.7)',
                fontStyle: 'italic',
                margin: 0,
              }}
            >
              "{intent.content}"
            </p>
          </div>
        )}

        {/* Timeline header with time columns */}
        <TimelineHeader
          ref={scrollRef}
          timeColumns={timeColumns || []}
          columnWidth={columnWidth}
          formatColumnHeader={formatColumnHeader}
        />

        {/* Lanes */}
        <div
          ref={lanesRef}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            position: 'relative',
          }}
        >
          {LANES.map((lane) => (
            <DroppableLane
              key={lane.id}
              lane={lane}
              isOver={overId === lane.id}
              weekWidth={columnWidth}
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

          {/* Thread connectors overlay */}
          <ThreadConnector
            events={events}
            getEventPosition={getEventPosition}
            laneHeights={laneHeights}
          />
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
        <TimelineFooter
          threadsPanelOpen={threadsPanelOpen}
          setThreadsPanelOpen={setThreadsPanelOpen}
          handleScrollToToday={handleScrollToToday}
          eventCount={events.length}
        />

        {/* Threads Panel */}
        <ThreadsPanel isOpen={threadsPanelOpen} onClose={() => setThreadsPanelOpen(false)} />
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
