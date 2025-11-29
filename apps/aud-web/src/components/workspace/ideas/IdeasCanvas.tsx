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
import { useIdeasStore, selectFilteredCards, type IdeaTag } from '@/stores/useIdeasStore'
import { IdeaCard } from './IdeaCard'

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
  const addCard = useIdeasStore((state) => state.addCard)
  const updateCard = useIdeasStore((state) => state.updateCard)
  const deleteCard = useIdeasStore((state) => state.deleteCard)
  const moveCard = useIdeasStore((state) => state.moveCard)
  const selectCard = useIdeasStore((state) => state.selectCard)

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

  // Handle panning
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

  return (
    <div
      ref={canvasRef}
      onClick={handleCanvasClick}
      onDoubleClick={handleCanvasDoubleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#0F1113',
        cursor: isPanning ? 'grabbing' : 'default',
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
            onUpdate={(updates) => updateCard(card.id, updates)}
            onDelete={() => deleteCard(card.id)}
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
            gap: 16,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(58, 169, 190, 0.1)',
              border: '1px solid rgba(58, 169, 190, 0.2)',
              borderRadius: 12,
              color: '#3AA9BE',
              fontSize: 24,
            }}
          >
            +
          </div>
          <div style={{ textAlign: 'center', padding: '0 24px' }}>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
              }}
            >
              Tap + Add to capture an idea
            </p>
            <p
              style={{
                margin: '8px 0 0',
                fontSize: 12,
                color: 'rgba(255, 255, 255, 0.4)',
                fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
              }}
            >
              or double-tap the canvas
            </p>
          </div>
        </div>
      )}

      {/* Pan hint - hidden on touch devices */}
      {!isTouchDevice && (
        <div
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
          Alt + drag to pan
        </div>
      )}
    </div>
  )
}
