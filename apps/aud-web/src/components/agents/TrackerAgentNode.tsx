/**
 * TrackerAgentNode Component
 * Phase 15.2-D: Full Agent UI Integration
 *
 * Purpose:
 * - Display outreach logs with asset attachments
 * - Click asset icon → opens AssetViewModal
 * - Shows contact name, message preview, asset link, sent date, status
 *
 * Usage:
 * <TrackerAgentNode
 *   campaignId="campaign-123"
 *   userId="user-456"
 * />
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { logger } from '@/lib/logger'
import type { OutreachLog as OrchestrationOutreachLog } from '@/types/console'
import { useFlowStateTelemetry } from '@/hooks/useFlowStateTelemetry'
import { AssetViewModal } from '@/components/console/AssetViewModal'
import { useOrchestration } from '@/contexts/OrchestrationContext'
import { getAssetKindIcon } from '@/components/assets/assetKindIcons'
import { BarChart2 } from 'lucide-react'

const log = logger.scope('TrackerAgentNode')

type TrackerStatus = 'sent' | 'replied' | 'bounced' | 'pending'

interface TrackerLogEntry {
  id: string
  contactName: string
  message: string
  assetId?: string
  assetTitle?: string
  assetKind?: string
  sentAt: string
  status: TrackerStatus
  campaignId?: string
}

export interface TrackerAgentNodeProps {
  campaignId?: string
  userId?: string
}

export function TrackerAgentNode({ campaignId, userId }: TrackerAgentNodeProps) {
  const prefersReducedMotion = useReducedMotion()
  const { trackEvent } = useFlowStateTelemetry()
  const { recentLogs } = useOrchestration()

  const [logs, setLogs] = useState<TrackerLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)

  /**
   * Merge API logs with recent orchestration logs
   */
  useEffect(() => {
    if (recentLogs.length === 0) return

    const convertedLogs: TrackerLogEntry[] = recentLogs.map(
      (orchLog: OrchestrationOutreachLog) => ({
        id: orchLog.id,
        contactName: orchLog.contact_name ?? 'unknown contact',
        message: orchLog.message_preview,
        assetId: orchLog.asset_ids[0],
        assetTitle: undefined,
        assetKind: undefined,
        sentAt: orchLog.timestamp,
        status: orchLog.status,
        campaignId: orchLog.campaign_id,
      })
    )

    setLogs((prevLogs) => {
      const existingIds = new Set(prevLogs.map((entry) => entry.id))
      const newLogs = convertedLogs.filter((entry) => !existingIds.has(entry.id))
      return [...newLogs, ...prevLogs]
    })

    trackEvent('tracker_update', {
      metadata: {
        campaignId,
        logCount: convertedLogs.length,
        source: 'orchestration',
      },
    })
  }, [recentLogs, campaignId, trackEvent])

  /**
   * Fetch outreach logs on mount
   */
  useEffect(() => {
    fetchOutreachLogs()
  }, [campaignId, userId])

  /**
   * Fetch outreach logs from API
   */
  const fetchOutreachLogs = useCallback(async () => {
    if (!campaignId || !userId) {
      setLogs([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/agents/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: campaignId,
          userId,
          campaignId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch outreach logs')
      }

      const data = await response.json()
      const fetchedLogs: TrackerLogEntry[] = Array.isArray(data.logs)
        ? data.logs.map((raw: any) => ({
            id: String(raw.id),
            contactName: raw.contact_name ?? 'unknown contact',
            message:
              raw.message_preview ??
              raw.message ??
              raw.result_data?.message ??
              'no message available',
            assetId: raw.asset_id ?? raw.asset_ids?.[0],
            assetTitle: raw.asset_title ?? undefined,
            assetKind: raw.asset_kind ?? undefined,
            sentAt: raw.sent_at ?? raw.created_at ?? new Date().toISOString(),
            status: (raw.status ?? 'sent') as TrackerStatus,
            campaignId: raw.campaign_id ?? undefined,
          }))
        : []

      setLogs(fetchedLogs)
      log.info('Outreach logs fetched', { count: fetchedLogs.length })

      trackEvent('tracker_update', {
        metadata: {
          campaignId,
          logCount: fetchedLogs.length,
          source: 'fetch',
        },
      })
    } catch (error) {
      log.error('Failed to fetch outreach logs', error)
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [campaignId, userId, trackEvent])

  /**
   * Handle asset icon click
   */
  const handleAssetClick = useCallback(
    (assetId: string | undefined, logId: string) => {
      if (!assetId) return
      log.info('Asset clicked from tracker', { assetId, logId })

      // Track telemetry
      trackEvent('save', {
        metadata: {
          action: 'asset_view_from_tracker',
          assetId,
          logId,
          campaignId,
        },
      })

      setSelectedAssetId(assetId)
      setViewModalOpen(true)
    },
    [campaignId, trackEvent]
  )

  /**
   * Format date to British format
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  /**
   * Get status badge colour
   */
  const getStatusColour = (status: TrackerStatus): string => {
    switch (status) {
      case 'sent':
        return flowCoreColours.slateCyan
      case 'replied':
        return flowCoreColours.iceCyan
      case 'bounced':
        return flowCoreColours.warningOrange
      case 'pending':
        return flowCoreColours.textTertiary
      default:
        return flowCoreColours.borderGrey
    }
  }

  /**
   * Get asset kind icon
   */
  const getKindIcon = (kind: string) => getAssetKindIcon(kind)

  return (
    <>
      <div
        style={{
          backgroundColor: flowCoreColours.darkGrey,
          border: `1px solid ${flowCoreColours.borderGrey}`,
          borderRadius: '8px',
          padding: '24px',
          fontFamily:
            'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <h2
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: flowCoreColours.iceCyan,
              textTransform: 'lowercase',
              margin: 0,
              letterSpacing: '0.3px',
            }}
          >
            tracker agent
          </h2>
          <button
            onClick={fetchOutreachLogs}
            disabled={loading}
            aria-label="Refresh outreach logs"
            style={{
              padding: '6px 12px',
              backgroundColor: 'transparent',
              border: `1px solid ${flowCoreColours.borderGrey}`,
              borderRadius: '4px',
              color: flowCoreColours.textSecondary,
              fontSize: '12px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              textTransform: 'lowercase',
              transition: 'all var(--flowcore-motion-normal) ease',
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.borderColor = flowCoreColours.slateCyan
                e.currentTarget.style.color = flowCoreColours.slateCyan
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.borderColor = flowCoreColours.borderGrey
                e.currentTarget.style.color = flowCoreColours.textSecondary
              }
            }}
          >
            {loading ? 'loading...' : 'refresh'}
          </button>
        </div>

        {(!campaignId || !userId) && (
          <div
            style={{
              padding: '16px',
              backgroundColor: 'rgba(58, 169, 190, 0.05)',
              border: `1px solid ${flowCoreColours.borderGrey}`,
              borderRadius: '6px',
              fontSize: '12px',
              color: flowCoreColours.textSecondary,
              textAlign: 'center',
              marginBottom: '16px',
            }}
          >
            select a campaign to view outreach logs
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div
            style={{
              padding: '32px',
              textAlign: 'center',
              color: flowCoreColours.textSecondary,
              fontSize: '13px',
            }}
          >
            loading outreach logs...
          </div>
        )}

        {/* Empty State */}
        {!loading && logs.length === 0 && (
          <div
            style={{
              padding: '32px',
              backgroundColor: 'rgba(58, 169, 190, 0.05)',
              border: `1px solid ${flowCoreColours.borderGrey}`,
              borderRadius: '4px',
              textAlign: 'center',
            }}
          >
            <div style={{ marginBottom: '12px', color: flowCoreColours.slateCyan }}>
              <BarChart2 size={32} strokeWidth={1.5} />
            </div>
            <div
              style={{
                fontSize: '13px',
                color: flowCoreColours.textSecondary,
                marginBottom: '4px',
              }}
            >
              no outreach logged yet
            </div>
            <div
              style={{
                fontSize: '12px',
                color: flowCoreColours.textTertiary,
              }}
            >
              use pitch agent to send messages with assets attached
            </div>
          </div>
        )}

        {/* Outreach Logs Table */}
        {!loading && logs.length > 0 && (
          <div
            style={{
              overflowX: 'auto',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px',
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: `1px solid ${flowCoreColours.borderGrey}`,
                  }}
                >
                  <th
                    style={{
                      padding: '12px 8px',
                      textAlign: 'left',
                      fontWeight: 500,
                      color: flowCoreColours.textSecondary,
                      textTransform: 'lowercase',
                      fontSize: '12px',
                    }}
                  >
                    contact
                  </th>
                  <th
                    style={{
                      padding: '12px 8px',
                      textAlign: 'left',
                      fontWeight: 500,
                      color: flowCoreColours.textSecondary,
                      textTransform: 'lowercase',
                      fontSize: '12px',
                    }}
                  >
                    message
                  </th>
                  <th
                    style={{
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontWeight: 500,
                      color: flowCoreColours.textSecondary,
                      textTransform: 'lowercase',
                      fontSize: '12px',
                      width: '60px',
                    }}
                  >
                    asset
                  </th>
                  <th
                    style={{
                      padding: '12px 8px',
                      textAlign: 'left',
                      fontWeight: 500,
                      color: flowCoreColours.textSecondary,
                      textTransform: 'lowercase',
                      fontSize: '12px',
                    }}
                  >
                    sent
                  </th>
                  <th
                    style={{
                      padding: '12px 8px',
                      textAlign: 'left',
                      fontWeight: 500,
                      color: flowCoreColours.textSecondary,
                      textTransform: 'lowercase',
                      fontSize: '12px',
                      width: '80px',
                    }}
                  >
                    status
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((logItem, index) => (
                  <motion.tr
                    key={logItem.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 0.24,
                      delay: prefersReducedMotion ? 0 : index * 0.05,
                    }}
                    style={{
                      borderBottom: `1px solid ${flowCoreColours.borderGrey}`,
                    }}
                  >
                    {/* Contact Name */}
                    <td
                      style={{
                        padding: '12px 8px',
                        color: flowCoreColours.textPrimary,
                        fontWeight: 500,
                      }}
                    >
                      {logItem.contactName}
                    </td>

                    {/* Message Preview */}
                    <td
                      style={{
                        padding: '12px 8px',
                        color: flowCoreColours.textSecondary,
                        maxWidth: '300px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {logItem.message}
                    </td>

                    {/* Asset Icon (clickable if present) */}
                    <td
                      style={{
                        padding: '12px 8px',
                        textAlign: 'center',
                      }}
                    >
                      {logItem.assetId && logItem.assetKind ? (
                        <button
                          onClick={() => handleAssetClick(logItem.assetId, logItem.id)}
                          aria-label={`View asset: ${logItem.assetTitle || 'Untitled'}`}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '20px',
                            padding: '4px',
                            transition: 'transform var(--flowcore-motion-fast) ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.2)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)'
                          }}
                          title={logItem.assetTitle || 'View asset'}
                        >
                          {(() => {
                            const Icon = getKindIcon(logItem.assetKind!)
                            return <Icon size={18} strokeWidth={1.4} />
                          })()}
                        </button>
                      ) : (
                        <span
                          style={{
                            color: flowCoreColours.textTertiary,
                            fontSize: '12px',
                          }}
                        >
                          —
                        </span>
                      )}
                    </td>

                    {/* Sent Date */}
                    <td
                      style={{
                        padding: '12px 8px',
                        color: flowCoreColours.textTertiary,
                        fontSize: '12px',
                      }}
                    >
                      {formatDate(logItem.sentAt)}
                    </td>

                    {/* Status Badge */}
                    <td
                      style={{
                        padding: '12px 8px',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: `${getStatusColour(logItem.status)}20`,
                          color: getStatusColour(logItem.status),
                          fontSize: '11px',
                          fontWeight: 600,
                          textTransform: 'lowercase',
                        }}
                      >
                        {logItem.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Footer */}
        {!loading && logs.length > 0 && (
          <div
            style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: `1px solid ${flowCoreColours.borderGrey}`,
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: flowCoreColours.textTertiary,
            }}
          >
            <span>
              {logs.length} outreach log{logs.length === 1 ? '' : 's'}
            </span>
            <span>
              {logs.filter((l) => l.assetId).length} with asset
              {logs.filter((l) => l.assetId).length === 1 ? '' : 's'}
            </span>
          </div>
        )}
      </div>

      {/* Asset View Modal */}
      {selectedAssetId && (
        <AssetViewModal
          assetId={selectedAssetId}
          open={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false)
            setSelectedAssetId(null)
          }}
        />
      )}
    </>
  )
}
