'use client'

/**
 * Card Palette
 * Sidebar showing all analogue cards with filtering
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { CardType } from '@totalaud/os-state/campaign'
import { useCards } from '@totalaud/os-state/campaign'
import { Card } from './Card'
import { CardEditor } from './CardEditor'
import { Plus, Filter, SortAsc, X } from 'lucide-react'

interface CardPaletteProps {
  isOpen: boolean
  onClose: () => void
}

const CARD_TYPES: CardType[] = [
  'hope',
  'doubt',
  'pride',
  'fear',
  'clarity',
  'excitement',
  'frustration',
  'breakthrough',
  'uncertainty',
]

export function CardPalette({ isOpen, onClose }: CardPaletteProps) {
  const { cards, filterCardsByType, sortCards, selectCards } = useCards()
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [filterType, setFilterType] = useState<CardType | undefined>(undefined)

  const handleFilterChange = (type: CardType | undefined) => {
    setFilterType(type)
    filterCardsByType(type)
  }

  const handleSortChange = (sortBy: 'timestamp' | 'type' | 'recent') => {
    sortCards(sortBy)
  }

  const filteredCards = filterType
    ? cards.cards.filter((c) => c.type === filterType)
    : cards.cards

  const sortedCards = [...filteredCards].sort((a, b) => {
    switch (cards.sortBy) {
      case 'timestamp':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      case 'type':
        return a.type.localeCompare(b.type)
      case 'recent':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      default:
        return 0
    }
  })

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-30 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            {/* Sidebar */}
            <motion.div
              className="fixed right-0 top-0 z-40 flex h-full w-full max-w-md flex-col border-l border-[var(--flowcore-colour-border)] bg-[var(--flowcore-colour-bg)] shadow-2xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Header */}
              <div className="flex items-centre justify-between border-b border-[var(--flowcore-colour-border)] p-4">
                <h2 className="font-mono text-lg font-semibold text-[var(--flowcore-colour-fg)]">
                  Story Cards
                </h2>
                <div className="flex items-centre gap-2">
                  <button
                    onClick={() => setIsEditorOpen(true)}
                    className="rounded bg-[var(--flowcore-colour-accent)] p-2 text-white transition-colours hover:bg-[var(--flowcore-colour-accent-hover)]"
                    title="New Card"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={onClose}
                    className="rounded p-2 text-[var(--flowcore-colour-fg)]/70 transition-colours hover:bg-[var(--flowcore-colour-fg)]/10 hover:text-[var(--flowcore-colour-fg)]"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Filter and sort controls */}
              <div className="border-b border-[var(--flowcore-colour-border)] p-4">
                {/* Filter */}
                <div className="mb-3">
                  <label className="mb-2 flex items-centre gap-2 font-mono text-xs uppercase text-[var(--flowcore-colour-fg)]/70">
                    <Filter size={12} />
                    Filter by Type
                  </label>
                  <select
                    value={filterType || ''}
                    onChange={(e) =>
                      handleFilterChange(
                        e.target.value ? (e.target.value as CardType) : undefined
                      )
                    }
                    className="w-full rounded border border-[var(--flowcore-colour-border)] bg-[var(--flowcore-overlay-soft)] px-3 py-2 font-mono text-sm text-[var(--flowcore-colour-fg)] outline-none"
                  >
                    <option value="">All Cards</option>
                    {CARD_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="mb-2 flex items-centre gap-2 font-mono text-xs uppercase text-[var(--flowcore-colour-fg)]/70">
                    <SortAsc size={12} />
                    Sort By
                  </label>
                  <select
                    value={cards.sortBy}
                    onChange={(e) =>
                      handleSortChange(e.target.value as 'timestamp' | 'type' | 'recent')
                    }
                    className="w-full rounded border border-[var(--flowcore-colour-border)] bg-[var(--flowcore-overlay-soft)] px-3 py-2 font-mono text-sm text-[var(--flowcore-colour-fg)] outline-none"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="timestamp">Oldest First</option>
                    <option value="type">By Type</option>
                  </select>
                </div>
              </div>

              {/* Cards list */}
              <div className="flex-1 overflow-y-auto p-4">
                {sortedCards.length === 0 ? (
                  <div className="flex h-full items-centre justify-centre text-centre">
                    <div>
                      <p className="mb-2 font-mono text-sm text-[var(--flowcore-colour-fg)]/50">
                        No cards yet
                      </p>
                      <button
                        onClick={() => setIsEditorOpen(true)}
                        className="font-mono text-xs text-[var(--flowcore-colour-accent)] hover:underline"
                      >
                        Create your first card
                      </button>
                    </div>
                  </div>
                ) : (
                  <motion.div className="space-y-3" layout>
                    {sortedCards.map((card) => (
                      <Card
                        key={card.id}
                        card={card}
                        isSelected={cards.selectedCardIds.includes(card.id)}
                        onClick={() => selectCards([card.id])}
                      />
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Footer stats */}
              <div className="border-t border-[var(--flowcore-colour-border)] p-4">
                <div className="flex items-centre justify-between font-mono text-xs text-[var(--flowcore-colour-fg)]/70">
                  <span>{sortedCards.length} cards</span>
                  <span>
                    {sortedCards.filter((c) => c.linkedClipId).length} linked
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Card Editor Modal */}
      <CardEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
      />
    </>
  )
}
