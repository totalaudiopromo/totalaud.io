/**
 * Agent Activity Bar - Phase 9
 * Compact horizontal bar showing active agent executions
 */

'use client'

import { motion } from 'framer-motion'
import type { AgentType } from '@total-audio/timeline'

/**
 * Active Agent Execution
 */
interface ActiveExecution {
  agentType: AgentType
  clipId: string
  title: string
  progress: number // 0-100
  colour: string
}

/**
 * Agent Activity Bar Props
 */
export interface AgentActivityBarProps {
  executions?: ActiveExecution[]
  osTheme?: 'ascii' | 'xp' | 'aqua' | 'daw' | 'analogue'
}

/**
 * Agent Activity Bar Component
 */
export function AgentActivityBar({ executions = [], osTheme = 'daw' }: AgentActivityBarProps) {
  if (executions.length === 0) {
    return null
  }

  const agentColours: Record<AgentType, string> = {
    scout: '#4CAF50',
    coach: '#FF9800',
    tracker: '#9C27B0',
    insight: '#2196F3',
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        padding: '8px 12px',
        backgroundColor: '#16181A',
        borderRadius: '8px',
        border: '1px solid #2A2D30',
        overflow: 'hidden',
      }}
    >
      {executions.map((exec) => (
        <motion.div
          key={exec.clipId}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 'auto', opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.24 }}
          style={{
            display: 'flex',
            alignItems: 'centre',
            gap: '8px',
            padding: '6px 12px',
            backgroundColor: `${agentColours[exec.agentType]}15`,
            border: `1px solid ${agentColours[exec.agentType]}`,
            borderRadius: '6px',
          }}
        >
          {/* Agent indicator pulse */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: agentColours[exec.agentType],
            }}
          />

          {/* Agent info */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              minWidth: '120px',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: agentColours[exec.agentType],
                textTransform: 'uppercase',
              }}
            >
              {exec.agentType}
            </span>
            <span
              style={{
                fontSize: '10px',
                color: '#808080',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {exec.title}
            </span>
          </div>

          {/* Progress bar */}
          <div
            style={{
              width: '60px',
              height: '4px',
              backgroundColor: '#2A2D30',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${exec.progress}%` }}
              transition={{ duration: 0.4 }}
              style={{
                height: '100%',
                backgroundColor: agentColours[exec.agentType],
              }}
            />
          </div>

          {/* Progress percentage */}
          <span
            style={{
              fontSize: '10px',
              color: '#808080',
              fontFamily: 'monospace',
              minWidth: '35px',
            }}
          >
            {exec.progress}%
          </span>
        </motion.div>
      ))}
    </div>
  )
}
