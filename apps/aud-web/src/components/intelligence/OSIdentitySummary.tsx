/**
 * OS Identity Summary
 * Phase 14: Sidebar showing leader/support/rebel roles and cohesion
 */

'use client'

import { motion } from 'framer-motion'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import type { ThemeId } from '@totalaud/os-state/campaign'
import { useSocialGraph } from '@totalaud/os-state/campaign'

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

interface OSIdentitySummaryProps {
  onOSClick?: (os: ThemeId) => void
}

export function OSIdentitySummary({ onOSClick }: OSIdentitySummaryProps) {
  const { getSocialSummary } = useSocialGraph()
  const summary = getSocialSummary()

  const { leaderOS, supportOS, rebelOS, cohesionScore } = summary

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: '24px',
        backgroundColor: flowCoreColours.matteBlack,
        border: `1px solid ${flowCoreColours.borderSubtle}`,
        borderRadius: '8px',
      }}
    >
      {/* Header */}
      <div>
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: flowCoreColours.textPrimary,
            marginBottom: '4px',
          }}
        >
          OS Identity
        </h3>
        <p
          style={{
            fontSize: '12px',
            color: flowCoreColours.textTertiary,
            lineHeight: 1.4,
          }}
        >
          Social dynamics and emergent roles
        </p>
      </div>

      {/* Leader OS */}
      {leaderOS && (
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
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onOSClick?.(leaderOS)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              backgroundColor: `${OS_COLOURS[leaderOS]}15`,
              border: `1.5px solid ${OS_COLOURS[leaderOS]}`,
              borderRadius: '6px',
              cursor: onOSClick ? 'pointer' : 'default',
              width: '100%',
              transition: 'all 120ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: OS_COLOURS[leaderOS],
                boxShadow: `0 0 12px ${OS_COLOURS[leaderOS]}80`,
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: OS_COLOURS[leaderOS],
                  marginBottom: '2px',
                }}
              >
                {OS_LABELS[leaderOS]}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: flowCoreColours.textTertiary,
                  lineHeight: 1.3,
                }}
              >
                Currently leading most decisions
              </div>
            </div>
          </motion.button>
        </div>
      )}

      {/* Support OSs */}
      {supportOS.length > 0 && (
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
            Support ({supportOS.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {supportOS.map((os, index) => (
              <motion.button
                key={os}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.24, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onOSClick?.(os)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  backgroundColor: `${OS_COLOURS[os]}08`,
                  border: `1px solid ${OS_COLOURS[os]}40`,
                  borderRadius: '4px',
                  cursor: onOSClick ? 'pointer' : 'default',
                  transition: 'all 120ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: OS_COLOURS[os],
                  }}
                />
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: OS_COLOURS[os],
                  }}
                >
                  {OS_LABELS[os]}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Rebel OSs */}
      {rebelOS.length > 0 && (
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
            Challenger ({rebelOS.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {rebelOS.map((os, index) => (
              <motion.button
                key={os}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.24, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onOSClick?.(os)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  backgroundColor: `${OS_COLOURS[os]}08`,
                  border: `1px solid ${OS_COLOURS[os]}40`,
                  borderRadius: '4px',
                  cursor: onOSClick ? 'pointer' : 'default',
                  transition: 'all 120ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: OS_COLOURS[os],
                    boxShadow: `0 0 8px ${OS_COLOURS[os]}60`,
                  }}
                />
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: OS_COLOURS[os],
                  }}
                >
                  {OS_LABELS[os]}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Cohesion Meter */}
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
        <div>
          {/* Cohesion percentage */}
          <div
            style={{
              fontSize: '24px',
              fontWeight: 600,
              color: getCohesionColour(cohesionScore),
              marginBottom: '8px',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {(cohesionScore * 100).toFixed(0)}%
          </div>

          {/* Cohesion bar */}
          <div
            style={{
              position: 'relative',
              height: '8px',
              backgroundColor: flowCoreColours.borderSubtle,
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${cohesionScore * 100}%` }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                backgroundColor: getCohesionColour(cohesionScore),
                boxShadow: `0 0 12px ${getCohesionColour(cohesionScore)}60`,
              }}
            />
          </div>

          {/* Cohesion label */}
          <div
            style={{
              fontSize: '11px',
              color: flowCoreColours.textTertiary,
              marginTop: '6px',
              lineHeight: 1.3,
            }}
          >
            {getCohesionLabel(cohesionScore)}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!leaderOS && supportOS.length === 0 && rebelOS.length === 0 && (
        <div
          style={{
            padding: '32px 16px',
            textAlign: 'center',
            color: flowCoreColours.textTertiary,
            fontSize: '12px',
            lineHeight: 1.4,
          }}
        >
          No OS relationships yet.
          <br />
          Start fusion sessions to build the social graph.
        </div>
      )}
    </div>
  )
}

/**
 * Get colour based on cohesion score
 */
function getCohesionColour(score: number): string {
  if (score >= 0.7) return '#00ff99' // High cohesion - green
  if (score >= 0.4) return '#ff8800' // Medium cohesion - orange
  return '#ff5555' // Low cohesion - red
}

/**
 * Get label based on cohesion score
 */
function getCohesionLabel(score: number): string {
  if (score >= 0.8) return 'Highly aligned OS collective'
  if (score >= 0.6) return 'Strong collaboration across OSs'
  if (score >= 0.4) return 'Moderate tension, some disagreement'
  if (score >= 0.2) return 'High tension, conflicting perspectives'
  return 'Fragmented identity, major conflicts'
}
