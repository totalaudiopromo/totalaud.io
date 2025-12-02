/**
 * Analytics Toolbar Component
 * 2025 Brand Pivot - Cinematic Editorial
 *
 * Controls for the Analytics dashboard
 */

'use client'

import { useState } from 'react'

type DateRange = '7d' | '30d' | '90d' | '1y' | 'all'

export function AnalyticsToolbar() {
  const [dateRange, setDateRange] = useState<DateRange>('30d')

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
      {/* Left: Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <h2
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          Performance Dashboard
        </h2>
        <span
          style={{
            fontSize: 12,
            padding: '4px 8px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: 4,
            color: '#10B981',
          }}
        >
          Live
        </span>
      </div>

      {/* Right: Date range */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 6,
            padding: 2,
          }}
        >
          {(['7d', '30d', '90d', '1y', 'all'] as DateRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              style={{
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: dateRange === range ? 500 : 400,
                color: dateRange === range ? '#3AA9BE' : 'rgba(255, 255, 255, 0.5)',
                backgroundColor: dateRange === range ? 'rgba(58, 169, 190, 0.15)' : 'transparent',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                textTransform: 'uppercase',
                fontFamily: 'inherit',
              }}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Refresh button */}
        <button
          style={{
            padding: '8px 14px',
            fontSize: 13,
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.6)',
            backgroundColor: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 6,
            cursor: 'pointer',
            transition: 'all 0.12s ease',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'
          }}
        >
          Refresh
        </button>
      </div>
    </div>
  )
}
