'use client'

/**
 * Card Linker
 * UI for linking cards to timeline clips
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TimelineClip } from '@totalaud/os-state/campaign'
import { useCards, useTimeline } from '@totalaud/os-state/campaign'
import { Card } from './Card'
import { CardEditor } from './CardEditor'
import { Link2, Plus, X } from 'lucide-react'

interface CardLinkerProps {
  clip: TimelineClip
  isOpen: boolean
  onClose: () => void
}

export function CardLinker({ clip, isOpen, onClose }: CardLinkerProps) {
  const { getCardsForClip, linkCardToClip, unlinkCard } = useCards()
  const { timeline } = useTimeline()
  const [isCreatingCard, setIsCreatingCard] = useState(false)
  const [availableCards, setAvailableCards] = useState<any[]>([])

  const linkedCards = getCardsForClip(clip.id)
  const { cards } = useCards()

  // Get cards that aren't linked to this clip
  const unlinkedCards = cards.cards.filter(
    (card) => !linkedCards.some((lc) => lc.id === card.id)
  )

  const handleLinkCard = (cardId: string) => {
    linkCardToClip(cardId, clip.id)
  }

  const handleUnlinkCard = (cardId: string) => {
    unlinkCard(cardId)
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2"
              initial={{ opacity: 0, scale: 0.95, y: -40 }}
              animate={{ opacity: 1, scale: 1, y: -50 }}
              exit={{ opacity: 0, scale: 0.95, y: -40 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="max-h-[80vh] overflow-hidden rounded-lg border border-[var(--flowcore-colour-border)] bg-[var(--flowcore-overlay-strong)] shadow-2xl">
                {/* Header */}
                <div className="flex items-centre justify-between border-b border-[var(--flowcore-colour-border)] p-4">
                  <div>
                    <h2 className="font-mono text-lg font-semibold text-[var(--flowcore-colour-fg)]">
                      Link Cards to Clip
                    </h2>
                    <p className="mt-1 font-mono text-xs text-[var(--flowcore-colour-fg)]/70">
                      {clip.name}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded p-1 text-[var(--flowcore-colour-fg)]/70 transition-colours hover:bg-[var(--flowcore-colour-fg)]/10 hover:text-[var(--flowcore-colour-fg)]"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Content */}
                <div className="max-h-[60vh] overflow-y-auto p-4">
                  {/* Linked cards section */}
                  <div className="mb-6">
                    <div className="mb-3 flex items-centre justify-between">
                      <h3 className="font-mono text-sm font-semibold text-[var(--flowcore-colour-fg)]">
                        Linked Cards ({linkedCards.length})
                      </h3>
                      <button
                        onClick={() => setIsCreatingCard(true)}
                        className="flex items-centre gap-1 rounded bg-[var(--flowcore-colour-accent)] px-3 py-1.5 font-mono text-xs text-white transition-colours hover:bg-[var(--flowcore-colour-accent-hover)]"
                      >
                        <Plus size={12} />
                        New Card
                      </button>
                    </div>

                    {linkedCards.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-[var(--flowcore-colour-border)] p-6 text-centre">
                        <Link2
                          size={32}
                          className="mx-auto mb-2 text-[var(--flowcore-colour-fg)]/30"
                        />
                        <p className="font-mono text-sm text-[var(--flowcore-colour-fg)]/50">
                          No cards linked yet
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {linkedCards.map((card) => (
                          <div key={card.id} className="relative">
                            <Card card={card} showLinkedClip={false} />
                            <button
                              onClick={() => handleUnlinkCard(card.id)}
                              className="absolute right-2 top-2 rounded bg-[var(--flowcore-colour-error)] p-1.5 text-white opacity-0 transition-opacity hover:opacity-100"
                              title="Unlink card"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Available cards section */}
                  {unlinkedCards.length > 0 && (
                    <div>
                      <h3 className="mb-3 font-mono text-sm font-semibold text-[var(--flowcore-colour-fg)]">
                        Available Cards ({unlinkedCards.length})
                      </h3>
                      <div className="grid gap-3">
                        {unlinkedCards.map((card) => (
                          <motion.div
                            key={card.id}
                            whileHover={{ scale: 1.02 }}
                            className="cursor-pointer"
                            onClick={() => handleLinkCard(card.id)}
                          >
                            <Card card={card} showLinkedClip={false} />
                            <div className="mt-2 text-centre font-mono text-xs text-[var(--flowcore-colour-accent)]">
                              Click to link
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-[var(--flowcore-colour-border)] p-4">
                  <button
                    onClick={onClose}
                    className="w-full rounded-lg bg-[var(--flowcore-colour-accent)] px-4 py-2 font-mono text-sm font-semibold text-white transition-colours hover:bg-[var(--flowcore-colour-accent-hover)]"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Card Editor Modal */}
      <CardEditor
        isOpen={isCreatingCard}
        onClose={() => setIsCreatingCard(false)}
        linkedClipId={clip.id}
      />
    </>
  )
}
