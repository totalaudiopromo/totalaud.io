'use client'

/**
 * Agent Emotion Pulse
 * Animated emotion indicators for analogue story cards
 */

import { motion } from 'framer-motion'
import type { CardType } from '@totalaud/os-state/campaign'
import {
  Heart,
  HelpCircle,
  Award,
  AlertTriangle,
  Eye,
  Sparkles,
  Frown,
  Lightbulb,
  Cloud,
} from 'lucide-react'

interface AgentEmotionPulseProps {
  emotion: CardType
  size?: 'sm' | 'md' | 'lg'
  intensity?: 'low' | 'medium' | 'high'
  showLabel?: boolean
  className?: string
}

const EMOTION_COLOURS: Record<CardType, string> = {
  hope: '#51CF66', // Green
  doubt: '#94A3B8', // Grey
  pride: '#8B5CF6', // Purple
  fear: '#EF4444', // Red
  clarity: '#3AA9BE', // Cyan
  excitement: '#F59E0B', // Amber
  frustration: '#FF5252', // Dark red
  breakthrough: '#10B981', // Emerald
  uncertainty: '#6B7280', // Cool grey
}

const EMOTION_ICONS: Record<CardType, React.ComponentType<{ size?: number }>> = {
  hope: Heart,
  doubt: HelpCircle,
  pride: Award,
  fear: AlertTriangle,
  clarity: Eye,
  excitement: Sparkles,
  frustration: Frown,
  breakthrough: Lightbulb,
  uncertainty: Cloud,
}

const SIZE_MAP = {
  sm: { icon: 16, container: 'h-8 w-8', pulse: 'h-6 w-6', label: 'text-xs' },
  md: { icon: 20, container: 'h-12 w-12', pulse: 'h-10 w-10', label: 'text-sm' },
  lg: { icon: 24, container: 'h-16 w-16', pulse: 'h-14 w-14', label: 'text-base' },
}

export function AgentEmotionPulse({
  emotion,
  size = 'md',
  intensity = 'medium',
  showLabel = false,
  className = '',
}: AgentEmotionPulseProps) {
  const colour = EMOTION_COLOURS[emotion]
  const Icon = EMOTION_ICONS[emotion]
  const sizing = SIZE_MAP[size]

  // Different animation patterns for different emotions
  const animationConfig = getAnimationConfig(emotion, intensity)

  return (
    <div className={`flex flex-col items-centre gap-2 ${className}`}>
      {/* Pulse Container */}
      <div className={`relative flex items-centre justify-centre ${sizing.container}`}>
        {/* Background Pulse Rings */}
        {animationConfig.pulseRings.map((ring, index) => (
          <motion.div
            key={index}
            className={`absolute ${sizing.pulse} rounded-full`}
            style={{
              backgroundColor: `${colour}${ring.opacity}`,
            }}
            animate={{
              scale: ring.scale,
              opacity: ring.fadePattern,
            }}
            transition={{
              duration: ring.duration,
              repeat: Infinity,
              ease: ring.ease,
              delay: ring.delay,
            }}
          />
        ))}

        {/* Icon */}
        <motion.div
          className="relative z-10 flex items-centre justify-centre"
          style={{ color: colour }}
          animate={animationConfig.iconAnimation}
          transition={{
            duration: animationConfig.iconDuration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Icon size={sizing.icon} />
        </motion.div>
      </div>

      {/* Label */}
      {showLabel && (
        <motion.span
          className={`font-mono font-semibold uppercase tracking-wide ${sizing.label}`}
          style={{ color: colour }}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
        >
          {emotion}
        </motion.span>
      )}
    </div>
  )
}

/**
 * Get animation configuration for each emotion type
 */
function getAnimationConfig(
  emotion: CardType,
  intensity: 'low' | 'medium' | 'high'
): {
  pulseRings: Array<{
    scale: number[]
    opacity: string
    fadePattern: number[]
    duration: number
    ease: string
    delay: number
  }>
  iconAnimation: Record<string, number[]>
  iconDuration: number
} {
  // Intensity multiplier
  const intensityMap = { low: 0.6, medium: 1, high: 1.4 }
  const multiplier = intensityMap[intensity]

  switch (emotion) {
    case 'excitement':
      // Fast, energetic pulse
      return {
        pulseRings: [
          {
            scale: [1, 2.2 * multiplier],
            opacity: '30',
            fadePattern: [0.8, 0],
            duration: 0.8,
            ease: 'easeOut',
            delay: 0,
          },
          {
            scale: [1, 1.8 * multiplier],
            opacity: '20',
            fadePattern: [0.6, 0],
            duration: 1.2,
            ease: 'easeOut',
            delay: 0.3,
          },
        ],
        iconAnimation: { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] },
        iconDuration: 0.6,
      }

    case 'breakthrough':
      // Bright flash effect
      return {
        pulseRings: [
          {
            scale: [1, 2.5 * multiplier],
            opacity: '40',
            fadePattern: [1, 0],
            duration: 1.2,
            ease: 'easeOut',
            delay: 0,
          },
          {
            scale: [1, 3 * multiplier],
            opacity: '20',
            fadePattern: [0.8, 0],
            duration: 1.5,
            ease: 'easeOut',
            delay: 0.2,
          },
        ],
        iconAnimation: { scale: [1, 1.3, 1], opacity: [1, 0.8, 1] },
        iconDuration: 1.2,
      }

    case 'clarity':
      // Steady, calm pulse
      return {
        pulseRings: [
          {
            scale: [1, 1.6 * multiplier],
            opacity: '25',
            fadePattern: [0.7, 0],
            duration: 2,
            ease: 'easeInOut',
            delay: 0,
          },
        ],
        iconAnimation: { scale: [1, 1.08, 1] },
        iconDuration: 2,
      }

    case 'doubt':
    case 'uncertainty':
      // Slow, hesitant fade
      return {
        pulseRings: [
          {
            scale: [1, 1.4 * multiplier],
            opacity: '20',
            fadePattern: [0.5, 0.2, 0.5],
            duration: 3,
            ease: 'easeInOut',
            delay: 0,
          },
        ],
        iconAnimation: { opacity: [1, 0.6, 1], x: [-2, 2, -2, 0] },
        iconDuration: 2.5,
      }

    case 'fear':
    case 'frustration':
      // Sharp, erratic pulse
      return {
        pulseRings: [
          {
            scale: [1, 1.8 * multiplier],
            opacity: '35',
            fadePattern: [0.9, 0],
            duration: 0.6,
            ease: 'easeOut',
            delay: 0,
          },
          {
            scale: [1, 1.5 * multiplier],
            opacity: '25',
            fadePattern: [0.7, 0],
            duration: 0.9,
            ease: 'easeOut',
            delay: 0.15,
          },
        ],
        iconAnimation: { scale: [1, 1.1, 1], rotate: [-3, 3, -3, 0] },
        iconDuration: 0.8,
      }

    case 'pride':
      // Confident, strong pulse
      return {
        pulseRings: [
          {
            scale: [1, 1.9 * multiplier],
            opacity: '30',
            fadePattern: [0.8, 0],
            duration: 1.5,
            ease: 'easeOut',
            delay: 0,
          },
        ],
        iconAnimation: { scale: [1, 1.2, 1], y: [0, -2, 0] },
        iconDuration: 1.5,
      }

    case 'hope':
      // Warm, gentle pulse
      return {
        pulseRings: [
          {
            scale: [1, 1.7 * multiplier],
            opacity: '28',
            fadePattern: [0.75, 0],
            duration: 2.5,
            ease: 'easeInOut',
            delay: 0,
          },
          {
            scale: [1, 2 * multiplier],
            opacity: '18',
            fadePattern: [0.6, 0],
            duration: 3,
            ease: 'easeInOut',
            delay: 0.5,
          },
        ],
        iconAnimation: { scale: [1, 1.1, 1] },
        iconDuration: 2.5,
      }

    default:
      // Default pulse
      return {
        pulseRings: [
          {
            scale: [1, 1.6 * multiplier],
            opacity: '25',
            fadePattern: [0.7, 0],
            duration: 2,
            ease: 'easeInOut',
            delay: 0,
          },
        ],
        iconAnimation: { scale: [1, 1.1, 1] },
        iconDuration: 2,
      }
  }
}

/**
 * Multi-emotion display for showing multiple emotions at once
 */
export function AgentEmotionCluster({
  emotions,
  size = 'sm',
}: {
  emotions: CardType[]
  size?: 'sm' | 'md' | 'lg'
}) {
  return (
    <div className="flex items-centre gap-2">
      {emotions.slice(0, 5).map((emotion, index) => (
        <AgentEmotionPulse key={index} emotion={emotion} size={size} intensity="low" />
      ))}
      {emotions.length > 5 && (
        <span className="font-mono text-xs text-[var(--flowcore-colour-fg)]/50">
          +{emotions.length - 5}
        </span>
      )}
    </div>
  )
}
