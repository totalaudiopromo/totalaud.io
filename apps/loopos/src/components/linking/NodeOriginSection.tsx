'use client'

/**
 * Phase 32: Creative Continuity — Node Origin Section
 *
 * Shows origin source for a timeline node in the Node Inspector.
 * Links back to notes, analogue cards, coach, or designer.
 */

import type { NodeOrigin } from '@loopos/db'

interface NodeOriginSectionProps {
  origin: NodeOrigin | null
  onViewSource?: () => void
  onHighlightSource?: (highlighted: boolean) => void
}

const originLabels: Record<string, { label: string; icon: string }> = {
  note: { label: 'Created from a note', icon: '📝' },
  analogue: { label: 'Created from an analogue card', icon: '🎴' },
  coach: { label: 'Created from a coach suggestion', icon: '🎯' },
  designer: { label: 'Created from a visual idea', icon: '🎨' },
}

export function NodeOriginSection({
  origin,
  onViewSource,
  onHighlightSource,
}: NodeOriginSectionProps) {
  if (!origin || !origin.origin_type) {
    return null
  }

  const config = originLabels[origin.origin_type]
  if (!config) return null

  return (
    <div
      style={{
        marginTop: '1.5rem',
        padding: '1rem',
        border: '1px solid rgba(var(--colour-accent-rgb), 0.2)',
        borderRadius: '8px',
        backgroundColor: 'rgba(var(--colour-accent-rgb), 0.03)',
      }}
      onMouseEnter={() => onHighlightSource?.(true)}
      onMouseLeave={() => onHighlightSource?.(false)}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.75rem',
        }}
      >
        <span style={{ fontSize: '16px' }}>{config.icon}</span>
        <h4
          style={{
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--colour-foreground)',
          }}
        >
          {config.label}
        </h4>
      </div>

      {origin.origin_title && (
        <div
          style={{
            fontSize: '13px',
            fontWeight: '500',
            color: 'var(--colour-foreground)',
            marginBottom: '0.5rem',
          }}
        >
          {origin.origin_title}
        </div>
      )}

      {origin.origin_content && (
        <div
          style={{
            fontSize: '12px',
            color: 'var(--colour-muted)',
            lineHeight: '1.6',
            marginBottom: '0.75rem',
            maxHeight: '100px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {origin.origin_content.substring(0, 200)}
          {origin.origin_content.length > 200 && '...'}
        </div>
      )}

      {onViewSource && origin.origin_type !== 'coach' && origin.origin_type !== 'designer' && (
        <button
          onClick={onViewSource}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '12px',
            fontWeight: '500',
            color: 'var(--colour-accent)',
            backgroundColor: 'rgba(var(--colour-accent-rgb), 0.1)',
            border: '1px solid rgba(var(--colour-accent-rgb), 0.3)',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 120ms ease-out',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(var(--colour-accent-rgb), 0.15)'
            e.currentTarget.style.borderColor = 'var(--colour-accent)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(var(--colour-accent-rgb), 0.1)'
            e.currentTarget.style.borderColor = 'rgba(var(--colour-accent-rgb), 0.3)'
          }}
        >
          {origin.origin_type === 'note' && 'Open note'}
          {origin.origin_type === 'analogue' && 'View card'}
        </button>
      )}

      {origin.origin_type === 'coach' && (
        <div
          style={{
            fontSize: '11px',
            color: 'var(--colour-muted)',
            fontStyle: 'italic',
          }}
        >
          Coach suggested this based on your conversation
        </div>
      )}

      {origin.origin_type === 'designer' && (
        <div
          style={{
            fontSize: '11px',
            color: 'var(--colour-muted)',
            fontStyle: 'italic',
          }}
        >
          Generated from a visual design session
        </div>
      )}
    </div>
  )
}
