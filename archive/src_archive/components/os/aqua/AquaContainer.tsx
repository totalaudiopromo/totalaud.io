'use client'

import React, { useCallback } from 'react'
import { motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { useOptionalAmbient } from '@/components/ambient/useAmbient'
import { useOptionalMood } from '@/components/mood/useMood'
import { useOptionalPersona } from '@/components/persona/usePersona'
import { useOptionalCompanion } from '@/components/companion/useCompanion'

interface AquaContainerProps {
  children: React.ReactNode
}

/**
 * AquaContainer
 * Full-screen cinematic glass workspace with depth and parallax
 */
export function AquaContainer({ children }: AquaContainerProps) {
  const prefersReducedMotion = useReducedMotion()
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const ambient = useOptionalAmbient()
  const mood = useOptionalMood()
  const persona = useOptionalPersona()
  const companion = useOptionalCompanion()

  const parallaxX = useTransform(mouseX, [-200, 200], [12, -12])
  const parallaxY = useTransform(mouseY, [-200, 200], [8, -8])

  const haloScale = ambient?.scale(1) ?? 0
  const moodBoost =
    mood?.mood === 'charged'
      ? 0.15
      : mood?.mood === 'chaotic'
        ? 0.2
        : mood?.mood === 'idle'
          ? -0.15
          : 0
  const haloOpacityBase = 0.35 + haloScale * 0.35 + moodBoost
  const haloOpacity = Math.max(0.18, Math.min(0.7, haloOpacityBase))

  const personaAccent = persona?.persona?.aesthetic?.accent ?? null
  const companionAccent = companion?.activeCompanion?.accent ?? null
  const haloColor = companionAccent ?? personaAccent ?? 'rgba(56,189,248,0.7)'

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReducedMotion) return
      const rect = event.currentTarget.getBoundingClientRect()
      const x = event.clientX - (rect.left + rect.width / 2)
      const y = event.clientY - (rect.top + rect.height / 2)
      mouseX.set(x)
      mouseY.set(y)
    },
    [mouseX, mouseY, prefersReducedMotion]
  )

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-sky-50"
      onMouseMove={handleMouseMove}
    >
      {/* Background gradients */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at top, ${haloColor}, transparent 60%), radial-gradient(circle at bottom, rgba(45,212,191,0.3), transparent 55%)`,
        }}
      />

      {/* Soft animated cyan blob */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-40"
        style={{
          opacity: haloOpacity,
          background: `radial-gradient(circle at 10% 20%, ${haloColor}b3, transparent 55%)`,
          filter: 'blur(40px)',
        }}
        animate={
          prefersReducedMotion
            ? undefined
            : {
                x: [-40, 40, -40],
                y: [-20, 20, -20],
              }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : {
                duration: 24,
                repeat: Infinity,
                ease: 'easeInOut',
              }
        }
      />

      {/* Depth blur layers */}
      <div className="pointer-events-none absolute inset-0 backdrop-blur-md" />
      <div
        className="pointer-events-none absolute inset-0 backdrop-blur-2xl"
        style={{
          mixBlendMode: 'screen',
          opacity: 0.18,
          boxShadow: '0 0 120px rgba(56,189,248,0.25)',
        }}
      />

      {/* Foreground content with parallax */}
      <motion.div
        className="relative z-10 flex min-h-screen items-center justify-center px-4 pb-24 pt-16"
        style={prefersReducedMotion ? undefined : { x: parallaxX, y: parallaxY }}
        transition={
          prefersReducedMotion
            ? undefined
            : {
                type: 'spring',
                stiffness: 60,
                damping: 20,
                mass: 0.8,
              }
        }
      >
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10">{children}</div>
      </motion.div>
    </div>
  )
}
