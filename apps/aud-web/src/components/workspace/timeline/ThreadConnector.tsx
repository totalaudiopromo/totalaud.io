/**
 * Thread Connector Component
 * Phase 2: Visual lines connecting events in the same thread
 *
 * Renders SVG paths between events that belong to the same Signal Thread
 * Shows thread name on hover
 */

'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSignalThreadStore } from '@/stores/useSignalThreadStore'
import type { TimelineEvent } from '@/types/timeline'

interface EventPosition {
  id: string
  x: number
  y: number
  threadId: string | null
}

interface ThreadConnectorProps {
  events: TimelineEvent[]
  getEventPosition: (date: Date) => number
  laneHeights: Map<string, { top: number; height: number }>
}

export function ThreadConnector({ events, getEventPosition, laneHeights }: ThreadConnectorProps) {
  const threads = useSignalThreadStore((state) => state.threads)
  const [hoveredThread, setHoveredThread] = useState<string | null>(null)

  // Calculate event positions for connector lines
  const eventPositions = useMemo(() => {
    const positions: EventPosition[] = []

    events.forEach((event) => {
      if (!event.threadId) return

      const laneInfo = laneHeights.get(event.lane)
      if (!laneInfo) return

      const x = getEventPosition(new Date(event.date))
      const y = laneInfo.top + laneInfo.height / 2

      positions.push({
        id: event.id,
        x,
        y,
        threadId: event.threadId,
      })
    })

    return positions
  }, [events, getEventPosition, laneHeights])

  // Group positions by thread
  const threadGroups = useMemo(() => {
    const groups = new Map<string, EventPosition[]>()

    eventPositions.forEach((pos) => {
      if (!pos.threadId) return
      const existing = groups.get(pos.threadId) || []
      existing.push(pos)
      groups.set(pos.threadId, existing)
    })

    // Sort each group by x position (date order)
    groups.forEach((positions, threadId) => {
      groups.set(
        threadId,
        positions.sort((a, b) => a.x - b.x)
      )
    })

    return groups
  }, [eventPositions])

  // Generate SVG path for a thread
  const generateThreadPath = (positions: EventPosition[]): string => {
    if (positions.length < 2) return ''

    // Create a smooth curve through all points
    let path = `M ${positions[0].x + 60} ${positions[0].y}` // Start from right edge of first event

    for (let i = 1; i < positions.length; i++) {
      const prev = positions[i - 1]
      const curr = positions[i]

      // Use bezier curves for smooth connections
      const cpX = (prev.x + curr.x) / 2 + 60
      path += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x + 60} ${curr.y}`
    }

    return path
  }

  // Don't render if no threads or positions
  if (threadGroups.size === 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <svg
        style={{
          width: '100%',
          height: '100%',
          overflow: 'visible',
        }}
      >
        <defs>
          {/* Glow filter for thread lines */}
          <filter id="thread-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {Array.from(threadGroups.entries()).map(([threadId, positions]) => {
          const thread = threads.find((t) => t.id === threadId)
          if (!thread || positions.length < 2) return null

          const path = generateThreadPath(positions)
          const isHovered = hoveredThread === threadId

          return (
            <g key={threadId}>
              {/* Background line (thicker, for hover detection) */}
              <motion.path
                d={path}
                fill="none"
                stroke="transparent"
                strokeWidth={20}
                style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                onMouseEnter={() => setHoveredThread(threadId)}
                onMouseLeave={() => setHoveredThread(null)}
              />

              {/* Visible line */}
              <motion.path
                d={path}
                fill="none"
                stroke={thread.colour}
                strokeWidth={isHovered ? 3 : 2}
                strokeLinecap="round"
                strokeDasharray={isHovered ? 'none' : '8 4'}
                opacity={isHovered ? 1 : 0.6}
                filter={isHovered ? 'url(#thread-glow)' : undefined}
                initial={false}
                animate={{
                  strokeWidth: isHovered ? 3 : 2,
                  opacity: isHovered ? 1 : 0.6,
                }}
                transition={{ duration: 0.15 }}
              />

              {/* Connection dots at each event */}
              {positions.map((pos) => (
                <motion.circle
                  key={pos.id}
                  cx={pos.x + 60}
                  cy={pos.y}
                  r={isHovered ? 5 : 4}
                  fill={thread.colour}
                  opacity={isHovered ? 1 : 0.7}
                  filter={isHovered ? 'url(#thread-glow)' : undefined}
                  initial={false}
                  animate={{
                    r: isHovered ? 5 : 4,
                    opacity: isHovered ? 1 : 0.7,
                  }}
                  transition={{ duration: 0.15 }}
                />
              ))}
            </g>
          )
        })}
      </svg>

      {/* Thread tooltip */}
      <AnimatePresence>
        {hoveredThread && <ThreadTooltip threadId={hoveredThread} threads={threads} />}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// Thread Tooltip
// ============================================================================

interface ThreadTooltipProps {
  threadId: string
  threads: ReturnType<typeof useSignalThreadStore.getState>['threads']
}

function ThreadTooltip({ threadId, threads }: ThreadTooltipProps) {
  const thread = threads.find((t) => t.id === threadId)
  if (!thread) return null

  // Get the thread type label
  const typeLabels: Record<string, string> = {
    narrative: 'Story Arc',
    campaign: 'Campaign',
    creative: 'Creative Thread',
    scene: 'Scene Thread',
    performance: 'Performance',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      transition={{ duration: 0.12 }}
      style={{
        position: 'fixed',
        bottom: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '8px 14px',
        backgroundColor: 'rgba(15, 17, 19, 0.95)',
        border: `1px solid ${thread.colour}40`,
        borderRadius: 8,
        boxShadow: `0 4px 20px ${thread.colour}20`,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        pointerEvents: 'auto',
        zIndex: 100,
      }}
    >
      {/* Thread colour indicator */}
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: thread.colour,
          boxShadow: `0 0 8px ${thread.colour}60`,
        }}
      />

      {/* Thread info */}
      <div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.95)',
            marginBottom: 2,
          }}
        >
          {thread.title}
        </div>
        <div
          style={{
            fontSize: 10,
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          {typeLabels[thread.threadType] || 'Thread'} • {thread.eventIds.length} events
        </div>
      </div>

      {/* Narrative preview if available */}
      {thread.narrativeSummary && (
        <div
          style={{
            marginLeft: 10,
            paddingLeft: 10,
            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: 11,
            color: 'rgba(255, 255, 255, 0.6)',
            maxWidth: 200,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {thread.narrativeSummary.slice(0, 50)}...
        </div>
      )}
    </motion.div>
  )
}
