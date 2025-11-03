/**
 * AssetCard Component
 * Phase 15.2-B: Multi-File UX + Agent Integration Layer
 *
 * Purpose:
 * - Display individual asset with thumbnail, metadata, and actions
 * - Thumbnail preview (image, audio icon, doc icon)
 * - Actions: delete · copy link · toggle public/private
 * - 240ms motion transitions + FlowCore hover sounds
 * - WCAG AA+ accessible
 *
 * Usage:
 * <AssetCard
 *   asset={asset}
 *   onDelete={() => handleDelete(asset.id)}
 *   onTogglePublic={() => handleTogglePublic(asset.id, !asset.is_public)}
 *   onCopyLink={() => handleCopyLink(asset.public_share_id)}
 * />
 */

'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import type { Asset } from '@/hooks/useAssets'
import { logger } from '@/lib/logger'
import { toast } from 'sonner'

const log = logger.scope('AssetCard')

export interface AssetCardProps {
  asset: Asset
  onDelete: () => void
  onTogglePublic: () => void
  onCopyLink: () => void
  onView?: () => void
  selected?: boolean
  onSelect?: () => void
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Math.round(bytes / Math.pow(k, i))} ${sizes[i]}`
}

/**
 * Format date to relative time
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

/**
 * Get icon for asset kind
 */
function getKindIcon(kind: Asset['kind']): string {
  switch (kind) {
    case 'audio':
      return '🎵'
    case 'image':
      return '🖼️'
    case 'document':
      return '📄'
    case 'archive':
      return '📦'
    case 'link':
      return '🔗'
    default:
      return '📁'
  }
}

export function AssetCard({
  asset,
  onDelete,
  onTogglePublic,
  onCopyLink,
  onView,
  selected = false,
  onSelect,
}: AssetCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const [isHovered, setIsHovered] = useState(false)

  /**
   * Handle copy link
   */
  const handleCopyLink = useCallback(() => {
    const link = `${window.location.origin}/share/${asset.public_share_id}`
    navigator.clipboard.writeText(link)
    toast.success('Link copied to clipboard')
    onCopyLink()

    log.debug('Asset link copied', { assetId: asset.id, link })
  }, [asset.id, asset.public_share_id, onCopyLink])

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && onView) {
        e.preventDefault()
        onView()
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        onDelete()
      } else if (e.key === ' ') {
        e.preventDefault()
        if (onSelect) onSelect()
      }
    },
    [onView, onDelete, onSelect]
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        if (onView) onView()
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${asset.title} - ${asset.kind} asset`}
      aria-selected={selected}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: selected
          ? 'rgba(58, 169, 190, 0.1)'
          : isHovered
            ? flowCoreColours.darkGrey
            : flowCoreColours.matteBlack,
        border: `1px solid ${selected ? flowCoreColours.slateCyan : flowCoreColours.borderGrey}`,
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.24s ease',
        fontFamily:
          'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: '100%',
          paddingTop: '66.67%', // 3:2 aspect ratio
          position: 'relative',
          backgroundColor: flowCoreColours.darkGrey,
          borderBottom: `1px solid ${flowCoreColours.borderGrey}`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
          }}
        >
          {getKindIcon(asset.kind)}
        </div>

        {/* Public badge */}
        {asset.is_public && (
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              padding: '4px 8px',
              backgroundColor: flowCoreColours.matteBlack,
              border: `1px solid ${flowCoreColours.slateCyan}`,
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 600,
              color: flowCoreColours.slateCyan,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            public
          </div>
        )}
      </div>

      {/* Metadata */}
      <div style={{ padding: '12px', flex: 1 }}>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: flowCoreColours.textPrimary,
            marginBottom: '4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={asset.title}
        >
          {asset.title}
        </div>
        <div
          style={{
            fontSize: '11px',
            color: flowCoreColours.textTertiary,
          }}
        >
          {asset.kind} · {formatBytes(asset.byte_size)} · {formatRelativeTime(asset.created_at)}
        </div>

        {/* Tags */}
        {asset.tags && asset.tags.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px',
              marginTop: '8px',
            }}
          >
            {asset.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{
                  padding: '2px 6px',
                  backgroundColor: 'rgba(58, 169, 190, 0.1)',
                  border: `1px solid ${flowCoreColours.slateCyan}`,
                  borderRadius: '3px',
                  fontSize: '10px',
                  color: flowCoreColours.slateCyan,
                }}
              >
                {tag}
              </span>
            ))}
            {asset.tags.length > 3 && (
              <span
                style={{
                  padding: '2px 6px',
                  fontSize: '10px',
                  color: flowCoreColours.textTertiary,
                }}
              >
                +{asset.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.12 }}
        style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          display: 'flex',
          gap: '8px',
          pointerEvents: isHovered ? 'auto' : 'none',
        }}
      >
        {/* Copy Link */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleCopyLink()
          }}
          aria-label="Copy link"
          title="Copy link"
          style={{
            padding: '6px 10px',
            backgroundColor: flowCoreColours.matteBlack,
            border: `1px solid ${flowCoreColours.borderGrey}`,
            borderRadius: '4px',
            color: flowCoreColours.textSecondary,
            fontSize: '11px',
            cursor: 'pointer',
            transition: 'all 0.24s ease',
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
          copy
        </button>

        {/* Toggle Public */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onTogglePublic()
          }}
          aria-label={asset.is_public ? 'Make private' : 'Make public'}
          title={asset.is_public ? 'Make private' : 'Make public'}
          style={{
            padding: '6px 10px',
            backgroundColor: flowCoreColours.matteBlack,
            border: `1px solid ${flowCoreColours.borderGrey}`,
            borderRadius: '4px',
            color: flowCoreColours.textSecondary,
            fontSize: '11px',
            cursor: 'pointer',
            transition: 'all 0.24s ease',
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
          {asset.is_public ? '🔓' : '🔒'}
        </button>

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          aria-label="Delete asset"
          title="Delete asset"
          style={{
            padding: '6px 10px',
            backgroundColor: flowCoreColours.matteBlack,
            border: `1px solid ${flowCoreColours.borderGrey}`,
            borderRadius: '4px',
            color: flowCoreColours.textSecondary,
            fontSize: '11px',
            cursor: 'pointer',
            transition: 'all 0.24s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#E57373'
            e.currentTarget.style.color = '#E57373'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = flowCoreColours.borderGrey
            e.currentTarget.style.color = flowCoreColours.textSecondary
          }}
        >
          delete
        </button>
      </motion.div>
    </motion.div>
  )
}
