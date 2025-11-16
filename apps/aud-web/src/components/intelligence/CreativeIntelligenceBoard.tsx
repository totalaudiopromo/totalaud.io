/**
 * Creative Intelligence Board (CIB)
 * Phase 14: Main panel showing OS social graph and identity summary
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import type { ThemeId } from '@totalaud/os-state/campaign'
import { useSocialGraph } from '@totalaud/os-state/campaign'
import { OSRelationshipGraph } from './OSRelationshipGraph'
import { OSIdentitySummary } from './OSIdentitySummary'

interface CreativeIntelligenceBoardProps {
  onClose?: () => void
  asModal?: boolean
}

export function CreativeIntelligenceBoard({
  onClose,
  asModal = false,
}: CreativeIntelligenceBoardProps) {
  const { socialGraph } = useSocialGraph()
  const [selectedOS, setSelectedOS] = useState<ThemeId | null>(null)

  const handleOSClick = (os: ThemeId) => {
    setSelectedOS(os === selectedOS ? null : os)
  }

  const containerStyle: React.CSSProperties = asModal
    ? {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90vw',
        maxWidth: '1200px',
        height: '85vh',
        maxHeight: '800px',
        backgroundColor: flowCoreColours.matteBlack,
        border: `1px solid ${flowCoreColours.borderSubtle}`,
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        zIndex: 1000,
        overflow: 'hidden',
      }
    : {
        width: '100%',
        height: '100%',
        backgroundColor: flowCoreColours.matteBlack,
        border: `1px solid ${flowCoreColours.borderSubtle}`,
        borderRadius: '8px',
        overflow: 'hidden',
      }

  return (
    <>
      {/* Modal backdrop */}
      {asModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 999,
          }}
        />
      )}

      {/* Main container */}
      <motion.div
        initial={asModal ? { scale: 0.95, opacity: 0 } : {}}
        animate={asModal ? { scale: 1, opacity: 1 } : {}}
        exit={asModal ? { scale: 0.95, opacity: 0 } : {}}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        style={containerStyle}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: `1px solid ${flowCoreColours.borderSubtle}`,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: flowCoreColours.textPrimary,
                marginBottom: '4px',
              }}
            >
              Creative Intelligence Board
            </h2>
            <p
              style={{
                fontSize: '13px',
                color: flowCoreColours.textTertiary,
                lineHeight: 1.4,
              }}
            >
              OS social dynamics and emergent identity
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Snapshot button */}
            <button
              onClick={() => {
                // TODO: Implement snapshot creation
                console.log('[CIB] Create snapshot')
              }}
              style={{
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: 500,
                color: flowCoreColours.textSecondary,
                backgroundColor: 'transparent',
                border: `1px solid ${flowCoreColours.borderSubtle}`,
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 120ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = flowCoreColours.accentCyan
                e.currentTarget.style.color = flowCoreColours.accentCyan
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = flowCoreColours.borderSubtle
                e.currentTarget.style.color = flowCoreColours.textSecondary
              }}
            >
              Snapshot
            </button>

            {/* Close button (modal only) */}
            {asModal && onClose && (
              <button
                onClick={onClose}
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  color: flowCoreColours.textSecondary,
                  backgroundColor: 'transparent',
                  border: `1px solid ${flowCoreColours.borderSubtle}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 120ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#ff5555'
                  e.currentTarget.style.color = '#ff5555'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = flowCoreColours.borderSubtle
                  e.currentTarget.style.color = flowCoreColours.textSecondary
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Content area */}
        <div
          style={{
            display: 'flex',
            height: 'calc(100% - 73px)',
            overflow: 'hidden',
          }}
        >
          {/* Left/Center: Graph */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              overflow: 'auto',
            }}
          >
            <OSRelationshipGraph
              relationships={socialGraph.relationships}
              onOSClick={handleOSClick}
            />
          </div>

          {/* Right: Summary sidebar */}
          <div
            style={{
              width: '320px',
              borderLeft: `1px solid ${flowCoreColours.borderSubtle}`,
              overflow: 'auto',
            }}
          >
            <OSIdentitySummary onOSClick={handleOSClick} />
          </div>
        </div>

        {/* Selected OS info (optional footer) */}
        {selectedOS && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            style={{
              borderTop: `1px solid ${flowCoreColours.borderSubtle}`,
              padding: '16px 24px',
              backgroundColor: `${getOSColour(selectedOS)}08`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: getOSColour(selectedOS),
                  boxShadow: `0 0 12px ${getOSColour(selectedOS)}80`,
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: getOSColour(selectedOS),
                    marginBottom: '2px',
                  }}
                >
                  {getOSLabel(selectedOS)} Selected
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: flowCoreColours.textTertiary,
                  }}
                >
                  Click again to deselect
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </>
  )
}

/**
 * Helper functions for OS metadata
 */
const OS_COLOURS: Record<ThemeId, string> = {
  ascii: '#00ff99',
  xp: '#3478f6',
  aqua: '#3b82f6',
  daw: '#ff8000',
  analogue: '#ff1aff',
}

const OS_LABELS: Record<ThemeId, string> = {
  ascii: 'ASCII',
  xp: 'XP',
  aqua: 'Aqua',
  daw: 'DAW',
  analogue: 'Analogue',
}

function getOSColour(os: ThemeId): string {
  return OS_COLOURS[os]
}

function getOSLabel(os: ThemeId): string {
  return OS_LABELS[os]
}
