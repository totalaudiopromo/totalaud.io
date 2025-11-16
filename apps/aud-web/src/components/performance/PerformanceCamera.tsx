/**
 * Performance Camera
 * Phase 16: Global transform layer for cinematic camera effects
 */

'use client'

import { motion } from 'framer-motion'
import { usePerformance } from './PerformanceCanvas'

/**
 * Performance Camera wrapper
 */
export function PerformanceCamera({ children }: { children: React.ReactNode }) {
  const { performanceState, clockState } = usePerformance()
  const { energy } = performanceState.globalAtmosphere

  // Camera transform intensities (driven by energy)
  const orbitSpeed = 30 + energy * 20 // 30-50s per rotation
  const zoomRange = 1.0 + energy * 0.05 // 1.0-1.05 scale
  const tiltAmount = energy * 2 // 0-2 degrees

  return (
    <motion.div
      style={{
        position: 'absolute',
        inset: 0,
        transformStyle: 'preserve-3d',
      }}
      animate={{
        // Slow orbit rotation
        rotateZ: [0, 360],
        // Gentle scale pulsing
        scale: [1.0, zoomRange, 1.0],
        // Subtle perspective tilt
        rotateX: [0, tiltAmount, 0, -tiltAmount, 0],
      }}
      transition={{
        rotateZ: {
          duration: orbitSpeed,
          repeat: Infinity,
          ease: 'linear',
        },
        scale: {
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        },
        rotateX: {
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }}
    >
      {children}
    </motion.div>
  )
}
