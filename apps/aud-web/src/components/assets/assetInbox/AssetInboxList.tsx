'use client'

import { motion } from 'framer-motion'
import { Archive, Lock } from 'lucide-react'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { getAssetKindIcon } from '@/components/assets/assetKindIcons'
import type { Asset } from '@/hooks/useAssets'
import type { NodeKind } from '@/types/console'
import { formatRelativeTime, formatSize } from './utils'

interface AssetInboxListProps {
  loading: boolean
  filteredAssets: Asset[]
  searchQuery: string
  selectedKind: string | null
  attachableNodeKind: Exclude<NodeKind, 'intel'> | null
  prefersReducedMotion: boolean
  onClearFilters: () => void
  onSearchClear: () => void
  onAttach: (asset: Asset) => void
}

export function AssetInboxList({
  loading,
  filteredAssets,
  searchQuery,
  selectedKind,
  attachableNodeKind,
  prefersReducedMotion,
  onClearFilters,
  onSearchClear,
  onAttach,
}: AssetInboxListProps) {
  return (
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

      {!loading && filteredAssets.length === 0 && (
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
                onSearchClear()
                onClearFilters()
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

      {!loading && filteredAssets.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredAssets.map((asset, index) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.24,
                delay: prefersReducedMotion ? 0 : index * 0.02,
              }}
              style={{
                padding: '12px',
                backgroundColor: flowCoreColours.matteBlack,
                border: `1px solid ${flowCoreColours.borderGrey}`,
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  color: flowCoreColours.slateCyan,
                }}
              >
                {(() => {
                  const Icon = getAssetKindIcon(asset.kind)
                  return <Icon size={22} strokeWidth={1.5} />
                })()}
              </div>

              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: flowCoreColours.textPrimary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginBottom: '4px',
                  }}
                >
                  {asset.title}
                  {!asset.is_public && (
                    <span
                      style={{
                        marginLeft: '6px',
                        fontSize: '11px',
                        color: flowCoreColours.warningOrange,
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
                    fontSize: '11px',
                    color: flowCoreColours.textTertiary,
                  }}
                >
                  {asset.byte_size && formatSize(asset.byte_size)}
                  {asset.byte_size && asset.created_at && ' - '}
                  {asset.created_at && formatRelativeTime(asset.created_at)}
                </div>
              </div>

              <button
                onClick={() => onAttach(asset)}
                disabled={!attachableNodeKind}
                aria-label={`Attach ${asset.title}`}
                style={{
                  padding: '6px 12px',
                  backgroundColor: attachableNodeKind
                    ? flowCoreColours.slateCyan
                    : flowCoreColours.borderGrey,
                  color: attachableNodeKind
                    ? flowCoreColours.matteBlack
                    : flowCoreColours.textTertiary,
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: attachableNodeKind ? 'pointer' : 'not-allowed',
                  textTransform: 'lowercase',
                  transition: 'all var(--flowcore-motion-fast) ease',
                  flexShrink: 0,
                }}
                onMouseEnter={(event) => {
                  if (attachableNodeKind) {
                    event.currentTarget.style.backgroundColor = flowCoreColours.iceCyan
                  }
                }}
                onMouseLeave={(event) => {
                  if (attachableNodeKind) {
                    event.currentTarget.style.backgroundColor = flowCoreColours.slateCyan
                  }
                }}
              >
                attach
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
