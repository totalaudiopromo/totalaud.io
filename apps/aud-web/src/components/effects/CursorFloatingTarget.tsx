/**
 * Cursor Floating Target - motion.dev inspired
 *
 * Smooth magnetic cursor effect that follows the mouse.
 * Uses spring physics for natural, fluid motion.
 * GPU-accelerated with will-change and transform.
 *
 * Inspired by: https://examples.motion.dev/vue/cursor-floating-target
 */

'use client'

import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useRef } from 'react'

interface CursorFloatingTargetProps {
  children: React.ReactNode
  strength?: number // 0-1, how strongly the element is pulled towards cursor
  className?: string
}

export function CursorFloatingTarget({
  children,
  strength = 0.15,
  className = '',
}: CursorFloatingTargetProps) {
  const elementRef = useRef<HTMLDivElement>(null)

  // Motion values for smooth cursor tracking
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Spring configuration for smooth, natural motion
  const springConfig = { damping: 20, stiffness: 150 }
  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!elementRef.current) return

      const rect = elementRef.current.getBoundingClientRect()
      const centreX = rect.left + rect.width / 2
      const centreY = rect.top + rect.height / 2

      // Calculate distance from centre
      const deltaX = e.clientX - centreX
      const deltaY = e.clientY - centreY

      // Apply strength multiplier for subtle effect
      mouseX.set(deltaX * strength)
      mouseY.set(deltaY * strength)
    }

    const handleMouseLeave = () => {
      // Smoothly return to centre when mouse leaves
      mouseX.set(0)
      mouseY.set(0)
    }

    const element = elementRef.current
    if (element) {
      element.addEventListener('mousemove', handleMouseMove)
      element.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      if (element) {
        element.removeEventListener('mousemove', handleMouseMove)
        element.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [mouseX, mouseY, strength])

  return (
    <div ref={elementRef} className={`relative ${className}`}>
      <motion.div
        style={{
          x,
          y,
        }}
        className="will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  )
}
