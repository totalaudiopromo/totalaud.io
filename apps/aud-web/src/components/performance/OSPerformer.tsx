/**
 * OS Performer
 * Phase 16: Individual OS node with state-based animations
 */

'use client'

import { motion } from 'framer-motion'
import type { ThemeId } from '@totalaud/os-state/campaign'
import type { OSPerformanceState } from '@totalaud/performance'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'

/**
 * OS visual config
 */
const OS_CONFIGS: Record<
  ThemeId,
  {
    label: string
    colour: string
    fontFamily: string
    glowColour: string
  }
> = {
  ascii: {
    label: 'ASCII',
    colour: '#00ff00',
    fontFamily: 'monospace',
    glowColour: '#00ff00',
  },
  xp: {
    label: 'XP',
    colour: '#3478f6',
    fontFamily: 'sans-serif',
    glowColour: '#3478f6',
  },
  aqua: {
    label: 'Aqua',
    colour: '#00ccff',
    fontFamily: 'sans-serif',
    glowColour: '#00ccff',
  },
  daw: {
    label: 'DAW',
    colour: '#ff1aff',
    fontFamily: 'monospace',
    glowColour: '#ff1aff',
  },
  analogue: {
    label: 'Analogue',
    colour: '#ff8800',
    fontFamily: 'serif',
    glowColour: '#ff8800',
  },
}

interface OSPerformerProps {
  os: ThemeId
  state: OSPerformanceState
  position: { x: number; y: number }
}

export function OSPerformer({ os, state, position }: OSPerformerProps) {
  const config = OS_CONFIGS[os]

  // Determine animation state
  const getAnimationState = () => {
    if (state.isSpeaking) return 'speaking'
    if (state.isCharged) return 'charged'
    if (state.isThinking) return 'thinking'
    return 'idle'
  }

  const animationState = getAnimationState()

  // Animation variants
  const variants = {
    idle: {
      scale: 1.0,
      opacity: 0.8,
      boxShadow: `0 0 20px ${config.glowColour}40`,
    },
    thinking: {
      scale: [1.0, 1.1, 1.0],
      opacity: 0.9,
      boxShadow: `0 0 30px ${config.glowColour}60`,
      transition: {
        scale: {
          duration: 1,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      },
    },
    speaking: {
      scale: 1.15,
      opacity: 1,
      boxShadow: `0 0 60px ${config.glowColour}`,
      transition: {
        duration: 0.24,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    charged: {
      scale: [1.0, 1.2, 1.0],
      opacity: 1,
      boxShadow: [
        `0 0 40px ${config.glowColour}80`,
        `0 0 80px ${config.glowColour}`,
        `0 0 40px ${config.glowColour}80`,
      ],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }}
    >
      {/* OS Node */}
      <motion.div
        variants={variants}
        animate={animationState}
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          backgroundColor: config.colour,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: config.fontFamily,
          fontSize: '18px',
          fontWeight: 700,
          color: flowCoreColours.matteBlack,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {config.label}
      </motion.div>

      {/* Name Label */}
      <div
        style={{
          marginTop: '12px',
          textAlign: 'center',
          fontSize: '12px',
          fontWeight: 600,
          color: config.colour,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          textShadow: `0 0 10px ${config.glowColour}60`,
        }}
      >
        {config.label}
      </div>

      {/* Activity Indicator */}
      {state.activityLevel > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: state.activityLevel }}
          transition={{ duration: 0.24 }}
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: config.colour,
            boxShadow: `0 0 20px ${config.glowColour}`,
          }}
        />
      )}
    </div>
  )
}
