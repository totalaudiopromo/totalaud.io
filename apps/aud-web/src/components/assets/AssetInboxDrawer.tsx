/**
 * Asset Inbox Drawer
 * Phase 15.3: Connected Console & Orchestration
 *
 * Purpose:
 * - Right drawer (max 480px) for quick asset access
 * - Searchable + filterable by kind and visibility
 * - One-click attach to currently selected node
 * - Keyboard shortcut ⌘U to toggle
 */

'use client'

import { useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { logger } from '@/lib/logger'
import type { AssetAttachment } from '@/types/asset-attachment'
import { useAssets } from '@/hooks/useAssets'
import type { Asset } from '@/hooks/useAssets'
import { useAssetFilters } from '@/hooks/useAssetFilters'
import { useFlowStateTelemetry } from '@/hooks/useFlowStateTelemetry'
import { toast } from 'sonner'
import { playAssetAttachSound } from '@/lib/asset-sounds'
import { Archive } from 'lucide-react'
import type { NodeKind } from '@/types/console'

const log = logger.scope('AssetInboxDrawer')

export interface AssetInboxDrawerProps {
  open: boolean
  onClose: () => void
  onAttach?: (asset: AssetAttachment) => void
  currentNodeKind?: NodeKind | null
  campaignId?: string
}
import { AssetListItem } from './AssetListItem'
import { AssetInboxHeader } from './AssetInboxHeader'

export function AssetInboxDrawer({
  open,
  onClose,
  onAttach,
  currentNodeKind,
  campaignId,
}: AssetInboxDrawerProps) {
  const prefersReducedMotion = useReducedMotion()
  const { trackEvent } = useFlowStateTelemetry()
  const attachableNodeKind: Exclude<NodeKind, 'intel'> | null =
    currentNodeKind && currentNodeKind !== 'intel' ? currentNodeKind : null

  const { assets: allAssets, loading } = useAssets(campaignId ? { campaignId } : {})
  const {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    selectedKind,
    setSelectedKind,
    clearFilters,
  } = useAssetFilters()

  /**
   * Filter and search assets
   */
  const filteredAssets = useMemo(() => {
    let filtered = allAssets

    // Apply kind filter
    if (selectedKind) {
      filtered = filtered.filter((asset) => asset.kind === selectedKind)
    }

    // Apply search
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase()
      filtered = filtered.filter(
        (asset) =>
          asset.title.toLowerCase().includes(query) ||
          asset.kind.toLowerCase().includes(query) ||
          asset.mime_type?.toLowerCase().includes(query)
      )
    }

    // Sort by creation date (newest first)
    return [...filtered].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA
    })
  }, [allAssets, debouncedSearchQuery, selectedKind])

  const sortedAssets = filteredAssets

  /**
   * Count new uploads in last 24 hours
   */
  const newUploadsCount = useMemo(() => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    return allAssets.filter((asset) => {
      if (!asset.created_at) return false
      return new Date(asset.created_at).getTime() > oneDayAgo
    }).length
  }, [allAssets])

  const toAssetAttachment = useCallback((asset: Asset): AssetAttachment | null => {
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
   * Handle asset quick attach
   */
  const handleQuickAttach = useCallback(
    (asset: Asset) => {
      const attachment = toAssetAttachment(asset)

      if (!attachment) {
        toast.error('asset unavailable', {
          description: 'upload is missing a shareable URL',
        })
        return
      }

      if (!attachableNodeKind) {
        toast.error('select a node to attach assets', {
          description: 'open pitch or tracker agent first',
        })
        return
      }

      // Check privacy
      if (!attachment.is_public && attachableNodeKind === 'pitch') {
        toast.warning('private asset filtered', {
          description: 'only public assets can be used in pitch',
        })
        return
      }

      log.info('Quick attach asset', {
        assetId: attachment.id,
        assetTitle: attachment.title,
        nodeKind: attachableNodeKind,
      })

      // Track telemetry
      trackEvent('save', {
        metadata: {
          action: 'asset_quick_attach',
          assetId: attachment.id,
          assetKind: attachment.kind,
          nodeKind: attachableNodeKind,
        },
      })

      // Play sound
      playAssetAttachSound()

      // Call callback
      if (onAttach) {
        onAttach(attachment)
      }

      // Show success toast
      toast.success('asset attached', {
        description: attachableNodeKind
          ? `${attachment.title} → ${attachableNodeKind} agent`
          : attachment.title,
      })
    },
    [attachableNodeKind, onAttach, toAssetAttachment, trackEvent]
  )

  /**
   * Keyboard shortcut ⌘U to toggle drawer
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // ⌘U or Ctrl+U
      if ((event.metaKey || event.ctrlKey) && event.key === 'u') {
        // Ignore inside inputs
        const target = event.target as HTMLElement
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return
        }

        event.preventDefault()
        if (open) {
          onClose()
        } else {
          // Would need parent to handle opening
          log.debug('⌘U pressed - drawer currently closed')
        }
      }

      // Escape to close
      if (open && event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  /**
   * Format file size
   */
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  /**
   * Format relative time
   */
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString)
    const now = Date.now()
    const diff = now - date.getTime()

    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`

    const days = Math.floor(hours / 24)
    if (days === 1) return 'yesterday'
    if (days < 7) return `${days}d ago`

    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.24 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 17, 19, 0.8)',
              zIndex: 9998,
            }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.24,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '480px',
              backgroundColor: flowCoreColours.darkGrey,
              borderLeft: `1px solid ${flowCoreColours.borderGrey}`,
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              fontFamily:
                'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
            }}
          >
            {/* Header */}
            <AssetInboxHeader
              newUploadsCount={newUploadsCount}
              onClose={onClose}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedKind={selectedKind}
              setSelectedKind={setSelectedKind}
              clearFilters={clearFilters}
              attachableNodeKind={attachableNodeKind}
            />

            {/* Assets List */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px 24px',
              }}
            >
              {loading && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '32px',
                    color: flowCoreColours.textSecondary,
                    fontSize: '13px',
                  }}
                >
                  loading assets...
                </div>
              )}

              {!loading && sortedAssets.length === 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '32px',
                  }}
                >
                  <div style={{ marginBottom: '12px', color: flowCoreColours.slateCyan }}>
                    <Archive size={48} strokeWidth={1.4} />
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: flowCoreColours.textSecondary,
                      marginBottom: '4px',
                    }}
                  >
                    {searchQuery || selectedKind ? 'no assets found' : 'no assets uploaded yet'}
                  </div>
                  {(searchQuery || selectedKind) && (
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        clearFilters()
                      }}
                      style={{
                        marginTop: '12px',
                        padding: '8px 16px',
                        backgroundColor: 'transparent',
                        border: `1px solid ${flowCoreColours.borderGrey}`,
                        borderRadius: '4px',
                        color: flowCoreColours.textSecondary,
                        fontSize: '12px',
                        cursor: 'pointer',
                        textTransform: 'lowercase',
                      }}
                    >
                      clear filters
                    </button>
                  )}
                </div>
              )}

              {!loading && sortedAssets.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {sortedAssets.map((asset, index) => (
                    <AssetListItem
                      key={asset.id}
                      asset={asset}
                      index={index}
                      prefersReducedMotion={prefersReducedMotion ?? false}
                      attachableNodeKind={attachableNodeKind}
                      onAttach={handleQuickAttach}
                      formatSize={formatSize}
                      formatRelativeTime={formatRelativeTime}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: `1px solid ${flowCoreColours.borderGrey}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: flowCoreColours.textTertiary,
              }}
            >
              <span>
                {sortedAssets.length} asset{sortedAssets.length === 1 ? '' : 's'}
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
                  ⌘U
                </kbd>{' '}
                to close
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
