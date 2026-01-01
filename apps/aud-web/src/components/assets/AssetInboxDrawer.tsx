/**
 * Asset Inbox Drawer
 * Phase 15.3: Connected Console & Orchestration
 *
 * Purpose:
 * - Right drawer (max 480px) for quick asset access
 * - Searchable + filterable by kind and visibility
 * - One-click attach to currently selected node
 * - Keyboard shortcut Cmd+U to toggle
 */

'use client'

import { useCallback, useEffect, useMemo } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { logger } from '@/lib/logger'
import type { AssetAttachment } from '@/types/asset-attachment'
import { useAssets, type Asset } from '@/hooks/useAssets'
import { useAssetFilters } from '@/hooks/useAssetFilters'
import { useFlowStateTelemetry } from '@/hooks/useFlowStateTelemetry'
import { toast } from 'sonner'
import { playAssetAttachSound } from '@/lib/asset-sounds'
import type { NodeKind } from '@/types/console'
import { AssetInboxFooter } from './assetInbox/AssetInboxFooter'
import { AssetInboxHeader } from './assetInbox/AssetInboxHeader'
import { AssetInboxList } from './assetInbox/AssetInboxList'

const log = logger.scope('AssetInboxDrawer')

export interface AssetInboxDrawerProps {
  open: boolean
  onClose: () => void
  onAttach?: (asset: AssetAttachment) => void
  currentNodeKind?: NodeKind | null
  campaignId?: string
}

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

  const filteredAssets = useMemo(() => {
    let filtered = allAssets

    if (selectedKind) {
      filtered = filtered.filter((asset) => asset.kind === selectedKind)
    }

    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase()
      filtered = filtered.filter(
        (asset) =>
          asset.title.toLowerCase().includes(query) ||
          asset.kind.toLowerCase().includes(query) ||
          asset.mime_type?.toLowerCase().includes(query)
      )
    }

    return filtered.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA
    })
  }, [allAssets, debouncedSearchQuery, selectedKind])

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

      trackEvent('save', {
        metadata: {
          action: 'asset_quick_attach',
          assetId: attachment.id,
          assetKind: attachment.kind,
          nodeKind: attachableNodeKind,
        },
      })

      playAssetAttachSound()

      if (onAttach) {
        onAttach(attachment)
      }

      toast.success('asset attached', {
        description: attachableNodeKind
          ? `${attachment.title} -> ${attachableNodeKind} agent`
          : attachment.title,
      })
    },
    [attachableNodeKind, onAttach, toAssetAttachment, trackEvent]
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'u') {
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
          log.debug('Cmd+U pressed - drawer currently closed')
        }
      }

      if (open && event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
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
            <AssetInboxHeader
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedKind={selectedKind}
              setSelectedKind={setSelectedKind}
              clearFilters={clearFilters}
              newUploadsCount={newUploadsCount}
              attachableNodeKind={attachableNodeKind}
              onClose={onClose}
            />

            <AssetInboxList
              loading={loading}
              filteredAssets={filteredAssets}
              searchQuery={searchQuery}
              selectedKind={selectedKind}
              attachableNodeKind={attachableNodeKind}
              prefersReducedMotion={prefersReducedMotion}
              onClearFilters={clearFilters}
              onSearchClear={() => setSearchQuery('')}
              onAttach={handleQuickAttach}
            />

            <AssetInboxFooter count={filteredAssets.length} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
