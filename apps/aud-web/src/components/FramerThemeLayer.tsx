/**
 * Framer Theme Layer Component
 *
 * Phase 9.5: Theme Cohesion Layer
 * Provides shared motion layers and ambient effects
 * that create cinematic consistency across all themes.
 */

'use client'

import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'
import { useEffect, useState, type ReactNode } from 'react'
import { extendedMotionTokens } from '@/tokens/motion'
import type { OSTheme } from '@/components/themes/types'

interface FramerThemeLayerProps {
  theme: OSTheme
  children: ReactNode
  enableParallax?: boolean // Map, Timeline
  enableAmbientGlow?: boolean // Guide, Map
  enableVelocityBlur?: boolean // Map, Timeline
  calmMode?: boolean
}

/**
 * Wraps content with theme-appropriate motion layers
 *
 * Features:
 * - Ambient parallax background (Map, Timeline)
 * - Light sweep animation (Guide headers)
 * - Velocity-based blur (Map, Timeline scrolling)
 * - Respects Calm Mode and reduced motion
 */
export function FramerThemeLayer({
  theme,
  children,
  enableParallax = false,
  enableAmbientGlow = false,
  enableVelocityBlur = false,
  calmMode = false,
}: FramerThemeLayerProps) {
  const { scrollY } = useScroll()
  const [isClient, setIsClient] = useState(false)

  // Parallax transform (for background elements)
  const parallaxY = useTransform(
    scrollY,
    [0, 1000],
    [0, calmMode ? 10 : extendedMotionTokens.parallaxRange.max]
  )

  // Smooth spring for parallax
  const smoothParallaxY = useSpring(parallaxY, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  // Ambient glow opacity (cycles 0 → 15% → 0)
  const [glowPhase, setGlowPhase] = useState(0)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!enableAmbientGlow || calmMode) return

    const interval = setInterval(() => {
      setGlowPhase((prev) => (prev + 1) % 100)
    }, extendedMotionTokens.longDrift * 10)

    return () => clearInterval(interval)
  }, [enableAmbientGlow, calmMode])

  const glowOpacity = Math.sin((glowPhase / 100) * Math.PI * 2) * 0.075 + 0.075

  // Velocity blur (for scrolling panes)
  const velocityY = useMotionValue(0)

  useEffect(() => {
    if (!enableVelocityBlur || !isClient) return

    let lastScrollY = scrollY.get()
    const unsubscribe = scrollY.on('change', (latest) => {
      const velocity = Math.abs(latest - lastScrollY)
      velocityY.set(velocity)
      lastScrollY = latest
    })

    return unsubscribe
  }, [scrollY, velocityY, enableVelocityBlur, isClient])

  const blurAmount = useTransform(
    velocityY,
    [0, extendedMotionTokens.velocityBlurThreshold],
    [0, calmMode ? 2 : 8]
  )

  // Don't render motion layers on server
  if (!isClient) {
    return <>{children}</>
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Parallax Background Layer (Map, Timeline) */}
      {enableParallax && (
        <motion.div
          style={{
            y: smoothParallaxY,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '120%',
            zIndex: 0,
            pointerEvents: 'none',
          }}
          className="parallax-layer"
        >
          {/* Subtle grid pattern */}
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundImage:
                theme === 'map'
                  ? 'radial-gradient(circle at 30% 20%, rgba(0,122,255,0.03) 0%, transparent 50%)'
                  : 'repeating-linear-gradient(90deg, rgba(255,107,53,0.02) 0px, rgba(255,107,53,0.02) 2px, transparent 2px, transparent 8px)',
              opacity: calmMode ? 0.3 : 1,
            }}
          />
        </motion.div>
      )}

      {/* Ambient Glow Layer (Guide, Map) */}
      {enableAmbientGlow && (
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            zIndex: 1,
            pointerEvents: 'none',
            background:
              theme === 'guide'
                ? 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
                : 'radial-gradient(circle at 30% 20%, rgba(0,122,255,0.05) 0%, transparent 50%)',
            opacity: glowOpacity,
          }}
          className="ambient-glow-layer"
        />
      )}

      {/* Content Layer */}
      <motion.div
        style={{
          position: 'relative',
          zIndex: 2,
          filter: enableVelocityBlur ? `blur(${blurAmount}px)` : undefined,
        }}
        className="content-layer"
      >
        {children}
      </motion.div>
    </div>
  )
}

/**
 * Light Sweep Effect
 * Creates a subtle gradient sweep across headers (Guide theme)
 */
export function LightSweep({
  children,
  duration = 6,
  calmMode = false,
}: {
  children: ReactNode
  duration?: number
  calmMode?: boolean
}) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient || calmMode) {
    return <>{children}</>
  }

  return (
    <motion.div
      className="relative overflow-hidden"
      style={{ isolation: 'isolate' }}
    >
      {children}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '200%',
          height: '100%',
          background:
            'linear-gradient(90deg, transparent 0%, rgba(58,169,190,0.1) 50%, transparent 100%)',
          pointerEvents: 'none',
        }}
        animate={{
          x: ['0%', '100%'],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </motion.div>
  )
}

/**
 * Magnetic CTA
 * Subtle cursor pull effect for primary action buttons
 */
export function MagneticCTA({
  children,
  className = '',
  onClick,
  disabled = false,
  calmMode = false,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  calmMode?: boolean
}) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springConfig = { stiffness: 150, damping: 20 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (calmMode || disabled) return

    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const deltaX = e.clientX - centerX
    const deltaY = e.clientY - centerY

    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2)
    const maxDistance = 100 // px

    if (distance < maxDistance) {
      const strength = 1 - distance / maxDistance
      const offsetX = (deltaX / maxDistance) * extendedMotionTokens.magneticRange * strength
      const offsetY = (deltaY / maxDistance) * extendedMotionTokens.magneticRange * strength

      x.set(offsetX)
      y.set(offsetY)
    }
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      style={{
        x: calmMode ? 0 : springX,
        y: calmMode ? 0 : springY,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.div>
  )
}
