/**
 * Campaign Dashboard Panel
 * Phase 15.5: Connected Campaign Dashboard
 *
 * Right-dock panel showing campaign performance metrics
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { useCampaignDashboard } from '@aud-web/hooks/useCampaignDashboard'
import { logger } from '@/lib/logger'
import { BarChart2, Download, Eye, Share2, Zap } from 'lucide-react'

const log = logger.scope('CampaignDashboardPanel')

export interface CampaignDashboardPanelProps {
  campaignId: string
  onOpenEPKAnalytics?: () => void
}

export function CampaignDashboardPanel({
  campaignId,
  onOpenEPKAnalytics,
}: CampaignDashboardPanelProps) {
  const [period, setPeriod] = useState<7 | 30>(7)
  const { data, loading, error } = useCampaignDashboard({ campaignId, period })

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toString()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.24 }}
      style={{
        width: '320px',
        height: '100%',
        background: flowCoreColours.matteBlack,
        borderLeft: `1px solid ${flowCoreColours.borderSubtle}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: `1px solid ${flowCoreColours.borderSubtle}`,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: 600,
            color: flowCoreColours.iceCyan,
            textTransform: 'lowercase',
          }}
        >
          campaign dashboard
        </h3>

        {/* Period toggle */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginTop: '12px',
          }}
        >
          {([7, 30] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              aria-label={`View ${p} day metrics`}
              aria-pressed={period === p}
              style={{
                flex: 1,
                padding: '6px 12px',
                background: period === p ? flowCoreColours.slateCyan : 'transparent',
                border: `1px solid ${period === p ? flowCoreColours.slateCyan : flowCoreColours.borderSubtle}`,
                borderRadius: '4px',
                color: period === p ? flowCoreColours.matteBlack : flowCoreColours.textSecondary,
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                textTransform: 'lowercase',
                transition: 'all var(--flowcore-motion-fast) ease',
              }}
            >
              {p}d
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                color: flowCoreColours.textSecondary,
                fontSize: '13px',
                textAlign: 'center',
                padding: '20px 0',
              }}
            >
              loading metrics...
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                color: flowCoreColours.errorRed,
                fontSize: '13px',
                textAlign: 'center',
                padding: '20px 0',
              }}
            >
              {error}
            </motion.div>
          )}

          {!loading && !error && data && (
            <motion.div
              key="data"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.24 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {/* Metrics cards */}
              {[
                { label: 'views', value: data.metrics.views, icon: Eye },
                { label: 'downloads', value: data.metrics.downloads, icon: Download },
                { label: 'shares', value: data.metrics.shares, icon: Share2 },
                {
                  label: 'engagement',
                  value: data.metrics.engagementScore.toFixed(1),
                  suffix: '%',
                  icon: Zap,
                },
              ].map((metric) => (
                <div
                  key={metric.label}
                  style={{
                    padding: '12px',
                    background: flowCoreColours.cardBackground,
                    border: `1px solid ${flowCoreColours.borderSubtle}`,
                    borderRadius: '6px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      color: flowCoreColours.textTertiary,
                      textTransform: 'lowercase',
                      marginBottom: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <metric.icon size={14} strokeWidth={1.6} />
                    {metric.label}
                  </div>
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: 600,
                      color: flowCoreColours.iceCyan,
                    }}
                  >
                    {typeof metric.value === 'number' ? formatNumber(metric.value) : metric.value}
                    {metric.suffix && (
                      <span style={{ fontSize: '14px', marginLeft: '2px' }}>{metric.suffix}</span>
                    )}
                  </div>
                </div>
              ))}

              {/* Open EPK Analytics button */}
              {onOpenEPKAnalytics && (
                <button
                  onClick={() => {
                    log.debug('Opening EPK analytics')
                    onOpenEPKAnalytics()
                  }}
                  aria-label="Open EPK analytics drawer"
                  style={{
                    padding: '12px',
                    background: flowCoreColours.slateCyan,
                    border: 'none',
                    borderRadius: '6px',
                    color: flowCoreColours.matteBlack,
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'lowercase',
                    transition: 'all var(--flowcore-motion-fast) ease',
                    marginTop: '8px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = flowCoreColours.iceCyan
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = flowCoreColours.slateCyan
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart2 size={16} strokeWidth={1.6} />
                    open epk analytics
                  </span>
                </button>
              )}

              {/* Footer info */}
              <div
                style={{
                  fontSize: '11px',
                  color: flowCoreColours.textTertiary,
                  textAlign: 'center',
                  marginTop: '8px',
                }}
              >
                {data.dataPoints} data points • last {period} days
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
