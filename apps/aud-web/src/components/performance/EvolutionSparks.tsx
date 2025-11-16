/**
 * Evolution Sparks
 * Phase 16: Particle bursts triggered by OS evolution events
 */

'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
 * OS colours for sparks
 */
const OS_COLOURS: Record<ThemeId, string> = {
  ascii: '#00ff00',
  xp: '#3478f6',
  aqua: '#00ccff',
  daw: '#ff1aff',
  analogue: '#ff8800',
}

/**
 * Particle burst data
 */
interface ParticleBurst {
  id: string
  os: ThemeId
  timestamp: number
}

/**
 * Evolution Sparks particle system
 */
export function EvolutionSparks() {
  const { performanceState } = usePerformance()
  const [bursts, setBursts] = useState<ParticleBurst[]>([])

  // Listen for evolution_spike events
  useEffect(() => {
    const evolutionEvents = performanceState.recentEvents.filter(
      (e) => e.type === 'evolution_spike'
    )

    // Create bursts for new evolution events
    evolutionEvents.forEach((event) => {
      const os = event.os as ThemeId
      if (!os) return

      const burstId = `${event.timestamp}-${os}`

      // Only add if not already in bursts
      setBursts((prev) => {
        if (prev.some((b) => b.id === burstId)) return prev
        return [
          ...prev,
          {
            id: burstId,
            os,
            timestamp: event.timestamp,
          },
        ]
      })
    })

    // Clean up old bursts (older than 2s)
    const now = Date.now()
    setBursts((prev) => prev.filter((b) => now - b.timestamp < 2000))
  }, [performanceState.recentEvents])

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {bursts.map((burst) => (
          <ParticleBurst
            key={burst.id}
            os={burst.os}
            onComplete={() => {
              setBursts((prev) => prev.filter((b) => b.id !== burst.id))
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

/**
 * Individual particle burst
 */
interface ParticleBurstProps {
  os: ThemeId
  onComplete: () => void
}

function ParticleBurst({ os, onComplete }: ParticleBurstProps) {
  const position = PENTAGON_POSITIONS[os]
  const colour = OS_COLOURS[os]
  const particleCount = 8 + Math.floor(Math.random() * 5) // 8-12 particles

  // Generate particles with random angles
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    angle: (i / particleCount) * 360 + Math.random() * (360 / particleCount),
    distance: 60 + Math.random() * 40, // 60-100px
    size: 4 + Math.random() * 4, // 4-8px
    duration: 1 + Math.random(), // 1-2s
  }))

  return (
    <>
      {particles.map((particle) => (
        <Particle
          key={particle.id}
          position={position}
          colour={colour}
          angle={particle.angle}
          distance={particle.distance}
          size={particle.size}
          duration={particle.duration}
          onComplete={particle.id === 0 ? onComplete : undefined}
        />
      ))}
    </>
  )
}

/**
 * Individual particle
 */
interface ParticleProps {
  position: { x: number; y: number }
  colour: string
  angle: number
  distance: number
  size: number
  duration: number
  onComplete?: () => void
}

function Particle({
  position,
  colour,
  angle,
  distance,
  size,
  duration,
  onComplete,
}: ParticleProps) {
  const radians = (angle * Math.PI) / 180
  const offsetX = Math.cos(radians) * distance
  const offsetY = Math.sin(radians) * distance

  return (
    <motion.div
      initial={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        opacity: 1,
        scale: 1,
      }}
      animate={{
        left: `calc(${position.x}% + ${offsetX}px)`,
        top: `calc(${position.y}% + ${offsetY}px)`,
        opacity: 0,
        scale: 0.3,
      }}
      exit={{ opacity: 0 }}
      transition={{
        duration,
        ease: 'easeOut',
      }}
      onAnimationComplete={onComplete}
      style={{
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: colour,
        boxShadow: `0 0 ${size * 2}px ${colour}`,
        transform: 'translate(-50%, -50%)',
      }}
    />
  )
}
