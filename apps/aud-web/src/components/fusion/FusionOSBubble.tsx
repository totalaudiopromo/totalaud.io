'use client'

/**
 * Fusion OS Bubble
 * Represents a single OS's contribution in fusion mode
 */

import { motion } from 'framer-motion'
import type { ThemeId } from '@totalaud/os-state/campaign'
import { Terminal, Smile, Sparkles, Music, Heart } from 'lucide-react'

interface FusionOSBubbleProps {
  os: ThemeId
  contribution?: {
    summary: string
    recommendations: string[]
    sentiment?: 'positive' | 'neutral' | 'cautious' | 'critical'
  }
  isActive: boolean
  onClick: () => void
}

const OS_COLOURS: Record<ThemeId, string> = {
  ascii: '#00ff99',
  xp: '#3478f6',
  aqua: '#3b82f6',
  daw: '#ff8000',
  analogue: '#ff1aff',
}

const OS_ICONS: Record<ThemeId, React.ComponentType<{ size?: number }>> = {
  ascii: Terminal,
  xp: Smile,
  aqua: Sparkles,
  daw: Music,
  analogue: Heart,
}

const OS_LABELS: Record<ThemeId, string> = {
  ascii: 'ASCII',
  xp: 'XP',
  aqua: 'Aqua',
  daw: 'DAW',
  analogue: 'Analogue',
}

export function FusionOSBubble({
  os,
  contribution,
  isActive,
  onClick,
}: FusionOSBubbleProps) {
  const colour = OS_COLOURS[os]
  const Icon = OS_ICONS[os]
  const label = OS_LABELS[os]

  const hasContribution = !!contribution

  return (
    <motion.button
      className="relative flex h-24 w-24 flex-col items-centre justify-centre rounded-full border-2 transition-all"
      style={{
        borderColor: isActive ? colour : `${colour}40`,
        backgroundColor: isActive ? `${colour}20` : `${colour}10`,
      }}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      animate={
        hasContribution
          ? {
              boxShadow: [
                `0 0 0 0 ${colour}00`,
                `0 0 20px 5px ${colour}40`,
                `0 0 0 0 ${colour}00`,
              ],
            }
          : {}
      }
      transition={{
        duration: hasContribution ? 2 : 0.12,
        repeat: hasContribution ? Infinity : 0,
        ease: 'easeInOut',
      }}
    >
      {/* Icon */}
      <Icon size={20} style={{ color: colour }} />

      {/* Label */}
      <span
        className="mt-1 font-mono text-xs font-semibold uppercase"
        style={{ color: colour }}
      >
        {label}
      </span>

      {/* Contribution Indicator */}
      {hasContribution && (
        <motion.div
          className="absolute -right-1 -top-1 h-3 w-3 rounded-full"
          style={{ backgroundColor: colour }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0.7, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Sentiment Badge */}
      {contribution?.sentiment && isActive && (
        <motion.div
          className="absolute -bottom-2 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase"
          style={{
            backgroundColor: colour,
            color: '#000',
          }}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
        >
          {contribution.sentiment}
        </motion.div>
      )}
    </motion.button>
  )
}
