'use client'

/**
 * Loop Canvas
 * Visual panel showing autonomous loops as satellites around agents
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLoops } from '@totalaud/os-state/campaign'
import type { AgentLoop, LoopInterval } from '@totalaud/os-state/campaign'
import { Clock, Play, Pause, AlertCircle, CheckCircle } from 'lucide-react'

interface LoopCanvasProps {
  onEditLoop?: (loop: AgentLoop) => void
  onCreateLoop?: (agent: string) => void
  className?: string
}

const AGENT_COLOURS: Record<string, string> = {
  scout: '#51CF66',
  coach: '#8B5CF6',
  tracker: '#3AA9BE',
  insight: '#F59E0B',
}

const INTERVAL_LABELS: Record<LoopInterval, string> = {
  '5m': '5 min',
  '15m': '15 min',
  '1h': '1 hour',
  'daily': 'Daily',
}

export function LoopCanvas({ onEditLoop, onCreateLoop, className = '' }: LoopCanvasProps) {
  const { loops, getLoopsByAgent } = useLoops()
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

  const agents = ['scout', 'coach', 'tracker', 'insight']

  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-lg border border-[var(--flowcore-colour-border)] bg-[var(--flowcore-colour-bg)] p-8 ${className}`}
    >
      {/* Header */}
      <div className="mb-6 flex items-centre justify-between">
        <div>
          <h3 className="font-mono text-lg font-semibold text-[var(--flowcore-colour-fg)]">
            Autonomous Loops
          </h3>
          <p className="mt-1 font-mono text-xs text-[var(--flowcore-colour-fg)]/70">
            {loops.loops.length} active loops • {loops.nextLoopRun ? `Next run: ${formatNextRun(loops.nextLoopRun)}` : 'No scheduled runs'}
          </p>
        </div>

        {/* Health Score */}
        <div className="flex items-centre gap-2 rounded-lg border border-[var(--flowcore-colour-border)] bg-[var(--flowcore-overlay-soft)] px-3 py-2">
          <span className="font-mono text-xs uppercase text-[var(--flowcore-colour-fg)]/70">
            Health:
          </span>
          <span
            className="font-mono text-sm font-semibold"
            style={{
              color: getHealthColour(loops.loopHealthScore),
            }}
          >
            {loops.loopHealthScore}%
          </span>
        </div>
      </div>

      {/* Canvas Grid */}
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
        {agents.map((agent) => {
          const agentLoops = getLoopsByAgent(agent as any)
          return (
            <AgentLoopNode
              key={agent}
              agent={agent}
              loops={agentLoops}
              isSelected={selectedAgent === agent}
              onSelect={() => setSelectedAgent(agent === selectedAgent ? null : agent)}
              onEditLoop={onEditLoop}
              onCreateLoop={() => onCreateLoop?.(agent)}
            />
          )
        })}
      </div>

      {/* Selected Agent Details */}
      <AnimatePresence>
        {selectedAgent && (
          <motion.div
            className="mt-6 rounded-lg border border-[var(--flowcore-colour-border)] bg-[var(--flowcore-overlay-soft)] p-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <h4 className="mb-3 font-mono text-sm font-semibold uppercase text-[var(--flowcore-colour-fg)]">
              {selectedAgent} Loops
            </h4>

            <div className="space-y-2">
              {getLoopsByAgent(selectedAgent as any).map((loop) => (
                <LoopDetailCard key={loop.id} loop={loop} onEdit={() => onEditLoop?.(loop)} />
              ))}

              {getLoopsByAgent(selectedAgent as any).length === 0 && (
                <p className="font-mono text-xs text-[var(--flowcore-colour-fg)]/50">
                  No loops configured for this agent
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface AgentLoopNodeProps {
  agent: string
  loops: AgentLoop[]
  isSelected: boolean
  onSelect: () => void
  onEditLoop?: (loop: AgentLoop) => void
  onCreateLoop?: () => void
}

function AgentLoopNode({
  agent,
  loops,
  isSelected,
  onSelect,
  onEditLoop,
  onCreateLoop,
}: AgentLoopNodeProps) {
  const colour = AGENT_COLOURS[agent] || '#6B7280'
  const activeLoops = loops.filter((l) => l.status !== 'disabled')

  return (
    <div className="relative flex flex-col items-centre">
      {/* Agent Node */}
      <motion.button
        className="relative flex h-24 w-24 flex-col items-centre justify-centre rounded-full border-2 transition-all"
        style={{
          borderColor: isSelected ? colour : `${colour}40`,
          backgroundColor: isSelected ? `${colour}20` : `${colour}10`,
        }}
        onClick={onSelect}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Agent Name */}
        <span
          className="font-mono text-xs font-semibold uppercase"
          style={{ color: colour }}
        >
          {agent}
        </span>

        {/* Loop Count */}
        <span className="mt-1 font-mono text-xs text-[var(--flowcore-colour-fg)]/70">
          {activeLoops.length} loops
        </span>

        {/* Running Indicator */}
        {activeLoops.some((l) => l.status === 'running') && (
          <motion.div
            className="absolute -right-1 -top-1 h-3 w-3 rounded-full"
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
      </motion.button>

      {/* Loop Satellites */}
      <div className="mt-4 flex flex-wrap justify-centre gap-1">
        {loops.slice(0, 3).map((loop, index) => (
          <LoopSatellite
            key={loop.id}
            loop={loop}
            colour={colour}
            onClick={() => onEditLoop?.(loop)}
          />
        ))}

        {loops.length > 3 && (
          <div
            className="flex h-5 w-5 items-centre justify-centre rounded-full font-mono text-[10px] font-semibold"
            style={{
              backgroundColor: `${colour}20`,
              color: colour,
            }}
          >
            +{loops.length - 3}
          </div>
        )}
      </div>

      {/* Add Loop Button */}
      <button
        onClick={onCreateLoop}
        className="mt-2 rounded px-2 py-1 font-mono text-[10px] uppercase transition-colours hover:bg-[var(--flowcore-colour-fg)]/10"
        style={{ color: colour }}
      >
        + Add Loop
      </button>
    </div>
  )
}

interface LoopSatelliteProps {
  loop: AgentLoop
  colour: string
  onClick: () => void
}

function LoopSatellite({ loop, colour, onClick }: LoopSatelliteProps) {
  const isRunning = loop.status === 'running'
  const isDisabled = loop.status === 'disabled'

  return (
    <motion.button
      className="flex h-5 w-5 items-centre justify-centre rounded-full border transition-all"
      style={{
        borderColor: isDisabled ? '#6B7280' : colour,
        backgroundColor: isDisabled ? '#6B728020' : `${colour}30`,
      }}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={`${loop.loopType} • ${INTERVAL_LABELS[loop.interval]}`}
    >
      {isRunning ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Play size={10} style={{ color: colour }} />
        </motion.div>
      ) : isDisabled ? (
        <Pause size={10} style={{ color: '#6B7280' }} />
      ) : (
        <Clock size={10} style={{ color: colour }} />
      )}
    </motion.button>
  )
}

interface LoopDetailCardProps {
  loop: AgentLoop
  onEdit: () => void
}

function LoopDetailCard({ loop, onEdit }: LoopDetailCardProps) {
  const colour = AGENT_COLOURS[loop.agent] || '#6B7280'
  const isRunning = loop.status === 'running'
  const isDisabled = loop.status === 'disabled'

  return (
    <motion.button
      className="w-full rounded-lg border border-[var(--flowcore-colour-border)] bg-[var(--flowcore-colour-bg)] p-3 text-left transition-all hover:bg-[var(--flowcore-colour-fg)]/5"
      onClick={onEdit}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-centre gap-2">
            {/* Status Icon */}
            {isRunning ? (
              <Play size={12} style={{ color: colour }} />
            ) : isDisabled ? (
              <Pause size={12} style={{ color: '#6B7280' }} />
            ) : (
              <CheckCircle size={12} style={{ color: colour }} />
            )}

            {/* Loop Type */}
            <span
              className="font-mono text-xs font-semibold uppercase"
              style={{ color: isDisabled ? '#6B7280' : colour }}
            >
              {loop.loopType}
            </span>
          </div>

          {/* Interval */}
          <p className="mt-1 font-mono text-[10px] text-[var(--flowcore-colour-fg)]/70">
            Runs {INTERVAL_LABELS[loop.interval]}
          </p>

          {/* Next Run */}
          {loop.nextRun && !isDisabled && (
            <p className="mt-0.5 font-mono text-[10px] text-[var(--flowcore-colour-fg)]/50">
              Next: {formatNextRun(loop.nextRun)}
            </p>
          )}
        </div>

        {/* Status Badge */}
        <span
          className="rounded px-2 py-0.5 font-mono text-[10px] uppercase"
          style={{
            backgroundColor: isDisabled ? '#6B728020' : `${colour}20`,
            color: isDisabled ? '#6B7280' : colour,
          }}
        >
          {loop.status}
        </span>
      </div>
    </motion.button>
  )
}

// Helper functions

function formatNextRun(isoDate: string): string {
  const date = new Date(isoDate)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 0) return 'Overdue'
  if (diffMins < 1) return 'Now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`
  return `${Math.floor(diffMins / 1440)}d`
}

function getHealthColour(score: number): string {
  if (score >= 80) return '#51CF66' // Green
  if (score >= 60) return '#F59E0B' // Amber
  return '#EF4444' // Red
}
