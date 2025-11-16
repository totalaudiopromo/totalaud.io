/**
 * Demo Cinematic Frame
 * Phase 13E: Hero Demo Mode
 *
 * Letterbox frame with parallax effects and glowing accents
 */

'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'

interface DemoCinematicFrameProps {
  children: React.ReactNode
  showLetterbox?: boolean
  glowColour?: string
}

export function DemoCinematicFrame({
  children,
  showLetterbox = true,
  glowColour = flowCoreColours.slateCyan,
}: DemoCinematicFrameProps) {
  const { scrollYProgress } = useScroll()

  // Parallax glow effect
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.15, 0.25, 0.15])
  const glowScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.1, 1])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: flowCoreColours.matteBlack,
      }}
    >
      {/* Animated Glow Background */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '150%',
          height: '150%',
          background: `radial-gradient(circle at 50% 50%, ${glowColour}20, transparent 70%)`,
          opacity: glowOpacity,
          scale: glowScale,
          pointerEvents: 'none',
        }}
      />

      {/* Main Content */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          zIndex: 10,
        }}
      >
        {children}
      </div>

      {/* Letterbox Bars */}
      {showLetterbox && (
        <>
          <motion.div
            initial={{ y: -60 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '60px',
              background: `linear-gradient(180deg, ${flowCoreColours.matteBlack} 0%, ${flowCoreColours.matteBlack}f0 100%)`,
              boxShadow: `0 2px 20px ${flowCoreColours.matteBlack}80`,
              zIndex: 100,
              pointerEvents: 'none',
            }}
          />
          <motion.div
            initial={{ y: 60 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '60px',
              background: `linear-gradient(0deg, ${flowCoreColours.matteBlack} 0%, ${flowCoreColours.matteBlack}f0 100%)`,
              boxShadow: `0 -2px 20px ${flowCoreColours.matteBlack}80`,
              zIndex: 100,
              pointerEvents: 'none',
            }}
          />
        </>
      )}

      {/* Corner Accents */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          width: '80px',
          height: '80px',
          border: `2px solid ${glowColour}`,
          borderRight: 'none',
          borderBottom: 'none',
          borderRadius: '8px 0 0 0',
          zIndex: 101,
          pointerEvents: 'none',
          boxShadow: `0 0 20px ${glowColour}40`,
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '80px',
          height: '80px',
          border: `2px solid ${glowColour}`,
          borderLeft: 'none',
          borderBottom: 'none',
          borderRadius: '0 8px 0 0',
          zIndex: 101,
          pointerEvents: 'none',
          boxShadow: `0 0 20px ${glowColour}40`,
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          width: '80px',
          height: '80px',
          border: `2px solid ${glowColour}`,
          borderRight: 'none',
          borderTop: 'none',
          borderRadius: '0 0 0 8px',
          zIndex: 101,
          pointerEvents: 'none',
          boxShadow: `0 0 20px ${glowColour}40`,
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          width: '80px',
          height: '80px',
          border: `2px solid ${glowColour}`,
          borderLeft: 'none',
          borderTop: 'none',
          borderRadius: '0 0 8px 0',
          zIndex: 101,
          pointerEvents: 'none',
          boxShadow: `0 0 20px ${glowColour}40`,
        }}
      />
    </div>
  )
}
