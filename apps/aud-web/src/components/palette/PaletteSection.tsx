'use client'

/**
 * Phase 33: Global Command Palette - Section Component
 *
 * Section header for grouping related results.
 * Calm, subtle design.
 */

import type { ReactNode } from 'react'

interface PaletteSectionProps {
  label: string
  children: ReactNode
}

export function PaletteSection({ label, children }: PaletteSectionProps) {
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      {/* Section Header */}
      <div
        style={{
          padding: '0.5rem 1rem',
          fontSize: '11px',
          fontWeight: '600',
          color: 'var(--colour-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </div>

      {/* Section Items */}
      <div>{children}</div>
    </div>
  )
}
