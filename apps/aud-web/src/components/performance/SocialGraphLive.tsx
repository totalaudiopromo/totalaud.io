/**
 * Social Graph Live
 * Phase 16: Animated edges showing OS relationships
 */

'use client'

import { motion } from 'framer-motion'
import { usePerformance } from './PerformanceCanvas'
import type { ThemeId } from '@totalaud/os-state/campaign'

/**
 * Pentagon positions (same as OSPerformers)
 */
const PENTAGON_POSITIONS: Record<ThemeId, { x: number; y: number }> = {
  ascii: { x: 50, y: 20 },
  xp: { x: 75, y: 35 },
  aqua: { x: 65, y: 70 },
  daw: { x: 35, y: 70 },
  analogue: { x: 25, y: 35 },
}

/**
 * Convert percentage position to viewport pixels
 */
function getPixelPosition(os: ThemeId, width: number, height: number) {
  const pos = PENTAGON_POSITIONS[os]
  return {
    x: (pos.x / 100) * width,
    y: (pos.y / 100) * height,
  }
}

/**
 * Get edge colour based on trust level
 */
function getEdgeColour(trust: number): string {
  if (trust > 0.7) return '#00ff99' // high trust - green
  if (trust > 0.4) return '#3AA9BE' // medium trust - slate cyan
  return '#666666' // low trust - grey
}

/**
 * Social Graph Live
 */
export function SocialGraphLive() {
  const { performanceState } = usePerformance()

  // Get viewport dimensions (assume full screen for now)
  const width = typeof window !== 'undefined' ? window.innerWidth : 1920
  const height = typeof window !== 'undefined' ? window.innerHeight : 1080

  // Render all edges
  const edges: JSX.Element[] = []
  performanceState.edgeStates.forEach((edgeState, edgeKey) => {
    // Parse edge key (format: "osA-osB")
    const [osA, osB] = edgeKey.split('-') as [ThemeId, ThemeId]

    const posA = getPixelPosition(osA, width, height)
    const posB = getPixelPosition(osB, width, height)

    // Edge visual properties
    const thickness = 1 + edgeState.synergy * 4 // 1-5px
    const colour = getEdgeColour(edgeState.trust)
    const opacity = 0.3 + edgeState.synergy * 0.5 // 0.3-0.8

    // Vibration offset
    const vibrationOffset = edgeState.isVibrating ? edgeState.vibrationIntensity * 10 : 0

    edges.push(
      <EdgeLine
        key={edgeKey}
        from={posA}
        to={posB}
        thickness={thickness}
        colour={colour}
        opacity={opacity}
        vibrationOffset={vibrationOffset}
        showParticle={edgeState.trust > 0.5}
      />
    )
  })

  return (
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
      width={width}
      height={height}
    >
      {edges}
    </svg>
  )
}

/**
 * Individual edge line with vibration and flow particles
 */
interface EdgeLineProps {
  from: { x: number; y: number }
  to: { x: number; y: number }
  thickness: number
  colour: string
  opacity: number
  vibrationOffset: number
  showParticle: boolean
}

function EdgeLine({
  from,
  to,
  thickness,
  colour,
  opacity,
  vibrationOffset,
  showParticle,
}: EdgeLineProps) {
  // Calculate perpendicular offset for vibration
  const dx = to.x - from.x
  const dy = to.y - from.y
  const length = Math.sqrt(dx * dx + dy * dy)
  const perpX = (-dy / length) * vibrationOffset
  const perpY = (dx / length) * vibrationOffset

  return (
    <g>
      {/* Main edge line */}
      <motion.line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={colour}
        strokeWidth={thickness}
        strokeOpacity={opacity}
        strokeLinecap="round"
        animate={
          vibrationOffset > 0
            ? {
                x1: [from.x, from.x + perpX, from.x],
                y1: [from.y, from.y + perpY, from.y],
                x2: [to.x, to.x + perpX, to.x],
                y2: [to.y, to.y + perpY, to.y],
              }
            : {}
        }
        transition={{
          duration: 0.4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Flow particle */}
      {showParticle && (
        <motion.circle
          r={thickness + 2}
          fill={colour}
          opacity={0.8}
          animate={{
            cx: [from.x, to.x, from.x],
            cy: [from.y, to.y, from.y],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <animate attributeName="opacity" values="0.8;1;0.8" dur="1s" repeatCount="indefinite" />
        </motion.circle>
      )}
    </g>
  )
}
