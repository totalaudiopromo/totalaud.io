'use client'

/**
 * Agent OS Display
 * OS personality-specific visualisations of agent activity
 */

import { useCampaignStore } from '@/stores/campaign'
import type { ThemeId } from '@totalaud/os-state/campaign'
import { AgentActivityBar } from './AgentActivityBar'
import { AgentEmotionPulse, AgentEmotionCluster } from './AgentEmotionPulse'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { agentStateManager } from '@totalaud/agents/runtime'
import type { AgentExecutionState } from '@totalaud/agents/runtime'

interface AgentOSDisplayProps {
  variant?: 'bar' | 'widget' | 'minimal'
  className?: string
}

export function AgentOSDisplay({ variant = 'bar', className = '' }: AgentOSDisplayProps) {
  const currentTheme = useCampaignStore((state) => state.meta.currentTheme)
  const [agentStates, setAgentStates] = useState<AgentExecutionState[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      setAgentStates(agentStateManager.getAllStates())
    }, 500)

    return () => clearInterval(interval)
  }, [])

  switch (currentTheme) {
    case 'ascii':
      return <ASCIIAgentDisplay states={agentStates} className={className} />

    case 'xp':
      return <XPAgentDisplay states={agentStates} className={className} />

    case 'aqua':
      return <AquaAgentDisplay states={agentStates} className={className} />

    case 'daw':
      return <DAWAgentDisplay states={agentStates} className={className} />

    case 'analogue':
      return <AnalogueAgentDisplay states={agentStates} className={className} />

    default:
      return <AgentActivityBar className={className} />
  }
}

/**
 * ASCII Theme - Terminal-style agent display
 */
function ASCIIAgentDisplay({
  states,
  className,
}: {
  states: AgentExecutionState[]
  className: string
}) {
  const activeAgents = states.filter((s) => s.status === 'running')

  return (
    <div
      className={`font-mono text-sm text-[var(--flowcore-colour-fg)] ${className}`}
      style={{
        fontFamily: 'monospace',
        letterSpacing: '0.05em',
      }}
    >
      <div className="flex items-centre gap-4">
        <span className="text-[var(--flowcore-colour-accent)]">&gt;</span>
        <span className="uppercase">agents:</span>
        {states.map((state) => (
          <span key={state.agentName} className="flex items-centre gap-1">
            <span
              className={
                state.status === 'running'
                  ? 'text-[#51CF66]'
                  : state.status === 'error'
                    ? 'text-[#EF4444]'
                    : 'text-[var(--flowcore-colour-fg)]/50'
              }
            >
              [{state.agentName.slice(0, 3).toUpperCase()}]
            </span>
            {state.status === 'running' && (
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                ●
              </motion.span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}

/**
 * Windows XP Theme - Friendly, nostalgic agent display
 */
function XPAgentDisplay({
  states,
  className,
}: {
  states: AgentExecutionState[]
  className: string
}) {
  return (
    <motion.div
      className={`rounded border border-[#3A6EA5] bg-gradient-to-b from-[#3A6EA5] to-[#245EDC] p-2 shadow-lg ${className}`}
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, type: 'spring', bounce: 0.4 }}
    >
      <div className="flex items-centre gap-2">
        <span className="font-sans text-xs font-bold text-white drop-shadow">
          🤖 Agent Activity
        </span>
        <div className="flex gap-1">
          {states.map((state) => (
            <motion.div
              key={state.agentName}
              className={`h-3 w-3 rounded-sm ${
                state.status === 'running'
                  ? 'bg-[#51CF66]'
                  : state.status === 'error'
                    ? 'bg-[#EF4444]'
                    : 'bg-white/30'
              }`}
              whileHover={{ scale: 1.2 }}
              animate={state.status === 'running' ? { opacity: [1, 0.6, 1] } : {}}
              transition={{ duration: 0.8, repeat: state.status === 'running' ? Infinity : 0 }}
              title={state.agentName}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Mac OS Aqua Theme - Glassy, elegant agent display
 */
function AquaAgentDisplay({
  states,
  className,
}: {
  states: AgentExecutionState[]
  className: string
}) {
  return (
    <motion.div
      className={`rounded-xl border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur-xl ${className}`}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-centre gap-3">
        <div className="flex items-centre gap-1">
          {states.map((state) => (
            <motion.div
              key={state.agentName}
              className="flex h-8 w-8 items-centre justify-centre rounded-full bg-white/20 font-mono text-xs font-semibold uppercase backdrop-blur-sm"
              style={{
                color:
                  state.status === 'running'
                    ? '#3AA9BE'
                    : state.status === 'error'
                      ? '#EF4444'
                      : 'rgba(255,255,255,0.5)',
                boxShadow:
                  state.status === 'running'
                    ? '0 0 20px rgba(58, 169, 190, 0.5)'
                    : state.status === 'error'
                      ? '0 0 20px rgba(239, 68, 68, 0.5)'
                      : 'none',
              }}
              whileHover={{ scale: 1.1 }}
              animate={state.status === 'running' ? { y: [0, -2, 0] } : {}}
              transition={{ duration: 1.5, repeat: state.status === 'running' ? Infinity : 0 }}
              title={state.agentName}
            >
              {state.agentName.slice(0, 1).toUpperCase()}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/**
 * DAW Theme - Technical, tempo-synced agent display
 */
function DAWAgentDisplay({
  states,
  className,
}: {
  states: AgentExecutionState[]
  className: string
}) {
  // 120 BPM = 0.5s per beat
  const beatDuration = 0.5

  return (
    <div
      className={`flex items-centre gap-2 border-l-4 border-[var(--flowcore-colour-accent)] bg-[#0A0A0A] p-2 font-mono ${className}`}
    >
      <div className="flex items-centre gap-1">
        {/* BPM Indicator */}
        <motion.div
          className="h-2 w-2 rounded-full bg-[var(--flowcore-colour-accent)]"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: beatDuration, repeat: Infinity }}
        />
        <span className="text-xs text-[var(--flowcore-colour-fg)]/70">120 BPM</span>
      </div>

      <div className="mx-2 h-4 w-px bg-[var(--flowcore-colour-border)]" />

      <div className="flex gap-2">
        {states.map((state, index) => (
          <motion.div
            key={state.agentName}
            className="flex items-centre gap-1.5"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <motion.div
              className={`h-3 w-1 ${
                state.status === 'running'
                  ? 'bg-[#51CF66]'
                  : state.status === 'error'
                    ? 'bg-[#EF4444]'
                    : 'bg-[var(--flowcore-colour-fg)]/20'
              }`}
              animate={
                state.status === 'running'
                  ? {
                      height: ['12px', '20px', '12px'],
                      opacity: [1, 0.7, 1],
                    }
                  : {}
              }
              transition={{
                duration: beatDuration * 2,
                repeat: state.status === 'running' ? Infinity : 0,
                delay: index * 0.125, // Stagger by 1/8 beat
              }}
            />
            <span className="text-xs uppercase tracking-wider text-[var(--flowcore-colour-fg)]/70">
              {state.agentName.slice(0, 3)}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/**
 * Analogue Theme - Warm, tactile agent display
 */
function AnalogueAgentDisplay({
  states,
  className,
}: {
  states: AgentExecutionState[]
  className: string
}) {
  return (
    <motion.div
      className={`rounded-lg border-2 border-[#D4AF37]/30 bg-gradient-to-br from-[#2A2420] to-[#1A1410] p-3 shadow-xl ${className}`}
      style={{
        backgroundImage:
          'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.1) 2px, rgba(0,0,0,.1) 4px)',
      }}
      initial={{ rotate: -1, scale: 0.98 }}
      animate={{ rotate: 0, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
    >
      <div className="flex items-centre gap-3">
        {states.map((state) => {
          const agentColours: Record<string, string> = {
            scout: '#51CF66',
            coach: '#8B5CF6',
            tracker: '#3AA9BE',
            insight: '#F59E0B',
          }
          const colour = agentColours[state.agentName] || '#6B7280'

          return (
            <motion.div
              key={state.agentName}
              className="flex flex-col items-centre gap-1"
              whileHover={{ y: -2 }}
            >
              {/* VU Meter Style Indicator */}
              <div className="flex h-6 w-8 items-end gap-0.5 rounded bg-black/40 p-1">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 rounded-sm"
                    style={{
                      backgroundColor: colour,
                      opacity: state.status === 'running' ? 1 : 0.2,
                    }}
                    animate={
                      state.status === 'running'
                        ? {
                            height: [`${(i + 1) * 20}%`, `${(i + 2) * 25}%`, `${(i + 1) * 20}%`],
                          }
                        : { height: '20%' }
                    }
                    transition={{
                      duration: 0.8,
                      repeat: state.status === 'running' ? Infinity : 0,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>

              {/* Agent Name */}
              <span
                className="font-mono text-xs font-semibold uppercase tracking-wide"
                style={{ color: colour }}
              >
                {state.agentName.slice(0, 3)}
              </span>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
