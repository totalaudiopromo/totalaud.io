/**
 * AssetGrid Component
 * Phase 15.2-B: Multi-File UX + Agent Integration Layer
 *
 * Purpose:
 * - Responsive grid of asset cards (3 cols ≥ 1024px → 2 cols → 1 col)
 * - Empty state with helpful messaging
 * - Loading and error states
 * - Integrates with useAssets and useAssetFilters hooks
 *
 * Usage:
 * <AssetGrid
 *   assets={assets}
 *   loading={loading}
 *   error={error}
 *   onDelete={handleDelete}
 *   onTogglePublic={handleTogglePublic}
 *   onCopyLink={handleCopyLink}
 * />
 */

'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { AssetCard } from './AssetCard'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import type { Asset } from '@/hooks/useAssets'
import { AlertTriangle, Archive } from 'lucide-react'
import { logger } from '@/lib/logger'

const log = logger.scope('AssetGrid')

export interface AssetGridProps {
  assets: Asset[]
  loading: boolean
  error: string | null
  onDelete: (assetId: string) => void
  onTogglePublic: (assetId: string, isPublic: boolean) => void
  onCopyLink: (publicShareId: string) => void
  onView?: (assetId: string) => void
}

export function AssetGrid({
  assets,
  loading,
  error,
  onDelete,
  onTogglePublic,
  onCopyLink,
  onView,
}: AssetGridProps) {
  const prefersReducedMotion = useReducedMotion()
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set())

  /**
   * Toggle asset selection
   */
  const toggleSelection = useCallback((assetId: string) => {
    setSelectedAssetIds((prev) => {
      const next = new Set(prev)
      if (next.has(assetId)) {
        next.delete(assetId)
      } else {
        next.add(assetId)
      }
      return next
    })
  }, [])

  /**
   * Handle delete with logging
   */
  const handleDelete = useCallback(
    (assetId: string) => {
      log.info('Deleting asset from grid', { assetId })
      onDelete(assetId)
    },
    [onDelete]
  )

  /**
   * Handle toggle public
   */
  const handleTogglePublic = useCallback(
    (assetId: string, currentlyPublic: boolean) => {
      log.info('Toggling asset visibility', { assetId, isPublic: !currentlyPublic })
      onTogglePublic(assetId, !currentlyPublic)
    },
    [onTogglePublic]
  )

  /**
   * Handle copy link
   */
  const handleCopyLink = useCallback(
    (publicShareId: string) => {
      log.debug('Copying asset link', { publicShareId })
      onCopyLink(publicShareId)
    },
    [onCopyLink]
  )

  /**
   * Handle view asset
   */
  const handleView = useCallback(
    (assetId: string) => {
      log.debug('Viewing asset', { assetId })
      if (onView) onView(assetId)
    },
    [onView]
  )

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
          padding: '16px',
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              backgroundColor: flowCoreColours.darkGrey,
              border: `1px solid ${flowCoreColours.borderGrey}`,
              borderRadius: '8px',
              height: '300px',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div
        style={{
          padding: '48px 24px',
          textAlign: 'center',
          fontFamily:
            'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
        }}
      >
        <div
          style={{
            marginBottom: '16px',
            color: flowCoreColours.warningOrange,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <AlertTriangle size={48} strokeWidth={1.4} />
        </div>
        <div
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: flowCoreColours.textPrimary,
            marginBottom: '8px',
          }}
        >
          failed to load assets
        </div>
        <div
          style={{
            fontSize: '14px',
            color: flowCoreColours.textSecondary,
          }}
        >
          {error}
        </div>
      </div>
    )
  }

  // Empty state
  if (assets.length === 0) {
    return (
      <div
        style={{
          padding: '48px 24px',
          textAlign: 'center',
          fontFamily:
            'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
        }}
      >
        <div
          style={{
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'center',
            color: flowCoreColours.slateCyan,
          }}
        >
          <Archive size={56} strokeWidth={1.4} />
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
          no assets yet
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
          drop something to start your press kit
        </div>
      </div>
    )
  }

  // Grid with assets
  return (
    <div
      style={{
        padding: '16px',
      }}
    >
      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        <AnimatePresence>
          {assets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onDelete={() => handleDelete(asset.id)}
              onTogglePublic={() => handleTogglePublic(asset.id, asset.is_public)}
              onCopyLink={() => handleCopyLink(asset.public_share_id)}
              onView={() => handleView(asset.id)}
              selected={selectedAssetIds.has(asset.id)}
              onSelect={() => toggleSelection(asset.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Selection summary */}
      {selectedAssetIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.24 }}
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 24px',
            backgroundColor: flowCoreColours.matteBlack,
            border: `2px solid ${flowCoreColours.slateCyan}`,
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 500,
            color: flowCoreColours.textPrimary,
            fontFamily:
              'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: 50,
          }}
        >
          {selectedAssetIds.size} asset{selectedAssetIds.size === 1 ? '' : 's'} selected
          <button
            onClick={() => setSelectedAssetIds(new Set())}
            style={{
              marginLeft: '16px',
              padding: '4px 12px',
              backgroundColor: 'transparent',
              border: `1px solid ${flowCoreColours.borderGrey}`,
              borderRadius: '4px',
              color: flowCoreColours.textSecondary,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            clear
          </button>
        </motion.div>
      )}
    </div>
  )
}
