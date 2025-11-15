/**
 * AssetAttachModal Component
 * Phase 15.2-C: Agent Integration Layer
 *
 * Purpose:
 * - Multi-select asset attachment modal
 * - Privacy-aware filtering (public assets only for external shares)
 * - Integration with PitchAgent, IntelAgent, TrackerAgent
 *
 * Usage:
 * <AssetAttachModal
 *   open={open}
 *   onClose={handleClose}
 *   onAttach={handleAttach}
 *   selectedAssetIds={selectedIds}
 *   publicOnly={false}
 * />
 */

'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAssets } from '@/hooks/useAssets'
import type { Asset } from '@/hooks/useAssets'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { logger } from '@/lib/logger'
import type { AssetAttachment } from '@/types/asset-attachment'
import { toast } from 'sonner'
import { Archive, Lock, LockOpen, Paperclip, X } from 'lucide-react'
import { playAssetAttachSound, playAssetDetachSound, playAssetErrorSound } from '@/lib/asset-sounds'
import { getAssetKindIcon } from '@/components/assets/assetKindIcons'

const log = logger.scope('AssetAttachModal')

export interface AssetAttachModalProps {
  open: boolean
  onClose: () => void
  onAttach: (attachments: AssetAttachment[]) => void
  selectedAssetIds?: string[]
  publicOnly?: boolean
  maxAttachments?: number
  allowedKinds?: Array<'audio' | 'image' | 'document' | 'archive' | 'link' | 'other'>
}

export function AssetAttachModal({
  open,
  onClose,
  onAttach,
  selectedAssetIds = [],
  publicOnly = false,
  maxAttachments,
  allowedKinds,
}: AssetAttachModalProps) {
  const { assets, loading, error } = useAssets()
  const [localSelectedIds, setLocalSelectedIds] = useState<Set<string>>(new Set(selectedAssetIds))

  /**
   * Filter assets based on privacy and kind restrictions
   */
  const filteredAssets = useMemo(() => {
    let filtered = assets

    // Filter by public-only requirement
    if (publicOnly) {
      filtered = filtered.filter((asset) => asset.is_public)
    }

    // Filter by allowed kinds
    if (allowedKinds && allowedKinds.length > 0) {
      filtered = filtered.filter((asset) => allowedKinds.includes(asset.kind))
    }

    return filtered
  }, [assets, publicOnly, allowedKinds])

  /**
   * Get kind icon
   */
  const getKindIcon = (kind: string) => getAssetKindIcon(kind)

  /**
   * Toggle asset selection
   */
  const toggleSelection = useCallback(
    (assetId: string, isPublic: boolean) => {
      // Warn if trying to select private asset
      if (!isPublic && publicOnly) {
        toast.error('file is private — make public first')
        log.warn('Attempted to attach private asset', { assetId })
        playAssetErrorSound()
        return
      }

      // Check max attachments limit
      if (
        maxAttachments &&
        !localSelectedIds.has(assetId) &&
        localSelectedIds.size >= maxAttachments
      ) {
        toast.error(`maximum ${maxAttachments} attachments allowed`)
        playAssetErrorSound()
        return
      }

      setLocalSelectedIds((prev) => {
        const next = new Set(prev)
        const wasSelected = next.has(assetId)

        if (wasSelected) {
          next.delete(assetId)
          playAssetDetachSound()
        } else {
          next.add(assetId)
          playAssetAttachSound()
        }
        return next
      })
    },
    [localSelectedIds, maxAttachments, publicOnly]
  )

  const assetToAttachment = useCallback((asset: Asset): AssetAttachment | null => {
    if (!asset.url) {
      return null
    }

    return {
      id: asset.id,
      title: asset.title,
      kind: asset.kind,
      url: asset.url,
      is_public: asset.is_public,
      byte_size: asset.byte_size ?? undefined,
      mime_type: asset.mime_type ?? undefined,
      created_at: asset.created_at ?? undefined,
    }
  }, [])

  /**
   * Handle attach button click
   */
  const handleAttachClick = useCallback(() => {
    const selectedAttachments = filteredAssets
      .filter((asset) => localSelectedIds.has(asset.id))
      .map(assetToAttachment)
      .filter((attachment): attachment is AssetAttachment => attachment !== null)

    if (selectedAttachments.length === 0) {
      toast.error('no valid assets selected', {
        description: 'choose assets with active URLs',
      })
      return
    }

    log.info('Assets attached', { count: selectedAttachments.length })
    onAttach(selectedAttachments)
    onClose()
  }, [assetToAttachment, filteredAssets, localSelectedIds, onAttach, onClose])

  /**
   * Handle cancel
   */
  const handleCancel = useCallback(() => {
    setLocalSelectedIds(new Set(selectedAssetIds))
    onClose()
  }, [selectedAssetIds, onClose])

  /**
   * Format file size
   */
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              zIndex: 100,
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '800px',
              maxHeight: '80vh',
              zIndex: 101,
              backgroundColor: flowCoreColours.matteBlack,
              border: `2px solid ${flowCoreColours.borderGrey}`,
              borderRadius: '8px',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
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
                marginBottom: '24px',
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    color: flowCoreColours.iceCyan,
                    textTransform: 'lowercase',
                    margin: 0,
                    marginBottom: '4px',
                  }}
                >
                  attach assets
                </h2>
                <p
                  style={{
                    fontSize: '13px',
                    color: flowCoreColours.textSecondary,
                    margin: 0,
                  }}
                >
                  {localSelectedIds.size} selected
                  {maxAttachments && ` (max ${maxAttachments})`}
                </p>
              </div>
              <button
                onClick={handleCancel}
                aria-label="Close modal"
                style={{
                  background: 'none',
                  border: 'none',
                  color: flowCoreColours.textSecondary,
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '4px',
                  lineHeight: 1,
                }}
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Filters Info */}
            {(publicOnly || allowedKinds) && (
              <div
                style={{
                  marginBottom: '16px',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(58, 169, 190, 0.05)',
                  border: `1px solid ${flowCoreColours.borderGrey}`,
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: flowCoreColours.textSecondary,
                }}
              >
                {publicOnly && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LockOpen size={16} strokeWidth={1.5} />
                    <span>showing public assets only</span>
                  </div>
                )}
                {allowedKinds && allowedKinds.length > 0 && (
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}
                  >
                    <Paperclip size={16} strokeWidth={1.5} />
                    <span
                      style={{
                        display: 'flex',
                        gap: '6px',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                      }}
                    >
                      allowed types:
                      {allowedKinds.map((kind) => {
                        const Icon = getKindIcon(kind)
                        return <Icon key={kind} size={14} strokeWidth={1.5} />
                      })}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Asset List */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                marginBottom: '24px',
              }}
            >
              {loading && (
                <div
                  style={{
                    padding: '48px 24px',
                    textAlign: 'center',
                    color: flowCoreColours.textSecondary,
                  }}
                >
                  loading assets...
                </div>
              )}

              {error && (
                <div
                  style={{
                    padding: '48px 24px',
                    textAlign: 'center',
                    color: flowCoreColours.warningOrange,
                  }}
                >
                  {error}
                </div>
              )}

              {!loading && !error && filteredAssets.length === 0 && (
                <div
                  style={{
                    padding: '48px 24px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ marginBottom: '16px', color: flowCoreColours.slateCyan }}>
                    <Archive size={48} strokeWidth={1.4} />
                  </div>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: flowCoreColours.textPrimary,
                      marginBottom: '8px',
                      textTransform: 'lowercase',
                    }}
                  >
                    no assets available
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      color: flowCoreColours.textSecondary,
                      maxWidth: '400px',
                      margin: '0 auto',
                      lineHeight: 1.6,
                    }}
                  >
                    {publicOnly
                      ? 'no public assets found — make assets public to attach them'
                      : 'upload some assets first'}
                  </div>
                </div>
              )}

              {!loading && !error && filteredAssets.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '12px',
                  }}
                >
                  {filteredAssets.map((asset) => {
                    const isSelected = localSelectedIds.has(asset.id)
                    return (
                      <motion.div
                        key={asset.id}
                        onClick={() => toggleSelection(asset.id, asset.is_public)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          padding: '12px',
                          backgroundColor: isSelected
                            ? 'rgba(58, 169, 190, 0.1)'
                            : flowCoreColours.darkGrey,
                          border: `2px solid ${
                            isSelected ? flowCoreColours.slateCyan : flowCoreColours.borderGrey
                          }`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all var(--flowcore-motion-normal) ease',
                        }}
                      >
                        {/* Checkbox */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            marginBottom: '8px',
                          }}
                        >
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
                              }}
                            >
                              {asset.title}
                            </div>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '11px',
                            color: flowCoreColours.textTertiary,
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {(() => {
                              const Icon = getKindIcon(asset.kind)
                              return <Icon size={14} strokeWidth={1.5} />
                            })()}
                          </span>
                          <span>{asset.kind}</span>
                          {asset.byte_size && (
                            <>
                              <span>·</span>
                              <span>{formatSize(asset.byte_size)}</span>
                            </>
                          )}
                          {!asset.is_public && (
                            <>
                              <span>·</span>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  color: flowCoreColours.warningOrange,
                                }}
                              >
                                <Lock size={12} strokeWidth={1.5} />
                                private
                              </span>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={handleCancel}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  border: `1px solid ${flowCoreColours.borderGrey}`,
                  borderRadius: '4px',
                  color: flowCoreColours.textSecondary,
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textTransform: 'lowercase',
                  transition: 'all var(--flowcore-motion-normal) ease',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = flowCoreColours.slateCyan
                  e.currentTarget.style.color = flowCoreColours.iceCyan
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = flowCoreColours.borderGrey
                  e.currentTarget.style.color = flowCoreColours.textSecondary
                }}
              >
                cancel
              </button>
              <button
                onClick={handleAttachClick}
                disabled={localSelectedIds.size === 0}
                style={{
                  padding: '10px 20px',
                  backgroundColor:
                    localSelectedIds.size === 0
                      ? flowCoreColours.borderGrey
                      : flowCoreColours.slateCyan,
                  border: 'none',
                  borderRadius: '4px',
                  color:
                    localSelectedIds.size === 0
                      ? flowCoreColours.textTertiary
                      : flowCoreColours.matteBlack,
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: localSelectedIds.size === 0 ? 'not-allowed' : 'pointer',
                  textTransform: 'lowercase',
                  transition: 'all var(--flowcore-motion-normal) ease',
                  fontFamily: 'inherit',
                  opacity: localSelectedIds.size === 0 ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (localSelectedIds.size > 0) {
                    e.currentTarget.style.backgroundColor = flowCoreColours.iceCyan
                  }
                }}
                onMouseLeave={(e) => {
                  if (localSelectedIds.size > 0) {
                    e.currentTarget.style.backgroundColor = flowCoreColours.slateCyan
                  }
                }}
              >
                attach {localSelectedIds.size > 0 && `(${localSelectedIds.size})`}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
