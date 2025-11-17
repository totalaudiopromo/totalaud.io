'use client'

/**
 * Phase 33: Global Command Palette - Action Item Component
 *
 * Individual selectable item in the palette results list.
 * Supports keyboard navigation and hover states.
 */

import type { ReactNode } from 'react'

interface PaletteActionItemProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  isSelected: boolean
  onClick: () => void
  onMouseEnter: () => void
}

export function PaletteActionItem({
  title,
  subtitle,
  icon,
  isSelected,
  onClick,
  onMouseEnter,
}: PaletteActionItemProps) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      style={{
        width: '100%',
        padding: '0.75rem 1rem',
        border: 'none',
        outline: 'none',
        background: isSelected ? 'rgba(var(--colour-accent-rgb), 0.1)' : 'transparent',
        borderLeft: isSelected ? '3px solid var(--colour-accent)' : '3px solid transparent',
        color: 'var(--colour-foreground)',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 120ms ease-out',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}
    >
      {/* Icon */}
      {icon && (
        <div
          style={{
            flexShrink: 0,
            width: '20px',
            height: '20px',
            opacity: 0.7,
          }}
        >
          {icon}
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: isSelected ? '600' : '500',
            marginBottom: subtitle ? '0.125rem' : 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: '12px',
              color: 'var(--colour-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* Keyboard hint (only on selected) */}
      {isSelected && (
        <div
          style={{
            flexShrink: 0,
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            backgroundColor: 'rgba(var(--colour-accent-rgb), 0.15)',
            fontSize: '11px',
            fontWeight: '600',
            color: 'var(--colour-accent)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          ↵
        </div>
      )}
    </button>
  )
}
