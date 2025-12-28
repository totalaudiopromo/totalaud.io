/**
 * IdeasCanvas Component
 *
 * Phase 6: MVP Pivot - Ideas Canvas
 *
 * An infinite canvas for dragging idea cards.
 * Design: Light grid, calm, minimal.
 */

'use client'

import { useCallback, useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  useIdeasStore,
  selectFilteredCards,
  selectHasStarterIdeas,
  type IdeaTag,
  type IdeaCard as IdeaCardType,
} from '@/stores/useIdeasStore'
import { useTimelineStore } from '@/stores/useTimelineStore'
import { useToast } from '@/contexts/ToastContext'
import { useIdeasUndo, useIdeasUndoKeyboard } from '@/hooks/useIdeasUndo'
import { IdeaCard } from './IdeaCard'
import { EmptyState, emptyStates } from '@/components/ui/EmptyState'
import { getLaneColour, type LaneType } from '@/types/timeline'

// Detect touch device
function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false)
  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])
  return isTouch
}

interface IdeasCanvasProps {
  className?: string
}

export function IdeasCanvas({ className }: IdeasCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [startPan, setStartPan] = useState({ x: 0, y: 0 })
  const isTouchDevice = useIsTouchDevice()

  // Store state
  const cards = useIdeasStore(selectFilteredCards)
  const selectedCardId = useIdeasStore((state) => state.selectedCardId)
  const hasStarterIdeas = useIdeasStore(selectHasStarterIdeas)
  const addCard = useIdeasStore((state) => state.addCard)
  const updateCard = useIdeasStore((state) => state.updateCard)
  const deleteCard = useIdeasStore((state) => state.deleteCard)
  const moveCard = useIdeasStore((state) => state.moveCard)
  const selectCard = useIdeasStore((state) => state.selectCard)
  const initStarterIdeas = useIdeasStore((state) => state.initStarterIdeas)

  // Timeline store for cross-mode connection
  const addTimelineEvent = useTimelineStore((state) => state.addEvent)
  const { addedToTimeline, ideaDeleted } = useToast()

  // Undo/Redo hooks
  const { trackDelete, trackUpdate, getCardSnapshot, restoreLastDeleted } = useIdeasUndo()
  useIdeasUndoKeyboard() // Enable Cmd+Z / Cmd+Shift+Z

  // Handler to delete with undo tracking
  const handleDelete = useCallback(
    async (card: IdeaCardType) => {
      // Track for undo
      trackDelete(card)
      // Delete from store
      await deleteCard(card.id)
      // Show toast with undo button
      ideaDeleted(async () => {
        await restoreLastDeleted()
      })
    },
    [trackDelete, deleteCard, ideaDeleted, restoreLastDeleted]
  )

  // Handler to update with undo tracking
  const handleUpdate = useCallback(
    async (cardId: string, updates: Partial<IdeaCardType>) => {
      const before = getCardSnapshot(cardId)
      if (before) {
        // Only track meaningful updates (content, tag changes)
        const trackableFields = ['content', 'tag'] as const
        const hasTrackableChange = trackableFields.some(
          (field) => updates[field] !== undefined && updates[field] !== before[field]
        )
        if (hasTrackableChange) {
          trackUpdate(cardId, before, updates)
        }
      }
      await updateCard(cardId, updates)
    },
    [getCardSnapshot, trackUpdate, updateCard]
  )

  // Handler to send idea to timeline
  const handleSendToTimeline = useCallback(
    async (card: { id: string; content: string; tag: IdeaTag }) => {
      // Map idea tags to timeline lanes
      const tagToLane: Record<IdeaTag, LaneType> = {
        content: 'content',
        brand: 'promo',
        music: 'release',
        promo: 'promo',
      }

      const lane = tagToLane[card.tag] || 'content'

      await addTimelineEvent({
        lane,
        title: card.content.slice(0, 50) || 'Untitled Idea',
        date: new Date().toISOString(),
        colour: getLaneColour(lane),
        description: card.content,
        tags: [card.tag, 'from-ideas'],
        source: 'manual',
      })

      addedToTimeline()
    },
    [addTimelineEvent, addedToTimeline]
  )

  // Initialize starter ideas on mount
  useEffect(() => {
    initStarterIdeas()
  }, [initStarterIdeas])

  // Handle canvas click (deselect)
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current || (e.target as HTMLElement).dataset.canvasBackground) {
        selectCard(null)
      }
    },
    [selectCard]
  )

  // Handle canvas double-click (add card)
  const handleCanvasDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current || (e.target as HTMLElement).dataset.canvasBackground) {
        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return

        const x = e.clientX - rect.left - panOffset.x
        const y = e.clientY - rect.top - panOffset.y

        addCard('', 'content' as IdeaTag, { x, y })
      }
    },
    [addCard, panOffset]
  )

  // Handle panning (mouse)
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        e.preventDefault()
        setIsPanning(true)
        setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
      }
    },
    [panOffset]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setPanOffset({
          x: e.clientX - startPan.x,
          y: e.clientY - startPan.y,
        })
      }
    },
    [isPanning, startPan]
  )

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsPanning(false)
  }, [])

  // Touch panning (two-finger)
  const touchStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      // Two-finger touch initiates panning
      if (e.touches.length === 2) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const centerX = (touch1.clientX + touch2.clientX) / 2
        const centerY = (touch1.clientY + touch2.clientY) / 2
        touchStartRef.current = {
          x: centerX,
          y: centerY,
          panX: panOffset.x,
          panY: panOffset.y,
        }
        setIsPanning(true)
      }
    },
    [panOffset]
  )

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartRef.current) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const centerX = (touch1.clientX + touch2.clientX) / 2
      const centerY = (touch1.clientY + touch2.clientY) / 2

      setPanOffset({
        x: touchStartRef.current.panX + (centerX - touchStartRef.current.x),
        y: touchStartRef.current.panY + (centerY - touchStartRef.current.y),
      })
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null
    setIsPanning(false)
  }, [])

  return (
    <div
      ref={canvasRef}
      role="region"
      aria-label="Ideas canvas - double-click to add new ideas"
      onClick={handleCanvasClick}
      onDoubleClick={handleCanvasDoubleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={className}
      tabIndex={0}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#0F1113',
        cursor: isPanning ? 'grabbing' : 'default',
        touchAction: 'none',
        outline: 'none',
      }}
    >
      {/* Grid background */}
      <div
        data-canvas-background="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
          backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
          pointerEvents: 'none',
        }}
      />

      {/* Cards container */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
        }}
      >
        {cards.map((card) => (
          <IdeaCard
            key={card.id}
            card={card}
            isSelected={card.id === selectedCardId}
            onSelect={() => selectCard(card.id)}
            onMove={(position) => moveCard(card.id, position)}
            onUpdate={(updates) => handleUpdate(card.id, updates)}
            onDelete={() => handleDelete(card)}
            onSendToTimeline={() => handleSendToTimeline(card)}
          />
        ))}
      </motion.div>

      {/* Empty state */}
      {cards.length === 0 && (
        <div
          data-canvas-background="true"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <EmptyState
            title={emptyStates.ideas.firstTime.title}
            description={emptyStates.ideas.firstTime.description}
            variant="default"
            action={
              <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 12, marginTop: 8 }}>
                Tap + Add or double-click the canvas
              </div>
            }
          />
        </div>
      )}

      {/* Pan hint */}
      <div
        className="hidden sm:block"
        style={{
          position: 'absolute',
          bottom: 12,
          right: 12,
          padding: '5px 10px',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          borderRadius: 6,
          fontSize: 10,
          color: 'rgba(255, 255, 255, 0.4)',
          fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
          pointerEvents: 'none',
        }}
      >
        {isTouchDevice ? 'Two-finger drag to pan' : 'Alt + drag to pan'}
      </div>

      {/* Starter ideas hint banner */}
      {hasStarterIdeas && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          style={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '8px 16px',
            backgroundColor: 'rgba(58, 169, 190, 0.1)',
            border: '1px dashed rgba(58, 169, 190, 0.3)',
            borderRadius: 8,
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.6)',
            fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          Starter prompts — edit or delete to make them yours
        </motion.div>
      )}
    </div>
  )
}
