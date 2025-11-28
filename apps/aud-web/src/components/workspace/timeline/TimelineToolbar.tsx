/**
 * Timeline Toolbar Component
 * 2025 Brand Pivot - Cinematic Editorial
 *
 * Controls for the Timeline view
 */

'use client'

import { useState } from 'react'

type ViewMode = 'weeks' | 'months' | 'quarters'

export function TimelineToolbar() {
  const [viewMode, setViewMode] = useState<ViewMode>('weeks')

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        backgroundColor: 'rgba(15, 17, 19, 0.95)',
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
      }}
    >
      {/* Left: Title and event count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <h2
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          Release Timeline
        </h2>
        <span
          style={{
            fontSize: 12,
            padding: '4px 8px',
            backgroundColor: 'rgba(58, 169, 190, 0.1)',
            border: '1px solid rgba(58, 169, 190, 0.2)',
            borderRadius: 4,
            color: '#3AA9BE',
          }}
        >
          Q1 2025
        </span>
      </div>

      {/* Right: View controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* View mode toggle */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 6,
            padding: 2,
          }}
        >
          {(['weeks', 'months', 'quarters'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: viewMode === mode ? 500 : 400,
                color: viewMode === mode ? '#3AA9BE' : 'rgba(255, 255, 255, 0.5)',
                backgroundColor: viewMode === mode ? 'rgba(58, 169, 190, 0.15)' : 'transparent',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                textTransform: 'capitalize',
                fontFamily: 'inherit',
              }}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Add event button */}
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            fontSize: 13,
            fontWeight: 500,
            color: '#0F1113',
            backgroundColor: '#3AA9BE',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            transition: 'opacity 0.12s ease',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1'
          }}
        >
          <span style={{ fontSize: 14 }}>+</span>
          Add Event
        </button>
      </div>
    </div>
  )
}
