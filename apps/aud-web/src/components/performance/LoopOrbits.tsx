/**
 * Loop Orbits
 * Phase 16: Autonomous loops visualized as satellites orbiting OS nodes
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
 * OS colours for loop satellites
 */
const OS_COLOURS: Record<ThemeId, string> = {
  ascii: '#00ff00',
  xp: '#3478f6',
  aqua: '#00ccff',
  daw: '#ff1aff',
  analogue: '#ff8800',
}

/**
 * All OS IDs
 */
const ALL_OS_IDS: ThemeId[] = ['ascii', 'xp', 'aqua', 'daw', 'analogue']

/**
 * Loop Orbits container
 */
export function LoopOrbits() {
  const { performanceState } = usePerformance()

  // For demo purposes, create mock loops (3 per OS)
  // In production, this would read from actual loop state
  const mockLoops: Array<{ os: ThemeId; index: number }> = []
  ALL_OS_IDS.forEach((os) => {
    // Show 3 loops per OS for visualization
    for (let i = 0; i < 3; i++) {
      mockLoops.push({ os, index: i })
    }
  })

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      {mockLoops.map(({ os, index }) => (
        <LoopSatellite key={`${os}-${index}`} os={os} orbitIndex={index} />
      ))}
    </div>
  )
}

/**
 * Individual loop satellite orbiting an OS
 */
interface LoopSatelliteProps {
  os: ThemeId
  orbitIndex: number
}

function LoopSatellite({ os, orbitIndex }: LoopSatelliteProps) {
  const position = PENTAGON_POSITIONS[os]
  const colour = OS_COLOURS[os]

  // Orbital properties (vary per orbit index)
  const orbitRadius = 80 + orbitIndex * 20 // 80px, 100px, 120px
  const orbitDuration = 4 + orbitIndex * 1.5 // 4s, 5.5s, 7s
  const size = 10 + orbitIndex * 2 // 10px, 12px, 14px
  const startAngle = (orbitIndex * 120) % 360 // Stagger starting positions

  // Calculate orbit path
  const orbitPath = Array.from({ length: 60 }, (_, i) => {
    const angle = ((i / 60) * 360 + startAngle) * (Math.PI / 180)
    return {
      x: position.x + (Math.cos(angle) * orbitRadius) / 10, // Convert to percentage offset
      y: position.y + (Math.sin(angle) * orbitRadius) / 10,
    }
  })

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: colour,
        boxShadow: `0 0 ${size * 2}px ${colour}80`,
        transform: 'translate(-50%, -50%)',
      }}
      animate={{
        x: orbitPath.map((p) => `${p.x - position.x}vw`),
        y: orbitPath.map((p) => `${p.y - position.y}vh`),
      }}
      transition={{
        duration: orbitDuration,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  )
}
