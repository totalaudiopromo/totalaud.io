/**
 * AssetSidebar Component
 * Phase 15.2-B: Multi-File UX + Agent Integration Layer
 *
 * Purpose:
 * - Search input (⌘F focus)
 * - Filter chips: images / audio / docs / other
 * - Campaign selector (dropdown)
 * - Tags (autocomplete + add/remove)
 * - Clear filters action
 *
 * Usage:
 * <AssetSidebar
 *   searchQuery={searchQuery}
 *   selectedKind={selectedKind}
 *   selectedTag={selectedTag}
 *   selectedCampaign={selectedCampaign}
 *   onSearchChange={setSearchQuery}
 *   onKindChange={setSelectedKind}
 *   onTagChange={setSelectedTag}
 *   onCampaignChange={setSelectedCampaign}
 *   onClearFilters={clearFilters}
 * />
 */

'use client'

import { useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import type { AssetKind } from '@/hooks/useAssetFilters'
import { logger } from '@/lib/logger'

const log = logger.scope('AssetSidebar')

export interface AssetSidebarProps {
  searchQuery: string
  selectedKind: AssetKind
  selectedTag: string | null
  selectedCampaign: string | null
  onSearchChange: (query: string) => void
  onKindChange: (kind: AssetKind) => void
  onTagChange: (tag: string | null) => void
  onCampaignChange: (campaignId: string | null) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
}

const KIND_OPTIONS: Array<{ value: AssetKind; label: string; icon: string }> = [
  { value: null, label: 'all', icon: '📁' },
  { value: 'audio', label: 'audio', icon: '🎵' },
  { value: 'image', label: 'images', icon: '🖼️' },
  { value: 'document', label: 'docs', icon: '📄' },
  { value: 'archive', label: 'archives', icon: '📦' },
  { value: 'link', label: 'links', icon: '🔗' },
  { value: 'other', label: 'other', icon: '📎' },
]

export function AssetSidebar({
  searchQuery,
  selectedKind,
  selectedTag,
  selectedCampaign,
  onSearchChange,
  onKindChange,
  onTagChange,
  onCampaignChange,
  onClearFilters,
  hasActiveFilters,
}: AssetSidebarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null)

  /**
   * Focus search input on ⌘F
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault()
        searchInputRef.current?.focus()
        log.debug('Search focused via keyboard shortcut')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  /**
   * Handle kind filter change
   */
  const handleKindChange = useCallback(
    (kind: AssetKind) => {
      onKindChange(kind)
      log.debug('Kind filter changed', { kind })
    },
    [onKindChange]
  )

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '300px',
        padding: '24px',
        backgroundColor: flowCoreColours.matteBlack,
        borderRight: `1px solid ${flowCoreColours.borderGrey}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        fontFamily:
          'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
      }}
    >
      {/* Search Input */}
      <div>
        <label
          htmlFor="asset-search"
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 500,
            color: flowCoreColours.textSecondary,
            marginBottom: '8px',
            textTransform: 'lowercase',
          }}
        >
          search <span style={{ color: flowCoreColours.textTertiary }}>(⌘f)</span>
        </label>
        <input
          ref={searchInputRef}
          id="asset-search"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="search assets..."
          style={{
            width: '100%',
            padding: '10px 12px',
            backgroundColor: flowCoreColours.darkGrey,
            border: `1px solid ${flowCoreColours.borderGrey}`,
            borderRadius: '4px',
            color: flowCoreColours.textPrimary,
            fontSize: '13px',
            fontFamily: 'inherit',
            outline: 'none',
            transition: 'border-color 0.24s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = flowCoreColours.slateCyan
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = flowCoreColours.borderGrey
          }}
        />
      </div>

      {/* Kind Filters */}
      <div>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 500,
            color: flowCoreColours.textSecondary,
            marginBottom: '12px',
            textTransform: 'lowercase',
          }}
        >
          type
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {KIND_OPTIONS.map((option) => (
            <button
              key={option.value || 'all'}
              onClick={() => handleKindChange(option.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor:
                  selectedKind === option.value ? 'rgba(58, 169, 190, 0.1)' : 'transparent',
                border: `1px solid ${
                  selectedKind === option.value
                    ? flowCoreColours.slateCyan
                    : flowCoreColours.borderGrey
                }`,
                borderRadius: '4px',
                color:
                  selectedKind === option.value
                    ? flowCoreColours.iceCyan
                    : flowCoreColours.textSecondary,
                fontSize: '13px',
                fontWeight: selectedKind === option.value ? 600 : 400,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.24s ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                if (selectedKind !== option.value) {
                  e.currentTarget.style.borderColor = flowCoreColours.slateCyan
                  e.currentTarget.style.backgroundColor = 'rgba(58, 169, 190, 0.05)'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedKind !== option.value) {
                  e.currentTarget.style.borderColor = flowCoreColours.borderGrey
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              <span>{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Campaign Filter */}
      <div>
        <label
          htmlFor="campaign-filter"
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 500,
            color: flowCoreColours.textSecondary,
            marginBottom: '8px',
            textTransform: 'lowercase',
          }}
        >
          campaign
        </label>
        <select
          id="campaign-filter"
          value={selectedCampaign || ''}
          onChange={(e) => onCampaignChange(e.target.value || null)}
          style={{
            width: '100%',
            padding: '10px 12px',
            backgroundColor: flowCoreColours.darkGrey,
            border: `1px solid ${flowCoreColours.borderGrey}`,
            borderRadius: '4px',
            color: flowCoreColours.textPrimary,
            fontSize: '13px',
            fontFamily: 'inherit',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="">all campaigns</option>
          {/* TODO: Load campaigns from API */}
          <option value="demo-campaign-1">demo campaign 1</option>
          <option value="demo-campaign-2">demo campaign 2</option>
        </select>
      </div>

      {/* Tag Filter */}
      <div>
        <label
          htmlFor="tag-filter"
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 500,
            color: flowCoreColours.textSecondary,
            marginBottom: '8px',
            textTransform: 'lowercase',
          }}
        >
          tag
        </label>
        <input
          id="tag-filter"
          type="text"
          value={selectedTag || ''}
          onChange={(e) => onTagChange(e.target.value || null)}
          placeholder="filter by tag..."
          style={{
            width: '100%',
            padding: '10px 12px',
            backgroundColor: flowCoreColours.darkGrey,
            border: `1px solid ${flowCoreColours.borderGrey}`,
            borderRadius: '4px',
            color: flowCoreColours.textPrimary,
            fontSize: '13px',
            fontFamily: 'inherit',
            outline: 'none',
            transition: 'border-color 0.24s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = flowCoreColours.slateCyan
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = flowCoreColours.borderGrey
          }}
        />
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <motion.button
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          onClick={onClearFilters}
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
            transition: 'all 0.24s ease',
            fontFamily: 'inherit',
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
          clear filters
        </motion.button>
      )}

      {/* Help Text */}
      <div
        style={{
          marginTop: 'auto',
          padding: '16px',
          backgroundColor: 'rgba(58, 169, 190, 0.05)',
          border: `1px solid ${flowCoreColours.borderGrey}`,
          borderRadius: '4px',
          fontSize: '11px',
          color: flowCoreColours.textTertiary,
          lineHeight: 1.6,
        }}
      >
        <div style={{ marginBottom: '8px', fontWeight: 600, color: flowCoreColours.textSecondary }}>
          keyboard shortcuts
        </div>
        <div>⌘F - focus search</div>
        <div>⌘U - upload asset</div>
        <div>Enter - view asset</div>
        <div>Del - delete asset</div>
      </div>
    </div>
  )
}
