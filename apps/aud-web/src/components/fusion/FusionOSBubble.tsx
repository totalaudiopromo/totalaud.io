'use client'

/**
 * Fusion OS Bubble
 * Represents a single OS's contribution in fusion mode
 * Phase 12B: Now with live activity states (idle/thinking/speaking)
 */

import { motion } from 'framer-motion'
import type { ThemeId } from '@totalaud/os-state/campaign'
import { Terminal, Smile, Sparkles, Music, Heart } from 'lucide-react'
import type { OSActivityState } from './FusionModeCanvas'

interface FusionOSBubbleProps {
  os: ThemeId
  contribution?: {
    summary: string
    recommendations: string[]
    sentiment?: 'positive' | 'neutral' | 'cautious' | 'critical'
  }
  isActive: boolean
  activityState?: OSActivityState
  messageCount?: number
  lastSpokeAt?: string
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

/**
 * Format relative time (e.g. "12s ago", "3m ago")
 */
function formatRelativeTime(timestamp?: string): string {
  if (!timestamp) return ''

  const now = new Date().getTime()
  const then = new Date(timestamp).getTime()
  const diffMs = now - then
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)

  if (diffSecs < 60) return `${diffSecs}s ago`
  if (diffMins < 60) return `${diffMins}m ago`
  return `${diffHours}h ago`
}

export function FusionOSBubble({
  os,
  contribution,
  isActive,
  activityState = 'idle',
  messageCount = 0,
  lastSpokeAt,
  onClick,
}: FusionOSBubbleProps) {
  const colour = OS_COLOURS[os]
  const Icon = OS_ICONS[os]
  const label = OS_LABELS[os]

  const hasContribution = !!contribution

  // Animation variants based on activity state
  const getAnimationProps = () => {
    switch (activityState) {
      case 'thinking':
        return {
          animate: {
            scale: [0.98, 1.02, 0.98],
            boxShadow: [
              `0 0 0 0 ${colour}00`,
              `0 0 15px 3px ${colour}30`,
              `0 0 0 0 ${colour}00`,
            ],
          },
          transition: {
            duration: 0.24,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }

      case 'speaking':
        return {
          animate: {
            scale: [1, 1.15, 1],
            boxShadow: [
              `0 0 10px 2px ${colour}40`,
              `0 0 25px 8px ${colour}60`,
              `0 0 10px 2px ${colour}40`,
            ],
          },
          transition: {
            duration: 0.12,
            repeat: 3,
            ease: [0.22, 1, 0.36, 1],
          },
        }

      case 'idle':
      default:
        return {
          animate: hasContribution
            ? {
                scale: [0.98, 1.02, 0.98],
                boxShadow: [
                  `0 0 0 0 ${colour}00`,
                  `0 0 20px 5px ${colour}40`,
                  `0 0 0 0 ${colour}00`,
                ],
              }
            : {
                scale: [0.98, 1.02, 0.98],
              },
          transition: {
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }
    }
  }

  const animationProps = getAnimationProps()

  return (
    <div className="relative flex flex-col items-centre">
      <motion.button
        className="relative flex h-24 w-24 flex-col items-centre justify-centre rounded-full border-2 transition-all"
        style={{
          borderColor: isActive ? colour : `${colour}40`,
          backgroundColor: isActive ? `${colour}20` : `${colour}10`,
        }}
        onClick={onClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        {...animationProps}
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

        {/* Activity State Indicator */}
        {activityState !== 'idle' && (
          <motion.div
            className="absolute -right-1 -top-1 h-3 w-3 rounded-full"
            style={{
              backgroundColor: activityState === 'speaking' ? colour : `${colour}80`,
            }}
            animate={{
              scale: activityState === 'speaking' ? [1, 1.5, 1] : [1, 1.3, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: activityState === 'speaking' ? 0.5 : 1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Contribution Indicator (when has contribution) */}
        {hasContribution && activityState === 'idle' && (
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

      {/* Message Count & Last Spoke */}
      <div
        className="mt-2 font-mono text-[10px] text-centre"
        style={{ color: `${colour}80` }}
      >
        {messageCount > 0 && <div>{messageCount} messages</div>}
        {lastSpokeAt && <div className="opacity-70">{formatRelativeTime(lastSpokeAt)}</div>}
      </div>
    </div>
  )
}
