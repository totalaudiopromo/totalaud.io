import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import type { Asset } from '@/hooks/useAssets'
import { getAssetKindIcon } from '@/components/assets/assetKindIcons'

interface AssetListItemProps {
  asset: Asset
  index: number
  prefersReducedMotion: boolean
  attachableNodeKind: string | null
  onAttach: (asset: Asset) => void
  formatSize: (bytes: number) => string
  formatRelativeTime: (dateString: string) => string
}

export function AssetListItem({
  asset,
  index,
  prefersReducedMotion,
  attachableNodeKind,
  onAttach,
  formatSize,
  formatRelativeTime,
}: AssetListItemProps) {
  const Icon = getAssetKindIcon(asset.kind)

  return (
    <motion.div
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
      {/* Asset icon */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          color: flowCoreColours.slateCyan,
        }}
      >
        <Icon size={22} strokeWidth={1.5} />
      </div>

      {/* Asset info */}
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
          {asset.byte_size && asset.created_at && ' · '}
          {asset.created_at && formatRelativeTime(asset.created_at)}
        </div>
      </div>

      {/* Quick attach button */}
      <button
        onClick={() => onAttach(asset)}
        disabled={!attachableNodeKind}
        aria-label={`Attach ${asset.title}`}
        style={{
          padding: '6px 12px',
          backgroundColor: attachableNodeKind
            ? flowCoreColours.slateCyan
            : flowCoreColours.borderGrey,
          color: attachableNodeKind ? flowCoreColours.matteBlack : flowCoreColours.textTertiary,
          border: 'none',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 600,
          cursor: attachableNodeKind ? 'pointer' : 'not-allowed',
          textTransform: 'lowercase',
          transition: 'all var(--flowcore-motion-fast) ease',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          if (attachableNodeKind) {
            e.currentTarget.style.backgroundColor = flowCoreColours.iceCyan
          }
        }}
        onMouseLeave={(e) => {
          if (attachableNodeKind) {
            e.currentTarget.style.backgroundColor = flowCoreColours.slateCyan
          }
        }}
      >
        attach
      </button>
    </motion.div>
  )
}
