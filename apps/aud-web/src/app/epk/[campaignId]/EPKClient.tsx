/**
 * EPK Client Component
 * Phase 15.2-D: Full Agent UI Integration
 *
 * Purpose:
 * - Client-side EPK rendering
 * - Sections: Hero, Featured Track, Gallery, Press Materials, Contact
 * - Asset telemetry tracking
 */

'use client'

import { useState, useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { logger } from '@/lib/logger'
import { AssetViewModal } from '@/components/console/AssetViewModal'
import type { AssetAttachment } from '@/types/asset-attachment'
import { useFlowStateTelemetry } from '@/hooks/useFlowStateTelemetry'
import { FileText, Music2 } from 'lucide-react'

const log = logger.scope('EPKClient')

interface EPKClientProps {
  campaignData: {
    id: string
    name: string
    artistName: string
    tagline?: string | null
    description?: string | null
    releaseDate?: string | null
    genre?: string | null
    contact: {
      email?: string | null
      website?: string | null
    }
    featuredTrack?: AssetAttachment | null
    gallery: AssetAttachment[]
    pressMaterials: AssetAttachment[]
  }
}

export function EPKClient({ campaignData }: EPKClientProps) {
  const prefersReducedMotion = useReducedMotion()
  const { trackEvent } = useFlowStateTelemetry()

  const [selectedAsset, setSelectedAsset] = useState<AssetAttachment | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)

  /**
   * Handle asset click (gallery or press materials)
   */
  const handleAssetClick = useCallback(
    (asset: AssetAttachment) => {
      log.info('Asset clicked from EPK', { assetId: asset.id, kind: asset.kind })

      // Track telemetry
      trackEvent('save', {
        metadata: {
          action: 'asset_epk_view',
          assetId: asset.id,
          assetTitle: asset.title,
          campaignId: campaignData.id,
        },
      })

      setSelectedAsset(asset)
      setViewModalOpen(true)
    },
    [campaignData.id, trackEvent]
  )

  /**
   * Handle asset download
   */
  const handleDownload = useCallback(
    (asset: AssetAttachment) => {
      log.info('Asset downloaded from EPK', { assetId: asset.id })

      // Track telemetry
      trackEvent('save', {
        metadata: {
          action: 'asset_epk_download',
          assetId: asset.id,
          assetTitle: asset.title,
          campaignId: campaignData.id,
        },
      })

      // Open in new tab (browser will handle download)
      window.open(asset.url, '_blank')
    },
    [campaignData.id, trackEvent]
  )

  /**
   * Format file size
   */
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <>
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: flowCoreColours.matteBlack,
          color: flowCoreColours.textPrimary,
          fontFamily:
            'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
        }}
      >
        {/* Hero Section */}
        <section
          style={{
            padding: '80px 24px',
            maxWidth: '1200px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <h1
              style={{
                fontSize: '48px',
                fontWeight: 700,
                color: flowCoreColours.iceCyan,
                marginBottom: '16px',
                letterSpacing: '-0.02em',
              }}
            >
              {campaignData.name}
            </h1>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 500,
                color: flowCoreColours.textSecondary,
                marginBottom: '12px',
              }}
            >
              {campaignData.artistName}
            </div>
            {campaignData.tagline && (
              <div
                style={{
                  fontSize: '16px',
                  color: flowCoreColours.textTertiary,
                  marginBottom: '32px',
                  fontStyle: 'italic',
                }}
              >
                {campaignData.tagline}
              </div>
            )}
            {(campaignData.genre || campaignData.releaseDate) && (
              <div
                style={{
                  display: 'inline-flex',
                  gap: '16px',
                  fontSize: '14px',
                  color: flowCoreColours.textSecondary,
                }}
              >
                {campaignData.genre && <span>{campaignData.genre}</span>}
                {campaignData.genre && campaignData.releaseDate && <span>•</span>}
                {campaignData.releaseDate && (
                  <span>
                    {new Date(campaignData.releaseDate).toLocaleDateString('en-GB')}
                  </span>
                )}
              </div>
            )}
          </motion.div>
        </section>

        {/* Featured Track Section */}
        {campaignData.featuredTrack && (
          <section
            style={{
              padding: '40px 24px',
              maxWidth: '800px',
              margin: '0 auto',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.4,
                delay: prefersReducedMotion ? 0 : 0.1,
              }}
            >
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: flowCoreColours.slateCyan,
                  marginBottom: '24px',
                  textTransform: 'lowercase',
                  letterSpacing: '0.05em',
                }}
              >
                featured track
              </h2>
              <div
                style={{
                  backgroundColor: flowCoreColours.darkGrey,
                  border: `1px solid ${flowCoreColours.borderGrey}`,
                  borderRadius: '12px',
                  padding: '32px',
                }}
              >
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: flowCoreColours.textPrimary,
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Music2 size={20} strokeWidth={1.6} />
                  {campaignData.featuredTrack.title}
                </div>
                <audio
                  controls
                  style={{
                    width: '100%',
                    backgroundColor: flowCoreColours.matteBlack,
                    borderRadius: '8px',
                  }}
                  src={campaignData.featuredTrack.url}
                >
                  Your browser does not support audio playback.
                </audio>
              </div>
            </motion.div>
          </section>
        )}

        {/* About Section */}
        <section
          style={{
            padding: '40px 24px',
            maxWidth: '800px',
            margin: '0 auto',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.4,
              delay: prefersReducedMotion ? 0 : 0.2,
            }}
          >
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 600,
                color: flowCoreColours.slateCyan,
                marginBottom: '24px',
                textTransform: 'lowercase',
                letterSpacing: '0.05em',
              }}
            >
              about
            </h2>
            <div
              style={{
                fontSize: '16px',
                lineHeight: 1.7,
                color: flowCoreColours.textSecondary,
              }}
            >
              {campaignData.description ?? 'press notes coming soon.'}
            </div>
          </motion.div>
        </section>

        {/* Gallery Section */}
        {campaignData.gallery.length > 0 && (
          <section
            style={{
              padding: '40px 24px',
              maxWidth: '1200px',
              margin: '0 auto',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.4,
                delay: prefersReducedMotion ? 0 : 0.3,
              }}
            >
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: flowCoreColours.slateCyan,
                  marginBottom: '24px',
                  textTransform: 'lowercase',
                  letterSpacing: '0.05em',
                }}
              >
                press photos
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '16px',
                }}
              >
                {campaignData.gallery.map((image, index) => (
                  <motion.button
                    key={image.id}
                    onClick={() => handleAssetClick(image)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 0.24,
                      delay: prefersReducedMotion ? 0 : index * 0.05,
                    }}
                    style={{
                      position: 'relative',
                      aspectRatio: '16 / 9',
                      overflow: 'hidden',
                      borderRadius: '8px',
                      border: `1px solid ${flowCoreColours.borderGrey}`,
                      cursor: 'pointer',
                      background: 'transparent',
                      padding: 0,
                    }}
                  >
                    <img
                      src={image.url}
                      alt={image.title || 'press asset'}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '12px',
                        background: 'linear-gradient(to top, rgba(15, 17, 19, 0.9), transparent)',
                        color: flowCoreColours.textPrimary,
                        fontSize: '13px',
                        fontWeight: 500,
                      }}
                    >
                      {image.title || 'press asset'}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* Press Materials Section */}
        {campaignData.pressMaterials.length > 0 && (
          <section
            style={{
              padding: '40px 24px',
              maxWidth: '800px',
              margin: '0 auto',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.4,
                delay: prefersReducedMotion ? 0 : 0.4,
              }}
            >
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: flowCoreColours.slateCyan,
                  marginBottom: '24px',
                  textTransform: 'lowercase',
                  letterSpacing: '0.05em',
                }}
              >
                press materials
              </h2>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {campaignData.pressMaterials.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 0.24,
                      delay: prefersReducedMotion ? 0 : index * 0.05,
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      backgroundColor: flowCoreColours.darkGrey,
                      border: `1px solid ${flowCoreColours.borderGrey}`,
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: flowCoreColours.textPrimary,
                          marginBottom: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <FileText size={16} strokeWidth={1.4} />
                        {doc.title || 'press document'}
                      </div>
                      {doc.byte_size && (
                        <div
                          style={{
                            fontSize: '12px',
                            color: flowCoreColours.textTertiary,
                          }}
                        >
                          {formatSize(doc.byte_size)}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDownload(doc)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: flowCoreColours.slateCyan,
                        color: flowCoreColours.matteBlack,
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
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
                      download
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* Contact Section */}
        {(campaignData.contact?.email || campaignData.contact?.website) && (
          <section
            style={{
              padding: '60px 24px 80px',
              maxWidth: '800px',
              margin: '0 auto',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.4,
                delay: prefersReducedMotion ? 0 : 0.5,
              }}
              style={{
                textAlign: 'center',
              }}
            >
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: flowCoreColours.slateCyan,
                  marginBottom: '24px',
                  textTransform: 'lowercase',
                  letterSpacing: '0.05em',
                }}
              >
                contact
              </h2>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  fontSize: '14px',
                  color: flowCoreColours.textSecondary,
                }}
              >
                {campaignData.contact?.email && (
                  <a
                    href={`mailto:${campaignData.contact.email}`}
                    style={{
                      color: flowCoreColours.iceCyan,
                      textDecoration: 'none',
                      transition: 'color var(--flowcore-motion-fast) ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = flowCoreColours.slateCyan
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = flowCoreColours.iceCyan
                    }}
                  >
                    {campaignData.contact.email}
                  </a>
                )}
                {campaignData.contact?.website && (
                  <a
                    href={campaignData.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: flowCoreColours.iceCyan,
                      textDecoration: 'none',
                      transition: 'color var(--flowcore-motion-fast) ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = flowCoreColours.slateCyan
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = flowCoreColours.iceCyan
                    }}
                  >
                    {campaignData.contact.website}
                  </a>
                )}
              </div>
            </motion.div>
          </section>
        )}

        {/* Footer */}
        <footer
          style={{
            borderTop: `1px solid ${flowCoreColours.borderGrey}`,
            padding: '24px',
            textAlign: 'center',
            fontSize: '12px',
            color: flowCoreColours.textTertiary,
          }}
        >
          powered by totalaud.io
        </footer>
      </div>

      {/* Asset View Modal */}
      {selectedAsset && (
        <AssetViewModal
          assetId={selectedAsset.id}
          open={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false)
            setSelectedAsset(null)
          }}
          gallery={campaignData.gallery}
        />
      )}
    </>
  )
}
