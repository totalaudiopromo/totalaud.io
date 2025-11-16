/**
 * OS Personality Delta Badge
 * Phase 13A: OS Evolution System
 *
 * Tiny drift indicator showing when an OS has evolved significantly
 */

'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { ThemeId } from '@totalaud/os-state/campaign'

const OS_COLOURS: Record<ThemeId, string> = {
  ascii: '#00ff99',
  xp: '#3478f6',
  aqua: '#3b82f6',
  daw: '#ff8000',
  analogue: '#ff1aff',
}

interface OSPersonalityDeltaBadgeProps {
  os: ThemeId
  delta: number // -1 to 1 (overall drift magnitude)
  label?: string // e.g. "more confident", "less empathetic"
  size?: 'small' | 'medium'
  onClick?: () => void
}

export function OSPersonalityDeltaBadge({
  os,
  delta,
  label,
  size = 'small',
  onClick,
}: OSPersonalityDeltaBadgeProps) {
  const colour = OS_COLOURS[os]
  const isPositive = delta > 0
  const isSignificant = Math.abs(delta) > 0.1

  if (!isSignificant) return null

  const badgeSize = size === 'small' ? 20 : 28
  const fontSize = size === 'small' ? 10 : 12

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size === 'small' ? '4px' : '6px',
        padding: size === 'small' ? '4px 8px' : '6px 10px',
        background: `${colour}20`,
        border: `1px solid ${colour}`,
        borderRadius: size === 'small' ? '12px' : '14px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 120ms ease',
      }}
      whileHover={onClick ? { background: `${colour}30`, scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      {/* Icon */}
      {isPositive ? (
        <TrendingUp size={badgeSize - 6} strokeWidth={2} style={{ color: colour }} />
      ) : (
        <TrendingDown size={badgeSize - 6} strokeWidth={2} style={{ color: colour }} />
      )}

      {/* Label */}
      {label && (
        <span
          style={{
            fontSize: `${fontSize}px`,
            fontWeight: 600,
            color: colour,
            lineHeight: 1,
            textTransform: 'lowercase',
          }}
        >
          {label}
        </span>
      )}

      {/* Delta value */}
      <span
        style={{
          fontSize: `${fontSize}px`,
          fontWeight: 700,
          color: colour,
          lineHeight: 1,
          opacity: 0.8,
        }}
      >
        {isPositive ? '+' : ''}
        {(delta * 100).toFixed(0)}%
      </span>
    </motion.div>
  )
}

/**
 * Multiple badges for showing drift across multiple parameters
 */
interface OSPersonalityDriftSummaryProps {
  os: ThemeId
  deltas: {
    confidence?: number
    verbosity?: number
    riskTolerance?: number
    empathy?: number
  }
  onClick?: () => void
}

export function OSPersonalityDriftSummary({
  os,
  deltas,
  onClick,
}: OSPersonalityDriftSummaryProps) {
  const significantDeltas: Array<{ label: string; delta: number }> = []

  if (deltas.confidence && Math.abs(deltas.confidence) > 0.1) {
    significantDeltas.push({
      label: deltas.confidence > 0 ? 'confident' : 'uncertain',
      delta: deltas.confidence,
    })
  }
  if (deltas.verbosity && Math.abs(deltas.verbosity) > 0.1) {
    significantDeltas.push({
      label: deltas.verbosity > 0 ? 'talkative' : 'quiet',
      delta: deltas.verbosity,
    })
  }
  if (deltas.riskTolerance && Math.abs(deltas.riskTolerance) > 0.1) {
    significantDeltas.push({
      label: deltas.riskTolerance > 0 ? 'bold' : 'cautious',
      delta: deltas.riskTolerance,
    })
  }
  if (deltas.empathy && Math.abs(deltas.empathy) > 0.1) {
    significantDeltas.push({
      label: deltas.empathy > 0 ? 'empathetic' : 'analytical',
      delta: deltas.empathy,
    })
  }

  if (significantDeltas.length === 0) return null

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {significantDeltas.map(({ label, delta }, index) => (
        <OSPersonalityDeltaBadge
          key={index}
          os={os}
          delta={delta}
          label={label}
          onClick={onClick}
        />
      ))}
    </div>
  )
}
