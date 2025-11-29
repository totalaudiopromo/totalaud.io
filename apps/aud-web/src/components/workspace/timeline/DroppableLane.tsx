/**
 * Droppable Lane Component
 *
 * A drop zone for timeline events. Highlights when an event is dragged over it.
 * Uses @dnd-kit for drop functionality.
 */

'use client'

import { useDroppable } from '@dnd-kit/core'
import type { Lane } from '@/types/timeline'
import type { ReactNode } from 'react'

interface DroppableLaneProps {
  lane: Lane
  isOver: boolean
  weekWidth: number
  children: ReactNode
}

export function DroppableLane({ lane, isOver, weekWidth, children }: DroppableLaneProps) {
  const { setNodeRef } = useDroppable({
    id: lane.id,
    data: { lane },
  })

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
        minHeight: 80,
        backgroundColor: isOver ? `${lane.colour}08` : 'transparent',
        transition: 'background-color 0.2s ease',
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
          backgroundColor: isOver ? `${lane.colour}05` : 'transparent',
          transition: 'background-color 0.2s ease',
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
            boxShadow: isOver ? `0 0 8px ${lane.colour}60` : 'none',
            transition: 'box-shadow 0.2s ease',
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

      {/* Lane content - scrollable, droppable area */}
      <div
        ref={setNodeRef}
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
          // Highlight border when dragging over
          boxShadow: isOver ? `inset 0 0 0 2px ${lane.colour}40` : 'none',
          transition: 'box-shadow 0.2s ease',
        }}
      >
        {children}
      </div>
    </div>
  )
}
