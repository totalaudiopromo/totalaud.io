/**
 * ConsoleHeader Component
 * Phase 15.3: Connected Console & Orchestration
 *
 * Purpose:
 * - Console header with branding
 * - Asset Inbox button with new uploads badge
 * - Quick access to common actions
 *
 * @todo: upgrade if legacy component found
 */

'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { logger } from '@/lib/logger'
import { useAssets } from '@/hooks/useAssets'
import { AssetInboxDrawer } from '@/components/assets/AssetInboxDrawer'
import type { AssetAttachment } from '@/types/asset-attachment'
import type { NodeKind } from '@/types/console'

const log = logger.scope('ConsoleHeader')

export interface ConsoleHeaderProps {
  campaignId?: string
  userId?: string
  currentNodeKind?: NodeKind
  onAssetAttach?: (asset: AssetAttachment) => void
  onFlowHubOpen?: () => void
}

export function ConsoleHeader({
  campaignId,
  userId,
  currentNodeKind,
  onAssetAttach,
  onFlowHubOpen,
}: ConsoleHeaderProps) {
  const [assetInboxOpen, setAssetInboxOpen] = useState(false)
  const { assets } = useAssets({})

  /**
   * Calculate new uploads (last 24 hours)
   */
  const newUploadsCount = useMemo(() => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    return assets.filter((asset) => {
      const createdAt = asset.created_at ? new Date(asset.created_at).getTime() : 0
      return createdAt > oneDayAgo
    }).length
  }, [assets])

  /**
   * Handle asset inbox toggle
   */
  const handleAssetInboxToggle = useCallback(() => {
    log.debug('Asset inbox toggled', { wasOpen: assetInboxOpen })
    setAssetInboxOpen((prev) => !prev)
  }, [assetInboxOpen])

  /**
   * Global ⌘U shortcut
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'u') {
        // Ignore if inside input/textarea
        const target = event.target as HTMLElement
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return
        }

        event.preventDefault()
        setAssetInboxOpen((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          backgroundColor: flowCoreColours.darkGrey,
          fontFamily:
            'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
        }}
      >
        {/* Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: `linear-gradient(135deg, ${flowCoreColours.slateCyan}, ${flowCoreColours.iceCyan})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 700,
              color: flowCoreColours.matteBlack,
            }}
          >
            ▶
          </div>
          <div>
            <h1
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: flowCoreColours.iceCyan,
                margin: 0,
                textTransform: 'lowercase',
                letterSpacing: '0.5px',
              }}
            >
              console
            </h1>
            {campaignId && (
              <div
                style={{
                  fontSize: '11px',
                  color: flowCoreColours.textTertiary,
                  marginTop: '2px',
                }}
              >
                campaign: {campaignId.slice(0, 8)}...
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Flow Hub Button */}
          {onFlowHubOpen && (
            <motion.button
              onClick={onFlowHubOpen}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Open Flow Hub"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: 'rgba(58, 169, 190, 0.15)',
                border: `1px solid ${flowCoreColours.slateCyan}`,
                borderRadius: '6px',
                color: flowCoreColours.iceCyan,
                fontSize: '13px',
                fontWeight: 600,
                textTransform: 'lowercase',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(58, 169, 190, 0.25)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(58, 169, 190, 0.15)'
              }}
            >
              <span>flow hub</span>
              <kbd
                style={{
                  padding: '2px 6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '3px',
                  fontSize: '11px',
                  fontFamily: 'inherit',
                }}
              >
                ⌘⇧H
              </kbd>
            </motion.button>
          )}

          {/* Current Node Indicator */}
          {currentNodeKind && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: 'rgba(58, 169, 190, 0.1)',
                border: `1px solid ${flowCoreColours.slateCyan}`,
                borderRadius: '6px',
                fontSize: '12px',
                color: flowCoreColours.iceCyan,
                textTransform: 'lowercase',
              }}
            >
              <span>active:</span>
              <span style={{ fontWeight: 600 }}>{currentNodeKind} agent</span>
            </div>
          )}

          {/* Asset Inbox Button */}
          <motion.button
            onClick={handleAssetInboxToggle}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Open asset inbox"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: flowCoreColours.slateCyan,
              border: 'none',
              borderRadius: '6px',
              color: flowCoreColours.matteBlack,
              fontSize: '13px',
              fontWeight: 600,
              textTransform: 'lowercase',
              cursor: 'pointer',
              transition: 'all 0.12s ease',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = flowCoreColours.iceCyan
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = flowCoreColours.slateCyan
            }}
          >
            <span>asset inbox</span>
            <kbd
              style={{
                padding: '2px 6px',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '3px',
                fontSize: '11px',
                fontFamily: 'inherit',
              }}
            >
              ⌘U
            </kbd>

            {/* New Uploads Badge */}
            {newUploadsCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  minWidth: '20px',
                  height: '20px',
                  padding: '0 6px',
                  backgroundColor: flowCoreColours.warningOrange,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: flowCoreColours.matteBlack,
                  boxShadow: `0 2px 8px rgba(255, 107, 0, 0.3)`,
                }}
              >
                {newUploadsCount}
              </motion.div>
            )}
          </motion.button>
        </div>
      </header>

      {/* Asset Inbox Drawer */}
      <AssetInboxDrawer
        open={assetInboxOpen}
        onClose={() => setAssetInboxOpen(false)}
        onAttach={onAssetAttach}
        currentNodeKind={currentNodeKind}
      />
    </>
  )
}
