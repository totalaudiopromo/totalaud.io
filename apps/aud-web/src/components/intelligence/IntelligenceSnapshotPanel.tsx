/**
 * Intelligence Snapshot Panel
 * Phase 15: CIB 2.0 - Point-in-time OS state
 */

'use client'

import { motion } from 'framer-motion'
import { Camera } from 'lucide-react'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { useSocialGraph } from '@totalaud/os-state/campaign'
import type { ThemeId } from '@totalaud/os-state/campaign'

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

export interface IntelligenceSnapshotPanelProps {
  snapshotDate?: string // ISO timestamp
}

export function IntelligenceSnapshotPanel({ snapshotDate }: IntelligenceSnapshotPanelProps) {
  const { getSocialSummary, getCohesionScore, socialGraph } = useSocialGraph()

  const summary = getSocialSummary()
  const cohesionScore = getCohesionScore()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px',
        backgroundColor: flowCoreColours.matteBlack,
        border: `1px solid ${flowCoreColours.borderSubtle}`,
        borderRadius: '8px',
      }}
    >
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Camera size={16} strokeWidth={1.6} style={{ color: flowCoreColours.slateCyan }} />
          <h4
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: flowCoreColours.textPrimary,
              margin: 0,
            }}
          >
            Point-in-Time Snapshot
          </h4>
        </div>
        {snapshotDate && (
          <p
            style={{
              fontSize: '11px',
              color: flowCoreColours.textTertiary,
              margin: 0,
            }}
          >
            {new Date(snapshotDate).toLocaleString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>

      {/* Leader OS */}
      {summary.leaderOS && (
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: flowCoreColours.textSecondary,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Leader
          </div>
          <div
            style={{
              padding: '12px',
              backgroundColor: `${OS_COLOURS[summary.leaderOS]}10`,
              border: `1px solid ${OS_COLOURS[summary.leaderOS]}`,
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: OS_COLOURS[summary.leaderOS],
                boxShadow: `0 0 10px ${OS_COLOURS[summary.leaderOS]}60`,
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: OS_COLOURS[summary.leaderOS],
                }}
              >
                {OS_LABELS[summary.leaderOS]}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: flowCoreColours.textTertiary,
                  marginTop: '2px',
                }}
              >
                Guiding most decisions
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cohesion */}
      <div>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 500,
            color: flowCoreColours.textSecondary,
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Cohesion
        </div>
        <div
          style={{
            fontSize: '32px',
            fontWeight: 700,
            color: getCohesionColour(cohesionScore),
            fontVariantNumeric: 'tabular-nums',
            marginBottom: '8px',
          }}
        >
          {(cohesionScore * 100).toFixed(0)}%
        </div>
        <div
          style={{
            height: '8px',
            backgroundColor: flowCoreColours.borderSubtle,
            borderRadius: '4px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${cohesionScore * 100}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              height: '100%',
              backgroundColor: getCohesionColour(cohesionScore),
              boxShadow: `0 0 12px ${getCohesionColour(cohesionScore)}40`,
            }}
          />
        </div>
      </div>

      {/* OS Stats Grid */}
      <div>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 500,
            color: flowCoreColours.textSecondary,
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          OS Metrics
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '12px',
          }}
        >
          {(['ascii', 'xp', 'aqua', 'daw', 'analogue'] as ThemeId[]).map((os) => (
            <div
              key={os}
              style={{
                padding: '10px',
                backgroundColor: `${OS_COLOURS[os]}08`,
                border: `1px solid ${OS_COLOURS[os]}30`,
                borderRadius: '4px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: OS_COLOURS[os],
                  marginBottom: '6px',
                }}
              >
                {OS_LABELS[os]}
              </div>
              {/* Placeholder stats */}
              <div style={{ fontSize: '10px', color: flowCoreColours.textTertiary }}>
                Stats available with evolution data
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Relationship Matrix (compact) */}
      {socialGraph.relationships.length > 0 && (
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: flowCoreColours.textSecondary,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Relationship Matrix
          </div>
          <div
            style={{
              fontSize: '11px',
              color: flowCoreColours.textTertiary,
              padding: '12px',
              backgroundColor: `${flowCoreColours.borderSubtle}20`,
              borderRadius: '4px',
            }}
          >
            {socialGraph.relationships.length} OS pair
            {socialGraph.relationships.length !== 1 ? 's' : ''} with established relationships
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Get cohesion colour
 */
function getCohesionColour(score: number): string {
  if (score >= 0.7) return '#00ff99' // High - green
  if (score >= 0.4) return '#ff8800' // Medium - orange
  return '#ff5555' // Low - red
}
