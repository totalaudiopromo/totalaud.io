'use client'

/**
 * Card Editor
 * Modal for creating and editing analogue cards
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { CardType } from '@totalaud/os-state/campaign'
import { useCards } from '@totalaud/os-state/campaign'
import { X } from 'lucide-react'

interface CardEditorProps {
  isOpen: boolean
  onClose: () => void
  initialType?: CardType
  initialContent?: string
  linkedClipId?: string
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

const CARD_TYPE_LABELS: Record<CardType, string> = {
  hope: 'Hope',
  doubt: 'Doubt',
  pride: 'Pride',
  fear: 'Fear',
  clarity: 'Clarity',
  excitement: 'Excitement',
  frustration: 'Frustration',
  breakthrough: 'Breakthrough',
  uncertainty: 'Uncertainty',
}

const CARD_TYPE_COLOURS: Record<CardType, string> = {
  hope: '#51CF66',
  doubt: '#94A3B8',
  pride: '#8B5CF6',
  fear: '#EF4444',
  clarity: '#3AA9BE',
  excitement: '#F59E0B',
  frustration: '#FF5252',
  breakthrough: '#10B981',
  uncertainty: '#6B7280',
}

export function CardEditor({
  isOpen,
  onClose,
  initialType = 'clarity',
  initialContent = '',
  linkedClipId,
}: CardEditorProps) {
  const { addCard } = useCards()
  const [selectedType, setSelectedType] = useState<CardType>(initialType)
  const [content, setContent] = useState(initialContent)

  const handleSave = () => {
    if (!content.trim()) return

    addCard(
      selectedType,
      content,
      CARD_TYPE_COLOURS[selectedType],
      linkedClipId
    )

    // Reset and close
    setContent('')
    setSelectedType('clarity')
    onClose()
  }

  const handleCancel = () => {
    setContent(initialContent)
    setSelectedType(initialType)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
          />

          {/* Modal */}
          <motion.div
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, scale: 0.95, y: -40 }}
            animate={{ opacity: 1, scale: 1, y: -50 }}
            exit={{ opacity: 0, scale: 0.95, y: -40 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="rounded-lg border border-[var(--flowcore-colour-border)] bg-[var(--flowcore-overlay-strong)] p-6 shadow-2xl">
              {/* Header */}
              <div className="mb-4 flex items-centre justify-between">
                <h2 className="font-mono text-lg font-semibold text-[var(--flowcore-colour-fg)]">
                  {linkedClipId ? 'Add Card to Clip' : 'New Story Card'}
                </h2>
                <button
                  onClick={handleCancel}
                  className="rounded p-1 text-[var(--flowcore-colour-fg)]/70 transition-colours hover:bg-[var(--flowcore-colour-fg)]/10 hover:text-[var(--flowcore-colour-fg)]"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Card type selector */}
              <div className="mb-4">
                <label className="mb-2 block font-mono text-xs uppercase text-[var(--flowcore-colour-fg)]/70">
                  Card Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CARD_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`rounded-lg border-2 p-3 text-centre transition-all ${
                        selectedType === type
                          ? 'border-white ring-2 ring-white/20'
                          : 'border-transparent hover:border-white/50'
                      }`}
                      style={{
                        backgroundColor: CARD_TYPE_COLOURS[type],
                      }}
                    >
                      <span className="font-mono text-xs font-semibold uppercase text-white">
                        {CARD_TYPE_LABELS[type]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content textarea */}
              <div className="mb-6">
                <label className="mb-2 block font-mono text-xs uppercase text-[var(--flowcore-colour-fg)]/70">
                  Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's the story? What are you feeling?"
                  className="min-h-[120px] w-full resize-none rounded-lg border border-[var(--flowcore-colour-border)] bg-[var(--flowcore-overlay-soft)] p-3 font-sans text-sm text-[var(--flowcore-colour-fg)] outline-none transition-colours focus:border-[var(--flowcore-colour-accent)]"
                  autoFocus
                />
                <div className="mt-1 text-right font-mono text-xs text-[var(--flowcore-colour-fg)]/50">
                  {content.length} characters
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 rounded-lg border border-[var(--flowcore-colour-border)] px-4 py-2 font-mono text-sm text-[var(--flowcore-colour-fg)] transition-colours hover:bg-[var(--flowcore-colour-fg)]/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!content.trim()}
                  className="flex-1 rounded-lg bg-[var(--flowcore-colour-accent)] px-4 py-2 font-mono text-sm font-semibold text-white transition-colours hover:bg-[var(--flowcore-colour-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save Card
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
