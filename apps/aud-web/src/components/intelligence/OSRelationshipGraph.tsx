/**
 * OS Relationship Graph
 * Phase 14: Visual graph showing OS relationships as pentagon with edges
 */

'use client'

import { motion } from 'framer-motion'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import type { OSRelationship, ThemeId } from '@totalaud/os-state/campaign'
import { OSPersonalityDeltaBadge } from '../fusion/OSPersonalityDeltaBadge'
import { useEvolution } from '@totalaud/os-state/campaign'

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

interface OSRelationshipGraphProps {
  relationships: OSRelationship[]
  onOSClick?: (os: ThemeId) => void
}

export function OSRelationshipGraph({ relationships, onOSClick }: OSRelationshipGraphProps) {
  const { getOSProfile, hasSignificantDrift } = useEvolution()

  // Pentagon layout (5 nodes arranged in circle)
  const centerX = 250
  const centerY = 250
  const radius = 180

  const osNodes: Array<{ os: ThemeId; x: number; y: number; angle: number }> = [
    'ascii',
    'xp',
    'aqua',
    'daw',
    'analogue',
  ].map((os, index) => {
    // Start from top and go clockwise
    const angle = (index * (2 * Math.PI)) / 5 - Math.PI / 2
    return {
      os: os as ThemeId,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      angle,
    }
  })

  // Find relationship between two OSs
  const getRelationship = (osA: ThemeId, osB: ThemeId): OSRelationship | undefined => {
    return relationships.find(
      (r) =>
        (r.osA === osA && r.osB === osB) || (r.osA === osB && r.osB === osA)
    )
  }

  // Get edge colour based on trust/tension
  const getEdgeColour = (trust: number, tension: number): string => {
    // Green for high trust, red for high tension, grey for neutral
    if (tension > 0.5) return '#ff5555' // Red
    if (trust > 0.5) return '#00ff99' // Green
    if (trust < -0.3) return '#ff8800' // Orange
    return flowCoreColours.borderSubtle // Grey
  }

  // Get edge width based on synergy
  const getEdgeWidth = (synergy: number): number => {
    return 1 + synergy * 3 // 1-4px
  }

  return (
    <svg
      width="500"
      height="500"
      viewBox="0 0 500 500"
      style={{ maxWidth: '100%', height: 'auto' }}
    >
      {/* Edges (draw first, behind nodes) */}
      {osNodes.map((nodeA, i) =>
        osNodes.slice(i + 1).map((nodeB) => {
          const rel = getRelationship(nodeA.os, nodeB.os)
          if (!rel) return null

          const colour = getEdgeColour(rel.trust, rel.tension)
          const width = getEdgeWidth(rel.synergy)
          const glow = rel.tension > 0.6 || rel.synergy > 0.7

          return (
            <g key={`${nodeA.os}-${nodeB.os}`}>
              {/* Glow effect for high tension or synergy */}
              {glow && (
                <motion.line
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  x1={nodeA.x}
                  y1={nodeA.y}
                  x2={nodeB.x}
                  y2={nodeB.y}
                  stroke={colour}
                  strokeWidth={width + 4}
                  strokeOpacity={0.3}
                  filter="blur(4px)"
                />
              )}
              {/* Main edge */}
              <motion.line
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                x1={nodeA.x}
                y1={nodeA.y}
                x2={nodeB.x}
                y2={nodeB.y}
                stroke={colour}
                strokeWidth={width}
                strokeOpacity={0.8}
              />
              {/* Tooltip trigger (invisible wider line) */}
              <line
                x1={nodeA.x}
                y1={nodeA.y}
                x2={nodeB.x}
                y2={nodeB.y}
                stroke="transparent"
                strokeWidth={20}
                style={{ cursor: 'pointer' }}
              >
                <title>
                  {`${OS_LABELS[nodeA.os]} ↔ ${OS_LABELS[nodeB.os]}\n` +
                    `Trust: ${(rel.trust * 100).toFixed(0)}%\n` +
                    `Synergy: ${(rel.synergy * 100).toFixed(0)}%\n` +
                    `Tension: ${(rel.tension * 100).toFixed(0)}%`}
                </title>
              </line>
            </g>
          )
        })
      )}

      {/* Nodes */}
      {osNodes.map((node, index) => {
        const profile = getOSProfile(node.os)
        const hasDrift = hasSignificantDrift(node.os)
        const colour = OS_COLOURS[node.os]

        return (
          <g key={node.os}>
            {/* Confidence glow */}
            {profile && profile.confidenceLevel > 0.6 && (
              <motion.circle
                initial={{ r: 0, opacity: 0 }}
                animate={{ r: 35, opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 4, repeat: Infinity, delay: index * 0.2 }}
                cx={node.x}
                cy={node.y}
                fill={colour}
                filter="blur(8px)"
              />
            )}

            {/* Node circle */}
            <motion.circle
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.1 }}
              cx={node.x}
              cy={node.y}
              r={30}
              fill={flowCoreColours.matteBlack}
              stroke={colour}
              strokeWidth={hasDrift ? 3 : 2}
              style={{ cursor: onOSClick ? 'pointer' : 'default' }}
              onClick={() => onOSClick?.(node.os)}
            />

            {/* OS label */}
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={colour}
              fontSize="12"
              fontWeight="600"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {OS_LABELS[node.os]}
            </text>

            {/* Drift badge (positioned outside node) */}
            {hasDrift && profile && (
              <foreignObject
                x={node.x + 35}
                y={node.y - 10}
                width="100"
                height="30"
                style={{ overflow: 'visible' }}
              >
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {Math.abs(profile.confidenceLevel - 0.5) > 0.1 && (
                    <div style={{ fontSize: '9px', transform: 'scale(0.8)' }}>
                      <OSPersonalityDeltaBadge
                        os={node.os}
                        delta={profile.confidenceLevel - 0.5}
                        label="conf"
                        size="small"
                      />
                    </div>
                  )}
                </div>
              </foreignObject>
            )}
          </g>
        )
      })}

      {/* Center label */}
      <text
        x={centerX}
        y={centerY}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={flowCoreColours.textTertiary}
        fontSize="11"
        fontWeight="500"
        opacity={0.6}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        OS Network
      </text>
    </svg>
  )
}
