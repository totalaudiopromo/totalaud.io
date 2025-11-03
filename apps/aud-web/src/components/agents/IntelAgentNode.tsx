/**
 * IntelAgentNode Component
 * Phase 15.2-D: Full Agent UI Integration
 *
 * Purpose:
 * - Shows auto-detected document assets (press releases, bios)
 * - Allow "use for enrichment" toggle per document
 * - Runs intel with selected document context
 *
 * Usage:
 * <IntelAgentNode
 *   campaignId="campaign-123"
 *   userId="user-456"
 *   onIntelGenerated={(research) => { ... }}
 * />
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { logger } from '@/lib/logger'
import type { AssetAttachment } from '@/types/asset-attachment'
import { toast } from 'sonner'
import { useFlowStateTelemetry } from '@/hooks/useFlowStateTelemetry'
import { useAssets } from '@/hooks/useAssets'

const log = logger.scope('IntelAgentNode')

export interface IntelAgentNodeProps {
  campaignId?: string
  userId?: string
  query?: string
  onIntelGenerated?: (research: string, assetsUsed: AssetAttachment[]) => void
}

export function IntelAgentNode({
  campaignId,
  userId,
  query: initialQuery = '',
  onIntelGenerated,
}: IntelAgentNodeProps) {
  const prefersReducedMotion = useReducedMotion()
  const { trackEvent } = useFlowStateTelemetry()
  const { assets: allAssets, loading: loadingAssets } = useAssets({ kind: 'document' })

  const [query, setQuery] = useState(initialQuery)
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [generatedResearch, setGeneratedResearch] = useState<string | null>(null)

  // Auto-select all document assets by default
  useEffect(() => {
    if (allAssets.length > 0 && selectedDocIds.size === 0) {
      setSelectedDocIds(new Set(allAssets.map((a) => a.id)))
    }
  }, [allAssets, selectedDocIds.size])

  /**
   * Toggle document selection
   */
  const toggleDoc = useCallback((docId: string) => {
    setSelectedDocIds((prev) => {
      const next = new Set(prev)
      if (next.has(docId)) {
        next.delete(docId)
      } else {
        next.add(docId)
      }
      return next
    })
  }, [])

  /**
   * Run intel with selected documents
   */
  const handleRunIntel = useCallback(async () => {
    if (!query.trim()) {
      toast.error('please enter a research query')
      return
    }

    setLoading(true)
    setGeneratedResearch(null)

    try {
      const selectedDocs = allAssets.filter((a) => selectedDocIds.has(a.id))

      const response = await fetch('/api/agents/intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          includeAssetContext: selectedDocs.length > 0,
          userId,
          sessionId: campaignId || `intel-${Date.now()}`,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Intel generation failed')
      }

      const data = await response.json()

      setGeneratedResearch(data.research)
      log.info('Intel generated successfully', {
        assetsUsed: data.assetsUsed,
        contextEnhanced: data.metadata.contextEnhanced,
      })

      // Track telemetry for each document used
      selectedDocs.forEach((doc) => {
        trackEvent('save', {
          metadata: {
            action: 'asset_used_for_intel',
            assetId: doc.id,
            assetTitle: doc.title,
            campaignId,
          },
        })
      })

      // Track agent run
      trackEvent('save', {
        metadata: {
          action: 'agent_run',
          agentName: 'intel',
          query,
          assetsUsed: selectedDocs.length,
          campaignId,
        },
      })

      toast.success(`intel ready — enhanced with ${data.assetsUsed} document${data.assetsUsed === 1 ? '' : 's'}`)

      if (onIntelGenerated) {
        onIntelGenerated(data.research, selectedDocs)
      }
    } catch (error) {
      log.error('Intel generation failed', error)
      toast.error(error instanceof Error ? error.message : 'intel generation failed')
    } finally {
      setLoading(false)
    }
  }, [query, allAssets, selectedDocIds, userId, campaignId, onIntelGenerated, trackEvent])

  /**
   * Format file size
   */
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  /**
   * Format date
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
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
      <h2
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: flowCoreColours.iceCyan,
          textTransform: 'lowercase',
          margin: '0 0 16px 0',
          letterSpacing: '0.3px',
        }}
      >
        intel agent
      </h2>

      {/* Query Input */}
      <div style={{ marginBottom: '16px' }}>
        <label
          htmlFor="intel-query"
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 500,
            color: flowCoreColours.textSecondary,
            marginBottom: '8px',
            textTransform: 'lowercase',
          }}
        >
          research query <span style={{ color: flowCoreColours.warningOrange }}>*</span>
        </label>
        <input
          id="intel-query"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., Fred again.."
          aria-required="true"
          style={{
            width: '100%',
            padding: '10px 12px',
            backgroundColor: flowCoreColours.matteBlack,
            border: `1px solid ${flowCoreColours.borderGrey}`,
            borderRadius: '4px',
            color: flowCoreColours.textPrimary,
            fontSize: '13px',
            fontFamily: 'inherit',
            outline: 'none',
            transition: 'border-color 0.24s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = flowCoreColours.slateCyan
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = flowCoreColours.borderGrey
          }}
        />
      </div>

      {/* Document Assets */}
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 500,
            color: flowCoreColours.textSecondary,
            marginBottom: '12px',
            textTransform: 'lowercase',
          }}
        >
          use for enrichment ({selectedDocIds.size} selected)
        </div>

        {loadingAssets && (
          <div
            style={{
              padding: '16px',
              textAlign: 'center',
              color: flowCoreColours.textSecondary,
              fontSize: '12px',
            }}
          >
            loading documents...
          </div>
        )}

        {!loadingAssets && allAssets.length === 0 && (
          <div
            style={{
              padding: '16px',
              backgroundColor: 'rgba(58, 169, 190, 0.05)',
              border: `1px solid ${flowCoreColours.borderGrey}`,
              borderRadius: '4px',
              fontSize: '12px',
              color: flowCoreColours.textTertiary,
              textAlign: 'center',
            }}
          >
            no press materials found — upload bios, press releases, or one-sheets
          </div>
        )}

        {!loadingAssets && allAssets.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {allAssets.map((doc) => {
              const isSelected = selectedDocIds.has(doc.id)
              return (
                <motion.button
                  key={doc.id}
                  onClick={() => toggleDoc(doc.id)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: isSelected
                      ? 'rgba(58, 169, 190, 0.1)'
                      : flowCoreColours.matteBlack,
                    border: `1px solid ${
                      isSelected ? flowCoreColours.slateCyan : flowCoreColours.borderGrey
                    }`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.24s ease',
                  }}
                  aria-pressed={isSelected}
                >
                  {/* Checkbox */}
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      border: `2px solid ${
                        isSelected ? flowCoreColours.iceCyan : flowCoreColours.borderGrey
                      }`,
                      backgroundColor: isSelected ? flowCoreColours.iceCyan : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: flowCoreColours.matteBlack,
                      flexShrink: 0,
                    }}
                  >
                    {isSelected && '✓'}
                  </div>

                  {/* Document Info */}
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: isSelected
                          ? flowCoreColours.iceCyan
                          : flowCoreColours.textPrimary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginBottom: '4px',
                      }}
                    >
                      📄 {doc.title}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: flowCoreColours.textTertiary,
                      }}
                    >
                      {doc.size_bytes && formatSize(doc.size_bytes)}
                      {doc.size_bytes && doc.created_at && ' · '}
                      {doc.created_at && `updated ${formatDate(doc.created_at)}`}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        )}
      </div>

      {/* Run Intel Button */}
      <button
        onClick={handleRunIntel}
        disabled={loading || !query.trim()}
        aria-label="Run intel enrichment"
        style={{
          width: '100%',
          padding: '12px 20px',
          backgroundColor:
            loading || !query.trim() ? flowCoreColours.borderGrey : flowCoreColours.slateCyan,
          border: 'none',
          borderRadius: '4px',
          color:
            loading || !query.trim() ? flowCoreColours.textTertiary : flowCoreColours.matteBlack,
          fontSize: '14px',
          fontWeight: 600,
          cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
          textTransform: 'lowercase',
          transition: 'all 0.24s ease',
          opacity: loading || !query.trim() ? 0.5 : 1,
        }}
        onMouseEnter={(e) => {
          if (!loading && query.trim()) {
            e.currentTarget.style.backgroundColor = flowCoreColours.iceCyan
          }
        }}
        onMouseLeave={(e) => {
          if (!loading && query.trim()) {
            e.currentTarget.style.backgroundColor = flowCoreColours.slateCyan
          }
        }}
      >
        {loading ? 'running intel...' : `run intel ${selectedDocIds.size > 0 ? `with ${selectedDocIds.size} doc${selectedDocIds.size === 1 ? '' : 's'}` : ''}`}
      </button>

      {/* Generated Research Output */}
      {generatedResearch && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.24 }}
          style={{
            marginTop: '16px',
            padding: '16px',
            backgroundColor: flowCoreColours.matteBlack,
            border: `1px solid ${flowCoreColours.borderGrey}`,
            borderRadius: '4px',
            fontSize: '13px',
            color: flowCoreColours.textPrimary,
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
          }}
        >
          {generatedResearch}
        </motion.div>
      )}
    </div>
  )
}
