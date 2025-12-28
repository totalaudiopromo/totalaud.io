/**
 * IdeasList Component
 *
 * List view for Ideas mode - alternative to canvas view.
 * Minimal, clean table-like display.
 */

'use client'

import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useIdeasStore,
  selectFilteredCards,
  type IdeaCard,
  type IdeaTag,
} from '@/stores/useIdeasStore'

const TAG_COLOURS: Record<IdeaTag, string> = {
  content: '#3AA9BE',
  brand: '#A855F7',
  music: '#22C55E',
  promo: '#F97316',
}

interface IdeasListProps {
  className?: string
}

export function IdeasList({ className }: IdeasListProps) {
  const cards = useIdeasStore(selectFilteredCards)
  const selectedCardId = useIdeasStore((state) => state.selectedCardId)
  const selectCard = useIdeasStore((state) => state.selectCard)
  const updateCard = useIdeasStore((state) => state.updateCard)
  const deleteCard = useIdeasStore((state) => state.deleteCard)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  const handleRowClick = useCallback(
    (id: string) => {
      selectCard(id)
    },
    [selectCard]
  )

  const handleRowDoubleClick = useCallback((card: IdeaCard) => {
    setEditingId(card.id)
    setEditContent(card.content)
  }, [])

  const handleEditSave = useCallback(
    (id: string) => {
      if (editContent.trim()) {
        updateCard(id, { content: editContent.trim() })
      }
      setEditingId(null)
      setEditContent('')
    },
    [editContent, updateCard]
  )

  const handleEditCancel = useCallback(() => {
    setEditingId(null)
    setEditContent('')
  }, [])

  const handleTagCycle = useCallback(
    (card: IdeaCard) => {
      const tags: IdeaTag[] = ['content', 'brand', 'music', 'promo']
      const currentIndex = tags.indexOf(card.tag)
      const nextTag = tags[(currentIndex + 1) % tags.length]
      updateCard(card.id, { tag: nextTag })
    },
    [updateCard]
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    })
  }

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content
    return content.slice(0, maxLength).trim() + '...'
  }

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#0F1113',
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
      }}
    >
      {/* Header row - simplified on mobile */}
      <div
        className="ideas-list-header grid gap-2 sm:gap-3 px-3 py-2.5 text-[10px] font-medium text-white/40 uppercase tracking-wide border-b border-white/[0.06]"
        style={{
          gridTemplateColumns: '20px 1fr 40px',
        }}
      >
        <span></span>
        <span>Content</span>
        <span className="hidden sm:block">Date</span>
        <span></span>
      </div>
      {/* Responsive grid columns */}
      <style>{`
        @media (min-width: 640px) {
          .ideas-list-header { grid-template-columns: 24px 1fr 80px 50px !important; }
          .ideas-list-row { grid-template-columns: 24px 1fr 80px 50px !important; }
        }
      `}</style>

      {/* List content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
        }}
      >
        {cards.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 16,
              padding: 24,
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
            <div style={{ textAlign: 'center' }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                No ideas yet
              </p>
              <p
                style={{
                  margin: '8px 0 0',
                  fontSize: 12,
                  color: 'rgba(255, 255, 255, 0.4)',
                }}
              >
                Click Add in the toolbar to create your first idea
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                className="ideas-list-row"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.16, delay: index * 0.02 }}
                onClick={() => handleRowClick(card.id)}
                onDoubleClick={() => handleRowDoubleClick(card)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '20px 1fr 40px',
                  gap: 8,
                  padding: '10px 12px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  cursor: 'pointer',
                  backgroundColor:
                    selectedCardId === card.id ? 'rgba(58, 169, 190, 0.08)' : 'transparent',
                  transition: 'background-color 0.16s ease',
                }}
                onMouseEnter={(e) => {
                  if (selectedCardId !== card.id) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCardId !== card.id) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                {/* Tag indicator */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTagCycle(card)
                    }}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: TAG_COLOURS[card.tag],
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'transform 0.16s ease',
                    }}
                    title={`${card.tag} (click to change)`}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                  />
                </div>

                {/* Content */}
                <div style={{ minWidth: 0 }}>
                  {editingId === card.id ? (
                    <input
                      type="text"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onBlur={() => handleEditSave(card.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleEditSave(card.id)
                        if (e.key === 'Escape') handleEditCancel()
                      }}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '4px 8px',
                        fontSize: 13,
                        color: '#F7F8F9',
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(58, 169, 190, 0.4)',
                        borderRadius: 4,
                        outline: 'none',
                        fontFamily: 'inherit',
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        fontSize: 13,
                        color: 'rgba(255, 255, 255, 0.85)',
                        lineHeight: 1.4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                      }}
                    >
                      {truncateContent(card.content)}
                    </span>
                  )}
                </div>

                {/* Date - hidden on mobile */}
                <div
                  className="hidden sm:flex"
                  style={{
                    alignItems: 'center',
                    fontSize: 12,
                    color: 'rgba(255, 255, 255, 0.4)',
                  }}
                >
                  {formatDate(card.createdAt)}
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    opacity: selectedCardId === card.id ? 1 : 0,
                    transition: 'opacity 0.16s ease',
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteCard(card.id)
                    }}
                    style={{
                      padding: '4px 8px',
                      fontSize: 11,
                      color: 'rgba(255, 255, 255, 0.5)',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 4,
                      cursor: 'pointer',
                      transition: 'all 0.16s ease',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#EF4444'
                      e.currentTarget.style.color = '#EF4444'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer with count */}
      {cards.length > 0 && (
        <div
          style={{
            padding: '10px 12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: 11,
            color: 'rgba(255, 255, 255, 0.4)',
          }}
        >
          {cards.length} idea{cards.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
