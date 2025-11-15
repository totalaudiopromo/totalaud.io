'use client'

/**
 * Timeline Clip
 * Draggable and resizable clip with card link indicators
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { TimelineClip } from '@totalaud/os-state/campaign'
import { useTimeline, useCards } from '@totalaud/os-state/campaign'
import { Heart, Link2 } from 'lucide-react'

interface ClipProps {
  clip: TimelineClip
  trackHeight: number
}

export function Clip({ clip, trackHeight }: ClipProps) {
  const { timeline, updateClip, moveClip, resizeClip, selectClips } = useTimeline()
  const { getCardsForClip } = useCards()
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartTime, setDragStartTime] = useState(0)
  const [resizeStartWidth, setResizeStartWidth] = useState(0)

  const clipRef = useRef<HTMLDivElement>(null)

  const isSelected = timeline.selectedClipIds.includes(clip.id)
  const linkedCards = getCardsForClip(clip.id)
  const hasCards = linkedCards.length > 0

  const clipWidth = clip.duration * timeline.zoom
  const clipLeft = clip.startTime * timeline.zoom

  // Drag handling
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).classList.contains('resize-handle')) return

      e.stopPropagation()
      setIsDragging(true)
      setDragStartX(e.clientX)
      setDragStartTime(clip.startTime)
      selectClips([clip.id])
    },
    [clip.id, clip.startTime, selectClips]
  )

  const handleDrag = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return

      const deltaX = e.clientX - dragStartX
      const deltaTime = deltaX / timeline.zoom
      const newStartTime = Math.max(0, dragStartTime + deltaTime)

      // Update clip position in real-time
      moveClip(clip.id, clip.trackId, newStartTime)
    },
    [isDragging, dragStartX, dragStartTime, timeline.zoom, clip.id, clip.trackId, moveClip]
  )

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Resize handling
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setIsResizing(true)
      setDragStartX(e.clientX)
      setResizeStartWidth(clipWidth)
    },
    [clipWidth]
  )

  const handleResize = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return

      const deltaX = e.clientX - dragStartX
      const newWidth = Math.max(timeline.gridSize * timeline.zoom, resizeStartWidth + deltaX)
      const newDuration = newWidth / timeline.zoom

      resizeClip(clip.id, newDuration)
    },
    [isResizing, dragStartX, resizeStartWidth, timeline.zoom, timeline.gridSize, clip.id, resizeClip]
  )

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false)
  }, [])

  // Mouse event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag)
      window.addEventListener('mouseup', handleDragEnd)
      return () => {
        window.removeEventListener('mousemove', handleDrag)
        window.removeEventListener('mouseup', handleDragEnd)
      }
    }
  }, [isDragging, handleDrag, handleDragEnd])

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResize)
      window.addEventListener('mouseup', handleResizeEnd)
      return () => {
        window.removeEventListener('mousemove', handleResize)
        window.removeEventListener('mouseup', handleResizeEnd)
      }
    }
  }, [isResizing, handleResize, handleResizeEnd])

  return (
    <motion.div
      ref={clipRef}
      className={`absolute cursor-move select-none overflow-hidden rounded ${
        isSelected
          ? 'ring-2 ring-[var(--flowcore-colour-accent)] ring-offset-1 ring-offset-[var(--flowcore-colour-bg)]'
          : ''
      }`}
      style={{
        left: `${clipLeft}px`,
        width: `${clipWidth}px`,
        top: '4px',
        height: `${trackHeight - 8}px`,
        backgroundColor: clip.colour,
        opacity: isDragging || isResizing ? 0.7 : 1,
        zIndex: isDragging || isResizing ? 10 : 1,
      }}
      onMouseDown={handleMouseDown}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.12 }}
    >
      {/* Clip content */}
      <div className="flex h-full flex-col px-2 py-1">
        <div className="flex items-centre gap-1">
          {/* Card link indicator */}
          {hasCards && (
            <div className="rounded-full bg-white/20 p-0.5" title={`${linkedCards.length} card(s) linked`}>
              <Heart size={10} fill="currentColor" />
            </div>
          )}

          {/* Clip name */}
          <span className="truncate font-mono text-xs font-medium text-white">
            {clip.name}
          </span>
        </div>

        {/* Agent source badge */}
        {clip.agentSource && (
          <div className="mt-1 w-fit rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/80">
            {clip.agentSource}
          </div>
        )}

        {/* Card count */}
        {hasCards && (
          <div className="mt-auto flex items-centre gap-1 font-mono text-[10px] text-white/60">
            <Link2 size={8} />
            {linkedCards.length} card{linkedCards.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Resize handle */}
      <div
        className="resize-handle absolute bottom-0 right-0 top-0 w-2 cursor-ew-resize bg-white/0 transition-colours hover:bg-white/20"
        onMouseDown={handleResizeStart}
      />
    </motion.div>
  )
}
