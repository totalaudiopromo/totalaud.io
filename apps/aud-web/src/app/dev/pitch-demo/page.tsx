/**
 * Pitch Agent Demonstration Page
 * Phase 15.2-C: Agent Integration Layer
 *
 * Purpose:
 * - Demonstrate asset attachment to PitchAgent
 * - Show privacy filtering in action
 * - Test telemetry event logging
 *
 * Access: /dev/pitch-demo
 */

'use client'

export const dynamic = 'force-dynamic'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AssetAttachModal } from '@/components/console/AssetAttachModal'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { FileText, Lock } from 'lucide-react'
import { getAssetKindIcon } from '@/components/assets/assetKindIcons'
import { logger } from '@/lib/logger'
import type { AssetAttachment } from '@/types/asset-attachment'
import { toast } from 'sonner'

const log = logger.scope('PitchDemo')

export default function PitchDemoPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedAttachments, setSelectedAttachments] = useState<AssetAttachment[]>([])
  const [goal, setGoal] = useState('')
  const [context, setContext] = useState('')
  const [generatedPitch, setGeneratedPitch] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  /**
   * Handle asset attachments
   */
  const handleAttach = useCallback((attachments: AssetAttachment[]) => {
    setSelectedAttachments(attachments)
    log.info('Assets attached to pitch', { count: attachments.length })
    toast.success(`${attachments.length} asset${attachments.length === 1 ? '' : 's'} attached`)
  }, [])

  /**
   * Handle pitch generation
   */
  const handleGeneratePitch = useCallback(async () => {
    if (!goal.trim()) {
      toast.error('please enter a pitch goal')
      return
    }

    setLoading(true)
    setGeneratedPitch(null)

    try {
      const response = await fetch('/api/agents/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal,
          context: context || undefined,
          attachments: selectedAttachments.length > 0 ? selectedAttachments : undefined,
          sessionId: 'demo-session-' + Date.now(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Pitch generation failed')
      }

      const data = await response.json()

      setGeneratedPitch(data.pitch)
      log.info('Pitch generated successfully', {
        attachmentCount: data.attachments.length,
        filteredPrivateCount: data.metadata.filteredPrivateCount,
      })

      toast.success('pitch ready — assets attached')

      // Log warning if private assets were filtered
      if (data.metadata.filteredPrivateCount > 0) {
        toast.warning(
          `${data.metadata.filteredPrivateCount} private asset${data.metadata.filteredPrivateCount === 1 ? '' : 's'} excluded from pitch`
        )
      }
    } catch (error) {
      log.error('Pitch generation failed', { error })
      toast.error(error instanceof Error ? error.message : 'pitch generation failed')
    } finally {
      setLoading(false)
    }
  }, [goal, context, selectedAttachments])

  /**
   * Get kind icon
   */
  const getKindIcon = (kind: string) => getAssetKindIcon(kind)

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: flowCoreColours.matteBlack,
        color: flowCoreColours.textPrimary,
        fontFamily:
          'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '24px',
          borderBottom: `1px solid ${flowCoreColours.borderGrey}`,
        }}
      >
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 600,
            color: flowCoreColours.iceCyan,
            textTransform: 'lowercase',
            letterSpacing: '0.3px',
            margin: '0 0 4px 0',
          }}
        >
          pitch agent demo
        </h1>
        <p
          style={{
            fontSize: '13px',
            color: flowCoreColours.textSecondary,
            margin: 0,
          }}
        >
          phase 15.2-c: agent integration layer with asset attachments
        </p>
      </header>

      {/* Main Content */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '32px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Input Panel */}
        <div>
          <div
            style={{
              backgroundColor: flowCoreColours.darkGrey,
              border: `1px solid ${flowCoreColours.borderGrey}`,
              borderRadius: '8px',
              padding: '24px',
            }}
          >
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: flowCoreColours.iceCyan,
                textTransform: 'lowercase',
                margin: '0 0 16px 0',
              }}
            >
              pitch input
            </h2>

            {/* Goal Input */}
            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="goal"
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: flowCoreColours.textSecondary,
                  marginBottom: '8px',
                  textTransform: 'lowercase',
                }}
              >
                goal (required)
              </label>
              <input
                id="goal"
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g., get played on BBC Radio 1"
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
                  transition: 'border-color var(--flowcore-motion-normal) ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = flowCoreColours.slateCyan
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = flowCoreColours.borderGrey
                }}
              />
            </div>

            {/* Context Input */}
            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="context"
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: flowCoreColours.textSecondary,
                  marginBottom: '8px',
                  textTransform: 'lowercase',
                }}
              >
                context (optional)
              </label>
              <textarea
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Additional context about your music, previous achievements, etc."
                rows={4}
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
                  transition: 'border-color var(--flowcore-motion-normal) ease',
                  resize: 'vertical',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = flowCoreColours.slateCyan
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = flowCoreColours.borderGrey
                }}
              />
            </div>

            {/* Attached Assets */}
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: flowCoreColours.textSecondary,
                    textTransform: 'lowercase',
                  }}
                >
                  attachments
                </span>
                <button
                  onClick={() => setModalOpen(true)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: flowCoreColours.slateCyan,
                    border: 'none',
                    borderRadius: '4px',
                    color: flowCoreColours.matteBlack,
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'lowercase',
                    transition: 'all var(--flowcore-motion-normal) ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = flowCoreColours.iceCyan
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = flowCoreColours.slateCyan
                  }}
                >
                  attach assets
                </button>
              </div>

              {selectedAttachments.length === 0 ? (
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
                  no assets attached yet
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {selectedAttachments.map((asset) => (
                    <div
                      key={asset.id}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: 'rgba(58, 169, 190, 0.1)',
                        border: `1px solid ${flowCoreColours.slateCyan}`,
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '12px',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          color: flowCoreColours.slateCyan,
                        }}
                      >
                        {(() => {
                          const Icon = getKindIcon(asset.kind)
                          return <Icon size={14} strokeWidth={1.4} />
                        })()}
                      </span>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          flex: 1,
                          color: flowCoreColours.textPrimary,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {(() => {
                          const Icon = getKindIcon(asset.kind)
                          return <Icon size={14} strokeWidth={1.4} />
                        })()}
                        {asset.title}
                      </span>
                      {!asset.is_public && (
                        <span
                          style={{
                            fontSize: '11px',
                            color: flowCoreColours.warningOrange,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Lock size={12} strokeWidth={1.5} />
                          private
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGeneratePitch}
              disabled={loading || !goal.trim()}
              style={{
                width: '100%',
                padding: '12px 20px',
                backgroundColor:
                  loading || !goal.trim() ? flowCoreColours.borderGrey : flowCoreColours.slateCyan,
                border: 'none',
                borderRadius: '4px',
                color:
                  loading || !goal.trim()
                    ? flowCoreColours.textTertiary
                    : flowCoreColours.matteBlack,
                fontSize: '14px',
                fontWeight: 600,
                cursor: loading || !goal.trim() ? 'not-allowed' : 'pointer',
                textTransform: 'lowercase',
                transition: 'all var(--flowcore-motion-normal) ease',
                opacity: loading || !goal.trim() ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading && goal.trim()) {
                  e.currentTarget.style.backgroundColor = flowCoreColours.iceCyan
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && goal.trim()) {
                  e.currentTarget.style.backgroundColor = flowCoreColours.slateCyan
                }
              }}
            >
              {loading ? 'generating pitch...' : 'generate pitch'}
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div>
          <div
            style={{
              backgroundColor: flowCoreColours.darkGrey,
              border: `1px solid ${flowCoreColours.borderGrey}`,
              borderRadius: '8px',
              padding: '24px',
              minHeight: '400px',
            }}
          >
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: flowCoreColours.iceCyan,
                textTransform: 'lowercase',
                margin: '0 0 16px 0',
              }}
            >
              generated pitch
            </h2>

            {!generatedPitch && !loading && (
              <div
                style={{
                  padding: '48px 24px',
                  textAlign: 'center',
                  color: flowCoreColours.textTertiary,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <FileText size={64} strokeWidth={1.5} />
                </div>
                <div style={{ fontSize: '14px' }}>enter a goal and generate your pitch</div>
              </div>
            )}

            {loading && (
              <div
                style={{
                  padding: '48px 24px',
                  textAlign: 'center',
                  color: flowCoreColours.textSecondary,
                }}
              >
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ fontSize: '14px' }}
                >
                  generating pitch with {selectedAttachments.length} attachment
                  {selectedAttachments.length === 1 ? '' : 's'}...
                </motion.div>
              </div>
            )}

            {generatedPitch && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24 }}
                style={{
                  padding: '16px',
                  backgroundColor: flowCoreColours.matteBlack,
                  border: `1px solid ${flowCoreColours.borderGrey}`,
                  borderRadius: '4px',
                  fontSize: '13px',
                  color: flowCoreColours.textPrimary,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                }}
              >
                {generatedPitch}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Asset Attach Modal */}
      <AssetAttachModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAttach={handleAttach}
        selectedAssetIds={selectedAttachments.map((a) => a.id)}
        publicOnly={false}
      />
    </div>
  )
}
