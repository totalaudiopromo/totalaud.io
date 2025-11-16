'use client'

/**
 * Agent Activity Bar
 * Real-time status indicators for all agents
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { agentStateManager } from '@totalaud/agents/runtime'
import type { AgentExecutionState, AgentStatus } from '@totalaud/agents/runtime'
import { Activity, AlertCircle, Clock, CheckCircle2 } from 'lucide-react'

interface AgentActivityBarProps {
  className?: string
  showLabels?: boolean
}

const AGENT_COLOURS: Record<string, string> = {
  scout: '#51CF66',
  coach: '#8B5CF6',
  tracker: '#3AA9BE',
  insight: '#F59E0B',
}

const STATUS_ICONS: Record<AgentStatus, React.ComponentType<{ size?: number }>> = {
  idle: CheckCircle2,
  running: Activity,
  waiting: Clock,
  error: AlertCircle,
}

export function AgentActivityBar({ className = '', showLabels = true }: AgentActivityBarProps) {
  const [agentStates, setAgentStates] = useState<AgentExecutionState[]>([])

  // Poll agent states every 500ms
  useEffect(() => {
    const updateStates = () => {
      const states = agentStateManager.getAllStates()
      setAgentStates(states)
    }

    // Initial update
    updateStates()

    // Poll for updates
    const interval = setInterval(updateStates, 500)

    return () => clearInterval(interval)
  }, [])

  // Ensure we always have 4 agents (even if not registered yet)
  const allAgents = ['scout', 'coach', 'tracker', 'insight']
  const agentMap = new Map(agentStates.map((state) => [state.agentName, state]))

  const displayStates: AgentExecutionState[] = allAgents.map((agentName) => {
    const existing = agentMap.get(agentName)
    return (
      existing || {
        agentName,
        status: 'idle' as AgentStatus,
      }
    )
  })

  return (
    <div
      className={`flex items-centre gap-2 rounded-lg border border-[var(--flowcore-colour-border)] bg-[var(--flowcore-colour-bg)] p-2 ${className}`}
    >
      {showLabels && (
        <span className="mr-1 font-mono text-xs font-semibold uppercase tracking-wide text-[var(--flowcore-colour-fg)]/70">
          Agents:
        </span>
      )}

      {displayStates.map((state) => (
        <AgentStatusBadge key={state.agentName} state={state} />
      ))}
    </div>
  )
}

function AgentStatusBadge({ state }: { state: AgentExecutionState }) {
  const colour = AGENT_COLOURS[state.agentName] || '#6B7280'
  const StatusIcon = STATUS_ICONS[state.status]

  const isActive = state.status === 'running'
  const isError = state.status === 'error'

  return (
    <motion.div
      className="relative flex items-centre gap-1.5 rounded-md px-2 py-1 transition-colours"
      style={{
        backgroundColor: `${colour}15`,
        borderLeft: `3px solid ${colour}`,
      }}
      animate={
        isActive
          ? {
              opacity: [1, 0.7, 1],
              scale: [1, 1.05, 1],
            }
          : {}
      }
      transition={{
        duration: isActive ? 1.2 : 0.24,
        repeat: isActive ? Infinity : 0,
        ease: [0.22, 1, 0.36, 1],
      }}
      title={getTooltipText(state)}
    >
      {/* Status Icon */}
      <motion.div
        style={{ color: isError ? '#EF4444' : colour }}
        animate={isActive ? { rotate: 360 } : {}}
        transition={{
          duration: isActive ? 2 : 0,
          repeat: isActive ? Infinity : 0,
          ease: 'linear',
        }}
      >
        <StatusIcon size={14} />
      </motion.div>

      {/* Agent Name */}
      <span
        className="font-mono text-xs font-semibold uppercase"
        style={{ color: isError ? '#EF4444' : colour }}
      >
        {state.agentName.slice(0, 3)}
      </span>

      {/* Active Pulse Indicator */}
      {isActive && (
        <motion.div
          className="absolute -right-1 -top-1 h-2 w-2 rounded-full"
          style={{ backgroundColor: colour }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Error Indicator */}
      {isError && (
        <motion.div
          className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#EF4444]"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.div>
  )
}

function getTooltipText(state: AgentExecutionState): string {
  const agentName = state.agentName.charAt(0).toUpperCase() + state.agentName.slice(1)

  switch (state.status) {
    case 'idle':
      return `${agentName} is idle`

    case 'running':
      return state.currentClipId
        ? `${agentName} is executing clip ${state.currentClipId.slice(0, 8)}...`
        : `${agentName} is running`

    case 'waiting':
      return `${agentName} is waiting in queue`

    case 'error':
      return state.error ? `${agentName} error: ${state.error}` : `${agentName} encountered an error`

    default:
      return agentName
  }
}
