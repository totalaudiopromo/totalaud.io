/**
 * Warm Parallax Lighting Component
 *
 * Slow-moving warm lighting effect for Analogue Studio
 * Creates a cozy, reflective atmosphere with amber/orange tones
 */

'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface WarmParallaxLightingProps {
  intensity?: number
  speed?: number
}

export function WarmParallaxLighting({ intensity = 0.25, speed = 0.8 }: WarmParallaxLightingProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2 // -1 to 1
      const y = (e.clientY / window.innerHeight - 0.5) * 2 // -1 to 1
      setMousePosition({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Far layer - warm orange */}
      <motion.div
        className="absolute inset-0"
        animate={{
          x: mousePosition.x * 15,
          y: mousePosition.y * 15,
        }}
        transition={{ type: 'spring', stiffness: 30, damping: 25 }}
      >
        <div
          className="absolute top-1/4 right-1/3 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, rgba(245, 158, 11, ${intensity * 0.4}) 0%, transparent 70%)`,
          }}
        />
        <div
          className="absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, rgba(251, 146, 60, ${intensity * 0.3}) 0%, transparent 70%)`,
          }}
        />
      </motion.div>

      {/* Mid layer - amber */}
      <motion.div
        className="absolute inset-0"
        animate={{
          x: mousePosition.x * 25,
          y: mousePosition.y * 25,
        }}
        transition={{ type: 'spring', stiffness: 40, damping: 30 }}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-2xl"
          style={{
            background: `radial-gradient(circle, rgba(217, 119, 6, ${intensity * 0.5}) 0%, transparent 70%)`,
          }}
        />
      </motion.div>

      {/* Near layer - soft peach */}
      <motion.div
        className="absolute inset-0"
        animate={{
          x: mousePosition.x * 35,
          y: mousePosition.y * 35,
        }}
        transition={{ type: 'spring', stiffness: 50, damping: 35 }}
      >
        <div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full blur-xl"
          style={{
            background: `radial-gradient(circle, rgba(253, 186, 116, ${intensity * 0.6}) 0%, transparent 70%)`,
          }}
        />
      </motion.div>

      {/* Subtle vignette for warmth */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 0%, rgba(120, 53, 15, ${intensity * 0.1}) 100%)`,
        }}
      />
    </div>
  )
}
