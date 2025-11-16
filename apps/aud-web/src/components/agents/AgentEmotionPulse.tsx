/**
 * Agent Emotion Pulse - Phase 9
 * Visual mood indicator for agent emotional state
 */

'use client'

import { motion } from 'framer-motion'
import type { AgentType } from '@total-audio/timeline'

/**
 * Emotion Type
 */
export type AgentEmotion = 'active' | 'thinking' | 'success' | 'warning' | 'error' | 'idle'

/**
 * Agent Emotion Pulse Props
 */
export interface AgentEmotionPulseProps {
  agentType: AgentType
  emotion: AgentEmotion
  size?: number
  showLabel?: boolean
}

/**
 * Agent Emotion Pulse Component
 */
export function AgentEmotionPulse({
  agentType,
  emotion,
  size = 48,
  showLabel = false,
}: AgentEmotionPulseProps) {
  const emotionColours: Record<AgentEmotion, string> = {
    active: '#3AA9BE',
    thinking: '#FF9800',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    idle: '#606060',
  }

  const agentIcons: Record<AgentType, string> = {
    scout: '🔍',
    coach: '💡',
    tracker: '📊',
    insight: '🧠',
  }

  const emotionLabels: Record<AgentEmotion, string> = {
    active: 'working',
    thinking: 'analysing',
    success: 'completed',
    warning: 'attention needed',
    error: 'failed',
    idle: 'waiting',
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'centre',
        gap: '8px',
      }}
    >
      <motion.div
        animate={{
          scale: emotion === 'active' || emotion === 'thinking' ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: emotion === 'thinking' ? 0.8 : 1.2,
          repeat: emotion === 'active' || emotion === 'thinking' ? Infinity : 0,
          ease: 'easeInOut',
        }}
        style={{
          position: 'relative',
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'centre',
          justifyContent: 'centre',
        }}
      >
        {/* Outer glow */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            backgroundColor: emotionColours[emotion],
          }}
        />

        {/* Main circle */}
        <div
          style={{
            position: 'relative',
            width: size * 0.8,
            height: size * 0.8,
            borderRadius: '50%',
            backgroundColor: `${emotionColours[emotion]}30`,
            border: `2px solid ${emotionColours[emotion]}`,
            display: 'flex',
            alignItems: 'centre',
            justifyContent: 'centre',
            fontSize: size * 0.4,
          }}
        >
          {agentIcons[agentType]}
        </div>
      </motion.div>

      {showLabel && (
        <div
          style={{
            textAlign: 'centre',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: emotionColours[emotion],
              textTransform: 'uppercase',
            }}
          >
            {agentType}
          </div>
          <div
            style={{
              fontSize: '10px',
              color: '#808080',
            }}
          >
            {emotionLabels[emotion]}
          </div>
        </div>
      )}
    </div>
  )
}
