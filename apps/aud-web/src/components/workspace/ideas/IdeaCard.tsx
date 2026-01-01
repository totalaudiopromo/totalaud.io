/**
 * IdeaCard Component
 *
 * Phase 6: MVP Pivot - Ideas Canvas
 *
 * A draggable idea card with tag colour coding.
 * Design: Calm, minimal, inspired by Muse App / FigJam.
 */

'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import type { IdeaCard as IdeaCardType, IdeaTag } from '@/stores/useIdeasStore'
import { transition, duration } from '@/lib/motion'

const TAG_COLOURS: Record<IdeaTag, { bg: string; border: string; text: string }> = {
  content: {
    bg: 'rgba(58, 169, 190, 0.08)',
    border: 'rgba(58, 169, 190, 0.3)',
    text: '#3AA9BE',
  },
  brand: {
    bg: 'rgba(168, 85, 247, 0.08)',
    border: 'rgba(168, 85, 247, 0.3)',
    text: '#A855F7',
  },
  promo: {
    bg: 'rgba(249, 115, 22, 0.08)',
    border: 'rgba(249, 115, 22, 0.3)',
    text: '#F97316',
  },
}

interface IdeaCardProps {
  card: IdeaCardType
  isSelected: boolean
  onSelect: () => void
  onMove: (position: { x: number; y: number }) => void
  onUpdate: (updates: Partial<Pick<IdeaCardType, 'content' | 'tag'>>) => void
  onDelete: () => void
  onSendToTimeline?: () => void
}

export function IdeaCard({
  card,
  isSelected,
  onSelect,
  onMove,
  onUpdate,
  onDelete,
  onSendToTimeline,
}: IdeaCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [editContent, setEditContent] = useState(card.content)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const tagColour = TAG_COLOURS[card.tag]

  const handleDragStart = useCallback(() => {
    setIsDragging(true)
    onSelect()
  }, [onSelect])

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number; y: number } }) => {
      setIsDragging(false)
      onMove({
        x: card.position.x + info.offset.x,
        y: card.position.y + info.offset.y,
      })
    },
    [card.position, onMove]
  )

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true)
    setEditContent(card.content)
    setTimeout(() => {
      textareaRef.current?.focus()
      textareaRef.current?.select()
    }, 0)
  }, [card.content])

  const handleBlur = useCallback(() => {
    if (editContent.trim() !== card.content) {
      onUpdate({ content: editContent.trim() })
    }
    setIsEditing(false)
  }, [editContent, card.content, onUpdate])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditContent(card.content)
        setIsEditing(false)
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleBlur()
      }
    },
    [card.content, handleBlur]
  )

  const handleTagClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      const tags: IdeaTag[] = ['content', 'brand', 'promo']
      const currentIndex = tags.indexOf(card.tag)
      const nextTag = tags[(currentIndex + 1) % tags.length]
      onUpdate({ tag: nextTag })
    },
    [card.tag, onUpdate]
  )

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onDelete()
    },
    [onDelete]
  )

  const handleSendToTimeline = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onSendToTimeline?.()
    },
    [onSendToTimeline]
  )

  return (
    <motion.div
      ref={cardRef}
      drag
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        scale: 1,
        x: card.position.x,
        y: card.position.y,
      }}
      transition={transition.normal}
      whileHover={{ scale: isSelected || isDragging ? 1 : 1.02 }}
      onClick={onSelect}
      onDoubleClick={handleDoubleClick}
      className={`
        absolute w-[180px] sm:w-[220px] min-h-[90px] sm:min-h-[100px] p-3 sm:p-4 rounded-xl backdrop-blur-md transition-all duration-200 group
        ${isDragging ? 'cursor-grabbing z-50 scale-105 shadow-2xl' : 'cursor-grab z-10'}
        ${
          isSelected
            ? 'bg-[#161A1D] border-ta-cyan/40 shadow-[0_0_20px_-5px_rgba(58,169,190,0.3)]'
            : 'bg-[#161A1D]/80 border-white/5 hover:border-white/20 hover:bg-[#161A1D] shadow-lg'
        }
        border touch-none
      `}
      style={{
        boxShadow: isSelected
          ? `0 0 0 1px ${tagColour.border}, 0 8px 24px -4px rgba(0, 0, 0, 0.4)`
          : undefined,
      }}
    >
      {/* Tag pill */}
      <button
        onClick={handleTagClick}
        aria-label={`Category: ${card.tag}. Click to change category`}
        className="
          inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 mb-2 sm:mb-3
          rounded-full text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider
          border transition-all hover:scale-105
        "
        style={{
          backgroundColor: `${tagColour.bg}15`,
          borderColor: tagColour.border,
          color: tagColour.text,
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: tagColour.text }}
          aria-hidden="true"
        />
        {card.tag}
      </button>

      {/* Content */}
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full min-h-[50px] sm:min-h-[60px] bg-transparent border-none outline-none resize-none text-xs sm:text-sm text-ta-white leading-relaxed font-sans placeholder:text-ta-grey/30"
          autoFocus
        />
      ) : (
        <p className="text-xs sm:text-sm text-ta-white/90 leading-relaxed font-sans whitespace-pre-wrap word-break">
          {card.content || <span className="text-ta-grey/40 italic">Double-click to edit...</span>}
        </p>
      )}

      {/* Action buttons (visible on hover/select) */}
      <div
        className={`absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-1 sm:gap-1.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        style={{ transitionDuration: `${duration.normal * 1000}ms` }}
      >
        {/* Send to Timeline button */}
        {onSendToTimeline && (
          <button
            onClick={handleSendToTimeline}
            className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded bg-ta-cyan/10 border border-ta-cyan/20 text-ta-cyan hover:bg-ta-cyan hover:text-ta-black transition-colors"
            aria-label="Send to Timeline"
            title="Add to Timeline"
          >
            <span className="text-[10px] sm:text-xs">→</span>
          </button>
        )}
        {/* Delete button */}
        <button
          onClick={handleDeleteClick}
          className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
          aria-label="Delete card"
        >
          <span className="text-xs sm:text-sm">×</span>
        </button>
      </div>
    </motion.div>
  )
}
