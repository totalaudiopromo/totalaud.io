/**
 * AssetViewModal Component
 * Phase 15.2-D: Full Agent UI Integration
 *
 * Purpose:
 * - Read-only asset preview modal
 * - Audio player for audio assets
 * - Image preview for images
 * - Document metadata for documents
 * - Copy link functionality
 * - Keyboard navigation (Esc, ←/→ for gallery)
 *
 * Usage:
 * <AssetViewModal
 *   assetId="asset-123"
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   gallery={[asset1, asset2, asset3]} // Optional gallery mode
 * />
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { logger } from '@/lib/logger'
import type { AssetAttachment } from '@/types/asset-attachment'
import { toast } from 'sonner'
import { getAssetKindIcon } from '@/components/assets/assetKindIcons'
import { Clipboard, FileText, Lock, X } from 'lucide-react'

const log = logger.scope('AssetViewModal')

export interface AssetViewModalProps {
  assetId: string
  open: boolean
  onClose: () => void
  gallery?: AssetAttachment[] // Optional gallery mode with navigation
}

export function AssetViewModal({ assetId, open, onClose, gallery }: AssetViewModalProps) {
  const prefersReducedMotion = useReducedMotion()
  const audioRef = useRef<HTMLAudioElement>(null)

  const [asset, setAsset] = useState<AssetAttachment | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  /**
   * Fetch asset details
   */
  useEffect(() => {
    if (!open) return

    const fetchAsset = async () => {
      setLoading(true)
      try {
        // If gallery mode, find asset in gallery
        if (gallery && gallery.length > 0) {
          const galleryAsset = gallery.find((a) => a.id === assetId)
          if (galleryAsset) {
            setAsset(galleryAsset)
            setCurrentIndex(gallery.findIndex((a) => a.id === assetId))
            setLoading(false)
            return
          }
        }

        // Otherwise fetch from API
        const response = await fetch(`/api/assets/get?id=${assetId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch asset')
        }

        const data = await response.json()
        setAsset(data.asset)
        log.info('Asset fetched for view', { assetId })
      } catch (error) {
        log.error('Failed to fetch asset', { error })
        toast.error('failed to load asset')
        setAsset(null)
      } finally {
        setLoading(false)
      }
    }

    fetchAsset()
  }, [assetId, open, gallery])

  /**
   * Keyboard navigation
   */
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }

      // Gallery navigation
      if (gallery && gallery.length > 1) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          navigatePrevious()
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          navigateNext()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, gallery, currentIndex, onClose])

  /**
   * Navigate to previous asset in gallery
   */
  const navigatePrevious = useCallback(() => {
    if (!gallery || gallery.length <= 1) return

    const newIndex = currentIndex > 0 ? currentIndex - 1 : gallery.length - 1
    setCurrentIndex(newIndex)
    setAsset(gallery[newIndex])
    log.debug('Navigate previous', { newIndex })
  }, [gallery, currentIndex])

  /**
   * Navigate to next asset in gallery
   */
  const navigateNext = useCallback(() => {
    if (!gallery || gallery.length <= 1) return

    const newIndex = currentIndex < gallery.length - 1 ? currentIndex + 1 : 0
    setCurrentIndex(newIndex)
    setAsset(gallery[newIndex])
    log.debug('Navigate next', { newIndex })
  }, [gallery, currentIndex])

  /**
   * Copy asset link to clipboard
   */
  const handleCopyLink = useCallback(() => {
    if (!asset) return

    navigator.clipboard.writeText(asset.url)
    toast.success('asset link copied')
    log.info('Asset link copied', { assetId: asset.id })
  }, [asset])

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
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  /**
   * Get kind icon
   */
  const getKindIcon = (kind: string) => getAssetKindIcon(kind)

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.24 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 17, 19, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '24px',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.24,
              ease: [0.22, 1, 0.36, 1],
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: flowCoreColours.darkGrey,
              border: `1px solid ${flowCoreColours.borderGrey}`,
              borderRadius: '12px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              fontFamily:
                'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '24px',
                borderBottom: `1px solid ${flowCoreColours.borderGrey}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ flex: 1 }}>
                {loading ? (
                  <div
                    style={{
                      fontSize: '14px',
                      color: flowCoreColours.textSecondary,
                      textTransform: 'lowercase',
                    }}
                  >
                    loading asset...
                  </div>
                ) : asset ? (
                  <>
                    <div
                      style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: flowCoreColours.iceCyan,
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      {(() => {
                        const Icon = getKindIcon(asset.kind)
                        return (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              color: flowCoreColours.slateCyan,
                            }}
                          >
                            <Icon size={18} strokeWidth={1.5} />
                          </span>
                        )
                      })()}
                      <span>{asset.title}</span>
                      {!asset.is_public && (
                        <span
                          style={{
                            fontSize: '12px',
                            padding: '2px 6px',
                            backgroundColor: 'rgba(255, 165, 0, 0.1)',
                            color: flowCoreColours.warningOrange,
                            borderRadius: '4px',
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
                    <div
                      style={{
                        fontSize: '12px',
                        color: flowCoreColours.textTertiary,
                      }}
                    >
                      {asset.mime_type}
                      {asset.byte_size && ` • ${formatSize(asset.byte_size)}`}
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      fontSize: '14px',
                      color: flowCoreColours.warningOrange,
                      textTransform: 'lowercase',
                    }}
                  >
                    asset not found
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                aria-label="Close modal"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: flowCoreColours.textSecondary,
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '4px',
                  transition: 'color var(--flowcore-motion-fast) ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = flowCoreColours.iceCyan
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = flowCoreColours.textSecondary
                }}
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px' }}>
              {loading ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '48px',
                    color: flowCoreColours.textSecondary,
                    fontSize: '13px',
                  }}
                >
                  loading...
                </div>
              ) : !asset ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '48px',
                    color: flowCoreColours.warningOrange,
                    fontSize: '13px',
                  }}
                >
                  asset not found or unavailable
                </div>
              ) : (
                <>
                  {/* Audio Player */}
                  {asset.kind === 'audio' && (
                    <div style={{ marginBottom: '24px' }}>
                      <audio
                        ref={audioRef}
                        controls
                        style={{
                          width: '100%',
                          backgroundColor: flowCoreColours.matteBlack,
                          borderRadius: '8px',
                        }}
                        src={asset.url}
                      >
                        Your browser does not support audio playback.
                      </audio>
                    </div>
                  )}

                  {/* Image Preview */}
                  {asset.kind === 'image' && (
                    <div
                      style={{
                        marginBottom: '24px',
                        textAlign: 'center',
                      }}
                    >
                      <img
                        src={asset.url}
                        alt={asset.title}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '400px',
                          borderRadius: '8px',
                          border: `1px solid ${flowCoreColours.borderGrey}`,
                        }}
                      />
                    </div>
                  )}

                  {/* Document Preview */}
                  {asset.kind === 'document' && (
                    <div
                      style={{
                        marginBottom: '24px',
                        padding: '24px',
                        backgroundColor: flowCoreColours.matteBlack,
                        border: `1px solid ${flowCoreColours.borderGrey}`,
                        borderRadius: '8px',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ marginBottom: '12px', color: flowCoreColours.slateCyan }}>
                        <FileText size={44} strokeWidth={1.4} />
                      </div>
                      <div
                        style={{
                          fontSize: '13px',
                          color: flowCoreColours.textSecondary,
                          marginBottom: '16px',
                        }}
                      >
                        document preview not available
                      </div>
                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-block',
                          padding: '8px 16px',
                          backgroundColor: flowCoreColours.slateCyan,
                          color: flowCoreColours.matteBlack,
                          borderRadius: '4px',
                          fontSize: '13px',
                          fontWeight: 600,
                          textDecoration: 'none',
                          textTransform: 'lowercase',
                          transition: 'background-color var(--flowcore-motion-fast) ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = flowCoreColours.iceCyan
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = flowCoreColours.slateCyan
                        }}
                      >
                        download / view
                      </a>
                    </div>
                  )}

                  {/* Metadata */}
                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: flowCoreColours.matteBlack,
                      border: `1px solid ${flowCoreColours.borderGrey}`,
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '120px 1fr',
                        gap: '12px',
                      }}
                    >
                      <div style={{ color: flowCoreColours.textTertiary }}>asset id:</div>
                      <div
                        style={{ color: flowCoreColours.textSecondary, fontFamily: 'monospace' }}
                      >
                        {asset.id}
                      </div>

                      <div style={{ color: flowCoreColours.textTertiary }}>kind:</div>
                      <div style={{ color: flowCoreColours.textSecondary }}>{asset.kind}</div>

                      {asset.byte_size && (
                        <>
                          <div style={{ color: flowCoreColours.textTertiary }}>size:</div>
                          <div style={{ color: flowCoreColours.textSecondary }}>
                            {formatSize(asset.byte_size)}
                          </div>
                        </>
                      )}

                      {asset.mime_type && (
                        <>
                          <div style={{ color: flowCoreColours.textTertiary }}>mime type:</div>
                          <div style={{ color: flowCoreColours.textSecondary }}>
                            {asset.mime_type}
                          </div>
                        </>
                      )}

                      {asset.created_at && (
                        <>
                          <div style={{ color: flowCoreColours.textTertiary }}>uploaded:</div>
                          <div style={{ color: flowCoreColours.textSecondary }}>
                            {formatDate(asset.created_at)}
                          </div>
                        </>
                      )}

                      <div style={{ color: flowCoreColours.textTertiary }}>visibility:</div>
                      <div style={{ color: flowCoreColours.textSecondary }}>
                        {asset.is_public ? 'public' : 'private'}
                      </div>
                    </div>
                  </div>

                  {/* Copy Link Button */}
                  <button
                    onClick={handleCopyLink}
                    aria-label="Copy asset link"
                    style={{
                      width: '100%',
                      marginTop: '16px',
                      padding: '12px',
                      backgroundColor: 'transparent',
                      border: `1px solid ${flowCoreColours.borderGrey}`,
                      borderRadius: '4px',
                      color: flowCoreColours.textSecondary,
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      textTransform: 'lowercase',
                      transition: 'all var(--flowcore-motion-fast) ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = flowCoreColours.slateCyan
                      e.currentTarget.style.color = flowCoreColours.slateCyan
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = flowCoreColours.borderGrey
                      e.currentTarget.style.color = flowCoreColours.textSecondary
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        justifyContent: 'center',
                      }}
                    >
                      <Clipboard size={16} strokeWidth={1.6} />
                      copy asset link
                    </span>
                  </button>
                </>
              )}
            </div>

            {/* Gallery Navigation */}
            {gallery && gallery.length > 1 && asset && (
              <div
                style={{
                  padding: '16px 24px',
                  borderTop: `1px solid ${flowCoreColours.borderGrey}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <button
                  onClick={navigatePrevious}
                  aria-label="Previous asset"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    border: `1px solid ${flowCoreColours.borderGrey}`,
                    borderRadius: '4px',
                    color: flowCoreColours.textSecondary,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all var(--flowcore-motion-fast) ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = flowCoreColours.slateCyan
                    e.currentTarget.style.color = flowCoreColours.slateCyan
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = flowCoreColours.borderGrey
                    e.currentTarget.style.color = flowCoreColours.textSecondary
                  }}
                >
                  ← previous
                </button>

                <div
                  style={{
                    fontSize: '12px',
                    color: flowCoreColours.textTertiary,
                  }}
                >
                  {currentIndex + 1} / {gallery.length}
                </div>

                <button
                  onClick={navigateNext}
                  aria-label="Next asset"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    border: `1px solid ${flowCoreColours.borderGrey}`,
                    borderRadius: '4px',
                    color: flowCoreColours.textSecondary,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all var(--flowcore-motion-fast) ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = flowCoreColours.slateCyan
                    e.currentTarget.style.color = flowCoreColours.slateCyan
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = flowCoreColours.borderGrey
                    e.currentTarget.style.color = flowCoreColours.textSecondary
                  }}
                >
                  next →
                </button>
              </div>
            )}

            {/* Keyboard Hints */}
            <div
              style={{
                padding: '12px 24px',
                borderTop: `1px solid ${flowCoreColours.borderGrey}`,
                fontSize: '11px',
                color: flowCoreColours.textTertiary,
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <span>
                <kbd
                  style={{
                    padding: '2px 6px',
                    backgroundColor: flowCoreColours.matteBlack,
                    border: `1px solid ${flowCoreColours.borderGrey}`,
                    borderRadius: '3px',
                    fontSize: '10px',
                    fontFamily: 'monospace',
                  }}
                >
                  Esc
                </kbd>{' '}
                close
              </span>
              {gallery && gallery.length > 1 && (
                <>
                  <span>
                    <kbd
                      style={{
                        padding: '2px 6px',
                        backgroundColor: flowCoreColours.matteBlack,
                        border: `1px solid ${flowCoreColours.borderGrey}`,
                        borderRadius: '3px',
                        fontSize: '10px',
                        fontFamily: 'monospace',
                      }}
                    >
                      ←
                    </kbd>{' '}
                    previous
                  </span>
                  <span>
                    <kbd
                      style={{
                        padding: '2px 6px',
                        backgroundColor: flowCoreColours.matteBlack,
                        border: `1px solid ${flowCoreColours.borderGrey}`,
                        borderRadius: '3px',
                        fontSize: '10px',
                        fontFamily: 'monospace',
                      }}
                    >
                      →
                    </kbd>{' '}
                    next
                  </span>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
