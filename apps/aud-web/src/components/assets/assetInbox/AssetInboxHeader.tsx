'use client'

import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { X } from 'lucide-react'
import type { NodeKind } from '@/types/console'

interface AssetInboxHeaderProps {
  searchQuery: string
  setSearchQuery: (value: string) => void
  selectedKind: string | null
  setSelectedKind: (value: string | null) => void
  clearFilters: () => void
  newUploadsCount: number
  attachableNodeKind: Exclude<NodeKind, 'intel'> | null
  onClose: () => void
}

export function AssetInboxHeader({
  searchQuery,
  setSearchQuery,
  selectedKind,
  setSelectedKind,
  clearFilters,
  newUploadsCount,
  attachableNodeKind,
  onClose,
}: AssetInboxHeaderProps) {
  return (
    <div
      style={{
        padding: '24px',
        borderBottom: `1px solid ${flowCoreColours.borderGrey}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: flowCoreColours.iceCyan,
              margin: 0,
              textTransform: 'lowercase',
            }}
          >
            asset inbox
          </h2>
          {newUploadsCount > 0 && (
            <span
              style={{
                padding: '2px 8px',
                backgroundColor: flowCoreColours.slateCyan,
                color: flowCoreColours.matteBlack,
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '12px',
              }}
            >
              {newUploadsCount} new
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Close asset inbox"
          style={{
            background: 'transparent',
            border: 'none',
            color: flowCoreColours.textSecondary,
            fontSize: '24px',
            cursor: 'pointer',
            padding: '4px',
            transition: 'color var(--flowcore-motion-fast) ease',
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.color = flowCoreColours.iceCyan
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.color = flowCoreColours.textSecondary
          }}
        >
          <X size={18} strokeWidth={1.5} />
        </button>
      </div>

      <input
        type="text"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="search assets..."
        style={{
          width: '100%',
          padding: '10px 12px',
          backgroundColor: flowCoreColours.matteBlack,
          border: `1px solid ${flowCoreColours.borderGrey}`,
          borderRadius: '4px',
          color: flowCoreColours.textPrimary,
          fontSize: '13px',
          fontFamily: 'inherit',
          outline: 'none',
          transition: 'border-color var(--flowcore-motion-normal) ease',
        }}
        onFocus={(event) => {
          event.currentTarget.style.borderColor = flowCoreColours.slateCyan
        }}
        onBlur={(event) => {
          event.currentTarget.style.borderColor = flowCoreColours.borderGrey
        }}
      />

      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginTop: '12px',
          flexWrap: 'wrap',
        }}
      >
        {(['audio', 'image', 'document', 'archive'] as const).map((kind) => {
          const isActive = selectedKind === kind
          return (
            <button
              key={kind}
              onClick={() => setSelectedKind(isActive ? null : kind)}
              style={{
                padding: '6px 12px',
                backgroundColor: isActive
                  ? `${flowCoreColours.slateCyan}20`
                  : flowCoreColours.matteBlack,
                border: `1px solid ${isActive ? flowCoreColours.slateCyan : flowCoreColours.borderGrey}`,
                borderRadius: '4px',
                color: isActive ? flowCoreColours.slateCyan : flowCoreColours.textSecondary,
                fontSize: '12px',
                cursor: 'pointer',
                textTransform: 'lowercase',
                transition: 'all var(--flowcore-motion-fast) ease',
              }}
            >
              {kind}
            </button>
          )
        })}

        {selectedKind && (
          <button
            onClick={clearFilters}
            style={{
              padding: '6px 12px',
              backgroundColor: 'transparent',
              border: `1px solid ${flowCoreColours.borderGrey}`,
              borderRadius: '4px',
              color: flowCoreColours.textSecondary,
              fontSize: '12px',
              cursor: 'pointer',
              textTransform: 'lowercase',
            }}
          >
            clear
          </button>
        )}
      </div>

      {attachableNodeKind && (
        <div
          style={{
            marginTop: '12px',
            padding: '8px 12px',
            backgroundColor: `${flowCoreColours.iceCyan}10`,
            border: `1px solid ${flowCoreColours.iceCyan}40`,
            borderRadius: '4px',
            fontSize: '12px',
            color: flowCoreColours.iceCyan,
          }}
        >
          attaching to: <strong>{attachableNodeKind} agent</strong>
        </div>
      )}
    </div>
  )
}
