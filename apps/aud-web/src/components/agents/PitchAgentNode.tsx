/**
 * PitchAgentNode Component
 * Phase 15.2-D: Full Agent UI Integration
 *
 * Purpose:
 * - End-to-end pitch creation with asset attachments
 * - Enforces max 8 attachments with privacy filtering
 * - Sound feedback and telemetry tracking
 *
 * Usage:
 * <PitchAgentNode
 *   campaignId="campaign-123"
 *   onPitchGenerated={(pitch) => { ... }}
 * />
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { AssetAttachModal } from '@/components/console/AssetAttachModal'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { logger } from '@/lib/logger'
import type { AssetAttachment } from '@/types/asset-attachment'
import { toast } from 'sonner'
import { playAssetAttachSound, playAssetDetachSound } from '@/lib/asset-sounds'
import { useFlowStateTelemetry } from '@/hooks/useFlowStateTelemetry'

const log = logger.scope('PitchAgentNode')

const MAX_ATTACHMENTS = 8

export interface PitchAgentNodeProps {
  campaignId?: string
  onPitchGenerated?: (pitch: string, attachments: AssetAttachment[]) => void
}

export function PitchAgentNode({ campaignId, onPitchGenerated }: PitchAgentNodeProps) {
  const prefersReducedMotion = useReducedMotion()
  const { trackEvent } = useFlowStateTelemetry()

  const [goal, setGoal] = useState('')
  const [context, setContext] = useState('')
  const [selectedAttachments, setSelectedAttachments] = useState<AssetAttachment[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generatedPitch, setGeneratedPitch] = useState<string | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  /**
   * Auto-resize textarea
   */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [context])

  /**
   * Get kind icon
   */
  const getKindIcon = (kind: string): string => {
    const icons: Record<string, string> = {
      audio: '🎵',
      image: '🖼️',
      document: '📄',
      archive: '📦',
      link: '🔗',
      other: '📁',
    }
    return icons[kind] || '📁'
  }

  /**
   * Handle asset attachment
   */
  const handleAttach = useCallback(
    (attachments: AssetAttachment[]) => {
      setSelectedAttachments(attachments)
      log.info('Assets attached to pitch', { count: attachments.length })

      // Track telemetry
      attachments.forEach((asset) => {
        trackEvent('save', {
          metadata: {
            action: 'asset_attach_to_pitch',
            assetId: asset.id,
            assetKind: asset.kind,
            campaignId,
          },
        })
      })

      toast.success(`${attachments.length} asset${attachments.length === 1 ? '' : 's'} attached 🎧`)
    },
    [campaignId, trackEvent]
  )

  /**
   * Remove attachment chip
   */
  const handleRemoveAttachment = useCallback((assetId: string) => {
    setSelectedAttachments((prev) => prev.filter((a) => a.id !== assetId))
    playAssetDetachSound()
    log.debug('Asset detached from pitch', { assetId })
  }, [])

  /**
   * Generate pitch
   */
  const handleGeneratePitch = useCallback(async () => {
    if (!goal.trim()) {
      toast.error('please enter a pitch goal')
      return
    }

    setLoading(true)
    setGeneratedPitch(null)

    try {
      // Filter private assets
      const publicAttachments = selectedAttachments.filter((a) => a.is_public)
      const filteredCount = selectedAttachments.length - publicAttachments.length

      if (filteredCount > 0) {
        toast.warning(`filtered ${filteredCount} private asset${filteredCount === 1 ? '' : 's'}`)
        log.warn('Private assets filtered from pitch', { filteredCount })
      }

      // Call API
      const response = await fetch('/api/agents/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal,
          context: context || undefined,
          attachments: publicAttachments.length > 0 ? publicAttachments : undefined,
          sessionId: campaignId || `pitch-${Date.now()}`,
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

      // Track telemetry
      trackEvent('save', {
        metadata: {
          action: 'agent_run',
          agentName: 'pitch',
          goal,
          attachmentCount: publicAttachments.length,
          campaignId,
        },
      })

      toast.success('pitch ready — assets attached 🎧')

      // Callback
      if (onPitchGenerated) {
        onPitchGenerated(data.pitch, data.attachments)
      }
    } catch (error) {
      log.error('Pitch generation failed', error)
      toast.error(error instanceof Error ? error.message : 'pitch generation failed')
    } finally {
      setLoading(false)
    }
  }, [goal, context, selectedAttachments, campaignId, onPitchGenerated, trackEvent])

  /**
   * Keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Enter (with Cmd/Ctrl) triggers generation
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        handleGeneratePitch()
      }

      // Esc closes modal
      if (e.key === 'Escape' && modalOpen) {
        e.preventDefault()
        setModalOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [modalOpen, handleGeneratePitch])

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
        pitch agent
      </h2>

      {/* Goal Input */}
      <div style={{ marginBottom: '16px' }}>
        <label
          htmlFor="pitch-goal"
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 500,
            color: flowCoreColours.textSecondary,
            marginBottom: '8px',
            textTransform: 'lowercase',
          }}
        >
          goal <span style={{ color: flowCoreColours.warningOrange }}>*</span>
        </label>
        <input
          id="pitch-goal"
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g., get played on BBC Radio 1"
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

      {/* Context Textarea */}
      <div style={{ marginBottom: '16px' }}>
        <label
          htmlFor="pitch-context"
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
          ref={textareaRef}
          id="pitch-context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Additional context about your music, achievements, etc."
          rows={3}
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
            resize: 'none',
            minHeight: '80px',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = flowCoreColours.slateCyan
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = flowCoreColours.borderGrey
          }}
        />
      </div>

      {/* Attachments */}
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
            attachments ({selectedAttachments.length}/{MAX_ATTACHMENTS})
          </span>
          <button
            onClick={() => setModalOpen(true)}
            disabled={selectedAttachments.length >= MAX_ATTACHMENTS}
            aria-label="Attach assets"
            style={{
              padding: '6px 12px',
              backgroundColor:
                selectedAttachments.length >= MAX_ATTACHMENTS
                  ? flowCoreColours.borderGrey
                  : flowCoreColours.slateCyan,
              border: 'none',
              borderRadius: '4px',
              color:
                selectedAttachments.length >= MAX_ATTACHMENTS
                  ? flowCoreColours.textTertiary
                  : flowCoreColours.matteBlack,
              fontSize: '12px',
              fontWeight: 600,
              cursor: selectedAttachments.length >= MAX_ATTACHMENTS ? 'not-allowed' : 'pointer',
              textTransform: 'lowercase',
              transition: 'all 0.24s ease',
              opacity: selectedAttachments.length >= MAX_ATTACHMENTS ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (selectedAttachments.length < MAX_ATTACHMENTS) {
                e.currentTarget.style.backgroundColor = flowCoreColours.iceCyan
              }
            }}
            onMouseLeave={(e) => {
              if (selectedAttachments.length < MAX_ATTACHMENTS) {
                e.currentTarget.style.backgroundColor = flowCoreColours.slateCyan
              }
            }}
          >
            attach assets
          </button>
        </div>

        {/* Asset Chips */}
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
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <AnimatePresence>
              {selectedAttachments.map((asset) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.24,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(58, 169, 190, 0.1)',
                    border: `1px solid ${flowCoreColours.slateCyan}`,
                    borderRadius: '20px',
                    fontSize: '12px',
                  }}
                >
                  <span>{getKindIcon(asset.kind)}</span>
                  <span
                    style={{
                      color: flowCoreColours.textPrimary,
                      maxWidth: '150px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={asset.title}
                  >
                    {asset.title}
                  </span>
                  {!asset.is_public && (
                    <span
                      style={{
                        fontSize: '10px',
                        color: flowCoreColours.textTertiary,
                      }}
                      title="Private asset - will be filtered"
                    >
                      🔒
                    </span>
                  )}
                  <button
                    onClick={() => handleRemoveAttachment(asset.id)}
                    aria-label={`Remove ${asset.title}`}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: flowCoreColours.textSecondary,
                      fontSize: '14px',
                      cursor: 'pointer',
                      padding: '0 4px',
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGeneratePitch}
        disabled={loading || !goal.trim()}
        aria-label="Generate pitch (⌘Enter)"
        style={{
          width: '100%',
          padding: '12px 20px',
          backgroundColor:
            loading || !goal.trim() ? flowCoreColours.borderGrey : flowCoreColours.slateCyan,
          border: 'none',
          borderRadius: '4px',
          color:
            loading || !goal.trim() ? flowCoreColours.textTertiary : flowCoreColours.matteBlack,
          fontSize: '14px',
          fontWeight: 600,
          cursor: loading || !goal.trim() ? 'not-allowed' : 'pointer',
          textTransform: 'lowercase',
          transition: 'all 0.24s ease',
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
        {!loading && goal.trim() && <span style={{ opacity: 0.7, marginLeft: '8px' }}>⌘↵</span>}
      </button>

      {/* Generated Pitch Output */}
      {generatedPitch && (
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
          {generatedPitch}
        </motion.div>
      )}

      {/* Asset Attach Modal */}
      <AssetAttachModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAttach={handleAttach}
        selectedAssetIds={selectedAttachments.map((a) => a.id)}
        publicOnly={false}
        maxAttachments={MAX_ATTACHMENTS}
      />
    </div>
  )
}
