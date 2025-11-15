'use client'

/**
 * Analogue Card
 * Individual story/sentiment card display
 */

import { motion } from 'framer-motion'
import type { AnalogueCard, CardType } from '@totalaud/os-state/campaign'
import { useCards } from '@totalaud/os-state/campaign'
import { Heart, Link2, Trash2 } from 'lucide-react'

interface CardProps {
  card: AnalogueCard
  isSelected?: boolean
  onClick?: () => void
  onDelete?: () => void
  showLinkedClip?: boolean
}

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

const CARD_TYPE_ICONS: Record<CardType, string> = {
  hope: '✨',
  doubt: '🤔',
  pride: '💪',
  fear: '😰',
  clarity: '💡',
  excitement: '🎉',
  frustration: '😤',
  breakthrough: '🚀',
  uncertainty: '🌫️',
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return new Date(date).toLocaleDateString()
}

export function Card({
  card,
  isSelected = false,
  onClick,
  onDelete,
  showLinkedClip = true,
}: CardProps) {
  const { cards, removeCard } = useCards()

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete()
    } else {
      removeCard(card.id)
    }
  }

  return (
    <motion.div
      className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
        isSelected
          ? 'border-[var(--flowcore-colour-accent)] ring-2 ring-[var(--flowcore-colour-accent)]/20'
          : 'border-transparent hover:border-[var(--flowcore-colour-accent)]/50'
      }`}
      style={{
        backgroundColor: card.colour,
      }}
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.12 }}
      layout
    >
      <div className="p-4">
        {/* Card header */}
        <div className="mb-2 flex items-start justify-between">
          <div className="flex items-centre gap-2">
            <span className="text-lg">{CARD_TYPE_ICONS[card.type]}</span>
            <span className="font-mono text-xs font-semibold uppercase text-white/90">
              {CARD_TYPE_LABELS[card.type]}
            </span>
          </div>

          {/* Delete button */}
          <button
            onClick={handleDelete}
            className="opacity-0 transition-opacity group-hover:opacity-100"
            title="Delete card"
          >
            <Trash2 size={14} className="text-white/70 hover:text-white" />
          </button>
        </div>

        {/* Card content */}
        <p className="mb-3 text-sm leading-relaxed text-white/95">
          {card.content}
        </p>

        {/* Card footer */}
        <div className="flex items-centre justify-between text-xs text-white/70">
          <span className="font-mono">
            {formatTimeAgo(card.timestamp)}
          </span>

          {/* Link indicator */}
          {showLinkedClip && card.linkedClipId && (
            <div className="flex items-centre gap-1 rounded-full bg-white/10 px-2 py-0.5">
              <Link2 size={10} />
              <span className="text-[10px]">Linked</span>
            </div>
          )}
        </div>
      </div>

      {/* Texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'url(/textures/paper-grain.png)',
          backgroundSize: 'cover',
          mixBlendMode: 'overlay',
        }}
      />
    </motion.div>
  )
}
