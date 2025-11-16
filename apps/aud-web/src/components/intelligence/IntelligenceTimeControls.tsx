/**
 * Intelligence Time Controls
 * Phase 15: CIB 2.0 - Time travel interface
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Play } from 'lucide-react'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { useIntelligence } from '@totalaud/os-state/campaign'
import type { IntelligenceTimeMode } from '@totalaud/os-state/campaign/slices/intelligenceSlice'

export interface IntelligenceTimeControlsProps {
  onTimeChange?: () => void
  campaignStartDate?: string // ISO timestamp for campaign start
}

export function IntelligenceTimeControls({
  onTimeChange,
  campaignStartDate,
}: IntelligenceTimeControlsProps) {
  const { intelligence, setTimeRange } = useIntelligence()
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const handlePresetClick = (preset: 'live' | '24h' | '7d' | 'lifetime') => {
    const now = new Date().toISOString()

    switch (preset) {
      case 'live':
        setTimeRange({ mode: 'live' })
        break

      case '24h': {
        const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        setTimeRange({ mode: 'range', from, to: now })
        break
      }

      case '7d': {
        const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        setTimeRange({ mode: 'range', from, to: now })
        break
      }

      case 'lifetime': {
        const from = campaignStartDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        setTimeRange({ mode: 'range', from, to: now })
        break
      }
    }

    onTimeChange?.()
  }

  const handleCustomRange = () => {
    if (!customFrom || !customTo) return

    setTimeRange({
      mode: 'range',
      from: new Date(customFrom).toISOString(),
      to: new Date(customTo).toISOString(),
    })

    onTimeChange?.()
  }

  const isActive = (preset: string): boolean => {
    if (preset === 'live') return intelligence.timeRange.mode === 'live'

    const { from, to } = intelligence.timeRange
    if (!from || !to) return false

    const now = new Date()
    const fromDate = new Date(from)
    const diffHours = (now.getTime() - fromDate.getTime()) / (1000 * 60 * 60)

    if (preset === '24h') return diffHours >= 23 && diffHours <= 25
    if (preset === '7d') return diffHours >= 167 && diffHours <= 169
    if (preset === 'lifetime') return fromDate.getTime() <= new Date(campaignStartDate || 0).getTime()

    return false
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '16px',
        backgroundColor: flowCoreColours.matteBlack,
        border: `1px solid ${flowCoreColours.borderSubtle}`,
        borderRadius: '8px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Clock size={16} strokeWidth={1.6} style={{ color: flowCoreColours.slateCyan }} />
        <h4
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: flowCoreColours.textPrimary,
            margin: 0,
          }}
        >
          Time Travel
        </h4>
      </div>

      {/* Preset buttons */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {(['live', '24h', '7d', 'lifetime'] as const).map((preset) => {
          const active = isActive(preset)
          const labels = {
            live: 'Live',
            '24h': 'Last 24h',
            '7d': 'Last 7 days',
            lifetime: 'Campaign lifetime',
          }

          return (
            <motion.button
              key={preset}
              onClick={() => handlePresetClick(preset)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: 500,
                color: active ? flowCoreColours.slateCyan : flowCoreColours.textSecondary,
                backgroundColor: active
                  ? `${flowCoreColours.slateCyan}15`
                  : flowCoreColours.matteBlack,
                border: `1px solid ${active ? flowCoreColours.slateCyan : flowCoreColours.borderSubtle}`,
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 120ms cubic-bezier(0.22, 1, 0.36, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {preset === 'live' && <Play size={12} strokeWidth={1.6} />}
              {labels[preset]}
            </motion.button>
          )
        })}
      </div>

      {/* Custom range */}
      <div style={{ borderTop: `1px solid ${flowCoreColours.borderSubtle}`, paddingTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Calendar size={14} strokeWidth={1.6} style={{ color: flowCoreColours.textSecondary }} />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: flowCoreColours.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Custom Range
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="datetime-local"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            style={{
              flex: 1,
              padding: '6px 8px',
              fontSize: '11px',
              color: flowCoreColours.textPrimary,
              backgroundColor: flowCoreColours.matteBlack,
              border: `1px solid ${flowCoreColours.borderSubtle}`,
              borderRadius: '4px',
              outline: 'none',
            }}
          />

          <span style={{ color: flowCoreColours.textTertiary, fontSize: '12px' }}>→</span>

          <input
            type="datetime-local"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            style={{
              flex: 1,
              padding: '6px 8px',
              fontSize: '11px',
              color: flowCoreColours.textPrimary,
              backgroundColor: flowCoreColours.matteBlack,
              border: `1px solid ${flowCoreColours.borderSubtle}`,
              borderRadius: '4px',
              outline: 'none',
            }}
          />

          <motion.button
            onClick={handleCustomRange}
            disabled={!customFrom || !customTo}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 600,
              color: customFrom && customTo ? flowCoreColours.slateCyan : flowCoreColours.textTertiary,
              backgroundColor: 'transparent',
              border: `1px solid ${customFrom && customTo ? flowCoreColours.slateCyan : flowCoreColours.borderSubtle}`,
              borderRadius: '4px',
              cursor: customFrom && customTo ? 'pointer' : 'not-allowed',
              opacity: customFrom && customTo ? 1 : 0.5,
              transition: 'all 120ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            Apply
          </motion.button>
        </div>
      </div>
    </div>
  )
}
