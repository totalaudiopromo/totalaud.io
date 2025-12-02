/**
 * Draggable Event Component
 *
 * A draggable timeline event card with hover states and tooltips.
 * Uses @dnd-kit for drag functionality.
 */

'use client'

import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { motion, AnimatePresence } from 'framer-motion'
import type { TimelineEvent } from '@/types/timeline'

interface DraggableEventProps {
  event: TimelineEvent & { dateObj: Date }
  position: number
  isDragging: boolean
  onEdit?: () => void
}

export function DraggableEvent({ event, position, isDragging, onEdit }: DraggableEventProps) {
  const [isHovered, setIsHovered] = useState(false)

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: event.id,
    data: { event },
  })

  // Handle click to edit (only if not dragging)
  const handleClick = (e: React.MouseEvent) => {
    // Only trigger edit on actual click (not drag)
    if (!isDragging && onEdit) {
      onEdit()
    }
  }

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: isDragging ? 0.5 : 1,
        y: 0,
        scale: isDragging ? 0.95 : 1,
      }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'absolute',
        top: 12,
        left: position,
        padding: '8px 12px',
        backgroundColor: `${event.colour}15`,
        border: `1px solid ${event.colour}40`,
        borderRadius: 6,
        cursor: isDragging ? 'grabbing' : 'pointer',
        transition: 'box-shadow 0.12s ease, border-color 0.12s ease',
        boxShadow: isHovered && !isDragging ? `0 4px 12px ${event.colour}25` : 'none',
        borderColor: isHovered && !isDragging ? `${event.colour}60` : `${event.colour}40`,
        zIndex: isHovered || isDragging ? 10 : 1,
        maxWidth: 140,
        touchAction: 'none', // Required for touch drag
        ...style,
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

      {/* Tags (if present) */}
      {event.tags && event.tags.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
            marginTop: 6,
          }}
        >
          {event.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 9,
                padding: '2px 6px',
                backgroundColor: `${event.colour}20`,
                borderRadius: 4,
                color: 'rgba(255, 255, 255, 0.5)',
                textTransform: 'lowercase',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Tooltip on hover */}
      <AnimatePresence>
        {isHovered && !isDragging && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
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
              pointerEvents: 'none',
            }}
          >
            {event.description && <div style={{ marginBottom: 4 }}>{event.description}</div>}
            {event.url && (
              <div
                style={{
                  marginBottom: 4,
                  fontSize: 10,
                  color: '#3AA9BE',
                }}
              >
                Has link attached
              </div>
            )}
            <div
              style={{
                fontSize: 10,
                color: 'rgba(255, 255, 255, 0.4)',
                borderTop:
                  event.description || event.url ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                paddingTop: event.description || event.url ? 4 : 0,
              }}
            >
              Click to edit • Drag to move
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
