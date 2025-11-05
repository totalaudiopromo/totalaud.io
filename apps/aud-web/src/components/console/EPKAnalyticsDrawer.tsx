/**
 * EPK Analytics Drawer
 * Phase 15.5: EPK Analytics
 *
 * 480px drawer with tabs (Overview | Regions | Devices)
 * Real-time charts with FlowCore design
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { useEPKAnalytics } from '@aud-web/hooks/useEPKAnalytics'
import { logger } from '@/lib/logger'

const log = logger.scope('EPKAnalyticsDrawer')

export interface EPKAnalyticsDrawerProps {
  epkId: string
  isOpen: boolean
  onClose: () => void
}

type TabType = 'overview' | 'regions' | 'devices'

export function EPKAnalyticsDrawer({ epkId, isOpen, onClose }: EPKAnalyticsDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const { data, loading, error } = useEPKAnalytics({
    epkId,
    groupBy: activeTab === 'regions' ? 'region' : activeTab === 'devices' ? 'device' : 'region',
    enabled: isOpen,
    realtime: true,
  })

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    // TODO: Add sound feedback on tab switch
    log.debug('EPK analytics tab changed', { tab })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              zIndex: 100,
            }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '480px',
              background: flowCoreColours.matteBlack,
              borderLeft: `1px solid ${flowCoreColours.borderSubtle}`,
              zIndex: 101,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px',
                borderBottom: `1px solid ${flowCoreColours.borderSubtle}`,
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: 600,
                    color: flowCoreColours.iceCyan,
                    textTransform: 'lowercase',
                  }}
                >
                  📊 epk analytics
                </h2>
                <button
                  onClick={onClose}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: flowCoreColours.textSecondary,
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '4px',
                    lineHeight: 1,
                  }}
                  aria-label="Close drawer"
                >
                  ✕
                </button>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                {(['overview', 'regions', 'devices'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: activeTab === tab ? flowCoreColours.slateCyan : 'transparent',
                      border: `1px solid ${activeTab === tab ? flowCoreColours.slateCyan : flowCoreColours.borderSubtle}`,
                      borderRadius: '4px',
                      color:
                        activeTab === tab
                          ? flowCoreColours.matteBlack
                          : flowCoreColours.textSecondary,
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      textTransform: 'lowercase',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
              <AnimatePresence mode="wait">
                {loading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      color: flowCoreColours.textSecondary,
                      fontSize: '14px',
                      textAlign: 'center',
                      padding: '40px 0',
                    }}
                  >
                    loading analytics...
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
                      fontSize: '14px',
                      textAlign: 'center',
                      padding: '40px 0',
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
                    style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                  >
                    {/* Overview: Totals */}
                    {activeTab === 'overview' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                          { label: 'total views', value: data.totals.views, icon: '👁' },
                          { label: 'total downloads', value: data.totals.downloads, icon: '⬇' },
                          { label: 'total shares', value: data.totals.shares, icon: '↗' },
                        ].map((metric) => (
                          <div
                            key={metric.label}
                            style={{
                              padding: '16px',
                              background: flowCoreColours.cardBackground,
                              border: `1px solid ${flowCoreColours.borderSubtle}`,
                              borderRadius: '6px',
                            }}
                          >
                            <div
                              style={{
                                fontSize: '12px',
                                color: flowCoreColours.textTertiary,
                                textTransform: 'lowercase',
                                marginBottom: '8px',
                              }}
                            >
                              {metric.icon} {metric.label}
                            </div>
                            <div
                              style={{
                                fontSize: '32px',
                                fontWeight: 600,
                                color: flowCoreColours.iceCyan,
                              }}
                            >
                              {metric.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Regions or Devices: Grouped data */}
                    {(activeTab === 'regions' || activeTab === 'devices') && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: '14px',
                            fontWeight: 600,
                            color: flowCoreColours.textSecondary,
                            textTransform: 'lowercase',
                          }}
                        >
                          by {activeTab === 'regions' ? 'region' : 'device'}
                        </h3>

                        {data.grouped.length === 0 ? (
                          <div
                            style={{
                              color: flowCoreColours.textTertiary,
                              fontSize: '13px',
                              textAlign: 'center',
                              padding: '20px 0',
                            }}
                          >
                            no data yet
                          </div>
                        ) : (
                          data.grouped.map((group) => (
                            <div
                              key={group.name}
                              style={{
                                padding: '12px',
                                background: flowCoreColours.cardBackground,
                                border: `1px solid ${flowCoreColours.borderSubtle}`,
                                borderRadius: '6px',
                              }}
                            >
                              <div
                                style={{
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  color: flowCoreColours.textPrimary,
                                  marginBottom: '8px',
                                }}
                              >
                                {group.name}
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  gap: '16px',
                                  fontSize: '12px',
                                  color: flowCoreColours.textSecondary,
                                }}
                              >
                                <span>👁 {group.views}</span>
                                <span>⬇ {group.downloads}</span>
                                <span>↗ {group.shares}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div
                      style={{
                        fontSize: '11px',
                        color: flowCoreColours.textTertiary,
                        textAlign: 'center',
                        marginTop: '20px',
                      }}
                    >
                      {data.eventCount} events tracked • realtime updates enabled
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Keyboard hint */}
            <div
              style={{
                padding: '12px 20px',
                borderTop: `1px solid ${flowCoreColours.borderSubtle}`,
                fontSize: '11px',
                color: flowCoreColours.textTertiary,
                textAlign: 'center',
              }}
            >
              press <span style={{ color: flowCoreColours.slateCyan }}>⌘e</span> to close
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
