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
  music: {
    bg: 'rgba(34, 197, 94, 0.08)',
    border: 'rgba(34, 197, 94, 0.3)',
    text: '#22C55E',
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
      const tags: IdeaTag[] = ['content', 'brand', 'music', 'promo']
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
      transition={{
        duration: 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ scale: isSelected || isDragging ? 1 : 1.02 }}
      onClick={onSelect}
      onDoubleClick={handleDoubleClick}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 200,
        minHeight: 80,
        backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.03)',
        border: `1px solid ${isSelected ? tagColour.border : 'rgba(255, 255, 255, 0.08)'}`,
        borderRadius: 8,
        padding: 12,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        boxShadow: isSelected
          ? `0 0 0 1px ${tagColour.border}, 0 4px 12px rgba(0, 0, 0, 0.2)`
          : '0 2px 8px rgba(0, 0, 0, 0.15)',
        zIndex: isSelected || isDragging ? 100 : 1,
      }}
    >
      {/* Tag pill */}
      <button
        onClick={handleTagClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '2px 8px',
          backgroundColor: tagColour.bg,
          border: `1px solid ${tagColour.border}`,
          borderRadius: 12,
          fontSize: 10,
          fontWeight: 500,
          color: tagColour.text,
          textTransform: 'lowercase',
          cursor: 'pointer',
          marginBottom: 8,
          fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
        }}
      >
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
          style={{
            width: '100%',
            minHeight: 40,
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontSize: 13,
            lineHeight: 1.5,
            color: 'rgba(255, 255, 255, 0.9)',
            fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
          }}
        />
      ) : (
        <p
          style={{
            margin: 0,
            fontSize: 13,
            lineHeight: 1.5,
            color: 'rgba(255, 255, 255, 0.85)',
            fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {card.content || (
            <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>Double-click to edit...</span>
          )}
        </p>
      )}

      {/* Action buttons (visible on hover/select) */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: 4,
          }}
        >
          {/* Send to Timeline button */}
          {onSendToTimeline && (
            <button
              onClick={handleSendToTimeline}
              style={{
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(58, 169, 190, 0.1)',
                border: '1px solid rgba(58, 169, 190, 0.3)',
                borderRadius: 4,
                color: '#3AA9BE',
                fontSize: 11,
                cursor: 'pointer',
              }}
              aria-label="Send to Timeline"
              title="Add to Timeline"
            >
              →
            </button>
          )}
          {/* Delete button */}
          <button
            onClick={handleDeleteClick}
            style={{
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 4,
              color: '#EF4444',
              fontSize: 12,
              cursor: 'pointer',
            }}
            aria-label="Delete card"
          >
            ×
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
