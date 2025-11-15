/**
 * Assets Page - Full Implementation
 * Phase 15.2-B: Multi-File UX + Agent Integration Layer
 *
 * Purpose:
 * - Complete asset management UI
 * - Integrates AssetGrid, AssetSidebar, AssetDropZone
 * - Keyboard shortcuts (⌘U, ⌘F, Del, Enter)
 * - Telemetry tracking for all interactions
 *
 * Access: /dev/assets-full
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAssets } from '@/hooks/useAssets'
import { useAssetFilters } from '@/hooks/useAssetFilters'
import { useFlowStateTelemetry } from '@/hooks/useFlowStateTelemetry'
import { X } from 'lucide-react'
import { AssetGrid } from '@/components/console/AssetGrid'
import { AssetSidebar } from '@/components/console/AssetSidebar'
import { AssetDropZone } from '@/components/console/AssetDropZone'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { logger } from '@/lib/logger'

const log = logger.scope('AssetsPage')

export default function AssetsFullPage() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  // Filters
  const {
    searchQuery,
    debouncedSearchQuery,
    selectedKind,
    selectedTag,
    selectedCampaign,
    setSearchQuery,
    setSelectedKind,
    setSelectedTag,
    setSelectedCampaign,
    clearFilters,
    hasActiveFilters,
  } = useAssetFilters()

  // Assets
  const { assets, loading, error, refresh, remove, togglePublic, count } = useAssets({
    kind: selectedKind || undefined,
    q: debouncedSearchQuery || undefined,
    tag: selectedTag || undefined,
    campaignId: selectedCampaign || undefined,
  })

  // Telemetry
  const { trackEvent } = useFlowStateTelemetry()

  /**
   * Handle delete asset
   */
  const handleDelete = useCallback(
    async (assetId: string) => {
      const success = await remove(assetId)
      if (success) {
        log.info('Asset deleted', { assetId })
      }
    },
    [remove]
  )

  /**
   * Handle toggle public
   */
  const handleTogglePublic = useCallback(
    async (assetId: string, isPublic: boolean) => {
      const success = await togglePublic(assetId, isPublic)
      if (success) {
        log.info('Asset visibility toggled', { assetId, isPublic })
      }
    },
    [togglePublic]
  )

  /**
   * Handle copy link
   */
  const handleCopyLink = useCallback((publicShareId: string) => {
    log.debug('Link copied', { publicShareId })
  }, [])

  /**
   * Handle view asset
   */
  const handleView = useCallback(
    (assetId: string) => {
      log.info('Viewing asset', { assetId })

      // Track telemetry
      trackEvent('save', {
        metadata: {
          action: 'asset_view',
          assetId,
        },
      })
    },
    [trackEvent]
  )

  /**
   * Keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘U - Upload
      if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
        e.preventDefault()
        setUploadModalOpen(true)
        log.debug('Upload modal opened via keyboard shortcut')
      }

      // Esc - Close modal
      if (e.key === 'Escape' && uploadModalOpen) {
        e.preventDefault()
        setUploadModalOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [uploadModalOpen])

  /**
   * Track filter changes
   */
  useEffect(() => {
    if (hasActiveFilters) {
      trackEvent('save', {
        metadata: {
          action: 'asset_filter_change',
          kind: selectedKind,
          hasSearch: debouncedSearchQuery !== '',
          hasTag: selectedTag !== null,
          hasCampaign: selectedCampaign !== null,
        },
      })
    }
  }, [
    hasActiveFilters,
    selectedKind,
    debouncedSearchQuery,
    selectedTag,
    selectedCampaign,
    trackEvent,
  ])

  /**
   * Refresh on upload complete
   */
  const handleUploadComplete = useCallback(() => {
    refresh()
    setUploadModalOpen(false)
  }, [refresh])

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: flowCoreColours.matteBlack,
        color: flowCoreColours.textPrimary,
        display: 'flex',
        flexDirection: 'column',
        fontFamily:
          'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '24px',
          borderBottom: `1px solid ${flowCoreColours.borderGrey}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
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
            assets
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: flowCoreColours.textSecondary,
              margin: 0,
            }}
          >
            {count} asset{count === 1 ? '' : 's'}
            {hasActiveFilters && ' (filtered)'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Refresh */}
          <button
            onClick={() => refresh()}
            aria-label="Refresh assets"
            style={{
              padding: '10px 16px',
              backgroundColor: 'transparent',
              border: `1px solid ${flowCoreColours.borderGrey}`,
              borderRadius: '4px',
              color: flowCoreColours.textSecondary,
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              textTransform: 'lowercase',
              transition: 'all var(--flowcore-motion-normal) ease',
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
            refresh
          </button>

          {/* Upload */}
          <button
            onClick={() => setUploadModalOpen(true)}
            aria-label="Upload asset (⌘U)"
            style={{
              padding: '10px 20px',
              backgroundColor: flowCoreColours.slateCyan,
              border: 'none',
              borderRadius: '4px',
              color: flowCoreColours.matteBlack,
              fontSize: '13px',
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
            upload <span style={{ opacity: 0.7, marginLeft: '8px' }}>⌘U</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <AssetSidebar
          searchQuery={searchQuery}
          selectedKind={selectedKind}
          selectedTag={selectedTag}
          selectedCampaign={selectedCampaign}
          onSearchChange={setSearchQuery}
          onKindChange={setSelectedKind}
          onTagChange={setSelectedTag}
          onCampaignChange={setSelectedCampaign}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Grid */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <AssetGrid
            assets={assets}
            loading={loading}
            error={error}
            onDelete={handleDelete}
            onTogglePublic={handleTogglePublic}
            onCopyLink={handleCopyLink}
            onView={handleView}
          />
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {uploadModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUploadModalOpen(false)}
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
                overflowY: 'auto',
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '24px',
                }}
              >
                <h2
                  style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    color: flowCoreColours.iceCyan,
                    textTransform: 'lowercase',
                    margin: 0,
                  }}
                >
                  upload assets
                </h2>
                <button
                  onClick={() => setUploadModalOpen(false)}
                  aria-label="Close upload modal"
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
                  <X size={18} strokeWidth={1.6} />
                </button>
              </div>

              {/* Upload Component */}
              <AssetDropZone />

              {/* Footer */}
              <div
                style={{
                  marginTop: '24px',
                  padding: '16px',
                  backgroundColor: 'rgba(58, 169, 190, 0.05)',
                  border: `1px solid ${flowCoreColours.borderGrey}`,
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: flowCoreColours.textTertiary,
                  lineHeight: 1.6,
                }}
              >
                <strong style={{ color: flowCoreColours.textSecondary }}>supported files:</strong>{' '}
                audio (mp3, wav, flac), images (jpg, png, svg), documents (pdf, txt), archives (zip)
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
