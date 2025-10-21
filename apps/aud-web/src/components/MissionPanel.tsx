/**
 * Mission Panel Component
 *
 * Right sidebar displaying current campaign status, active agents,
 * progress, and contextual next actions.
 *
 * Design Principle: "I know what's happening and what to do next."
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target,
  Activity,
  TrendingUp,
  Lightbulb,
  ChevronRight,
  ChevronLeft,
  Layers,
  BarChart3,
} from 'lucide-react'
import { getAgent } from '@total-audio/core-agent-executor/client'
import { useTheme } from './themes/ThemeResolver'

interface AgentStatus {
  agent_name: string
  status: 'idle' | 'queued' | 'running' | 'complete' | 'error' | 'cancelled'
  message?: string
  started_at?: string
  completed_at?: string
}

interface MissionPanelProps {
  campaignName: string
  agentStatuses: Record<string, AgentStatus>
  view: 'flow' | 'dashboard'
  onToggleView: () => void
  reducedMotion?: boolean
  opacity?: number
  className?: string
}

export function MissionPanel({
  campaignName,
  agentStatuses,
  view,
  onToggleView,
  reducedMotion = false,
  opacity = 1.0,
  className = '',
}: MissionPanelProps) {
  const { themeConfig } = useTheme()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [nextAction, setNextAction] = useState<string>('')

  // Calculate progress
  const agentList = Object.entries(agentStatuses).map(([nodeId, status]) => ({
    nodeId,
    ...status,
  }))

  const totalAgents = agentList.length
  const completedAgents = agentList.filter((a) => a.status === 'complete').length
  const runningAgents = agentList.filter((a) => a.status === 'running').length
  const errorAgents = agentList.filter((a) => a.status === 'error').length
  const progress = totalAgents > 0 ? (completedAgents / totalAgents) * 100 : 0

  // Determine next action
  useEffect(() => {
    if (runningAgents > 0) {
      setNextAction('Agents running in real time')
    } else if (completedAgents === totalAgents && totalAgents > 0) {
      setNextAction('Campaign complete — generate mixdown')
    } else if (errorAgents > 0) {
      setNextAction('Some agents encountered errors — review logs')
    } else if (totalAgents === 0) {
      setNextAction('Add agents to your flow and press Start')
    } else {
      setNextAction('Press Start on an agent to begin')
    }
  }, [runningAgents, completedAgents, totalAgents, errorAgents])

  // Extract theme values
  const colors = themeConfig.colors
  const layout = themeConfig.layout
  const themeMotion = themeConfig.motion
  const tagline = themeConfig.narrative.tagline

  // Status colors
  const statusColors = {
    idle: '#94a3b8',
    queued: '#fbbf24',
    running: '#3b82f6',
    complete: '#10b981',
    error: '#ef4444',
    cancelled: '#9ca3af',
  }

  return (
    <motion.div
      initial={false}
      animate={{
        width: isCollapsed ? '48px' : '320px',
        opacity,
      }}
      transition={{
        duration: reducedMotion ? 0 : themeMotion.duration.medium / 1000,
        ease: themeMotion.easing === 'linear' ? [0, 0, 1, 1] : undefined,
      }}
      className={`relative h-full flex flex-col ${className}`}
      style={{
        backgroundColor: `${colors.bg}dd`,
        borderLeft: `2px ${layout.borderStyle} ${colors.border}`,
        borderRadius: layout.borderRadius,
        boxShadow: layout.glow ? `0 0 24px ${colors.accent}40, ${layout.shadow}` : layout.shadow,
        backdropFilter: `blur(${themeConfig.effects.blur})`,
        padding: layout.padding,
      }}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-4 top-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{
          backgroundColor: colors.bg,
          border: `2px solid ${colors.accent}`,
          color: colors.accent,
        }}
        aria-label={isCollapsed ? 'Expand panel' : 'Collapse panel'}
      >
        {isCollapsed ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>

      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full"
          >
            {/* Header */}
            <div
              className="p-4 border-b"
              style={{ borderColor: `${colors.border}` }}
            >
              <h2
                className="text-sm font-mono font-semibold mb-1"
                style={{
                  color: colors.accent,
                  textTransform: themeConfig.typography.textTransform,
                }}
              >
                current campaign
              </h2>
              <p
                className="text-xs font-mono opacity-60 mb-2"
                style={{ color: colors.text }}
              >
                {new Date().toLocaleTimeString()}
              </p>
              <p
                className="text-xs font-mono opacity-80 italic"
                style={{
                  color: colors.accent,
                  textTransform: themeConfig.typography.textTransform,
                }}
              >
                {tagline}
              </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Current Campaign */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4" style={{ color: colors.accent }} />
                  <h3 className="text-xs font-mono font-semibold lowercase" style={{ color: colors.text }}>
                    campaign
                  </h3>
                </div>
                <p className="text-sm font-mono ml-6" style={{ color: colors.text }}>
                  {campaignName || 'untitled campaign'}
                </p>
              </div>

              {/* Active Agents */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4" style={{ color: colors.accent }} />
                  <h3 className="text-xs font-mono font-semibold lowercase" style={{ color: colors.text }}>
                    agents
                  </h3>
                </div>
                <div className="space-y-2 ml-6">
                  {agentList.length === 0 ? (
                    <p className="text-xs font-mono opacity-60" style={{ color: colors.text }}>
                      no agents active
                    </p>
                  ) : (
                    agentList.map((agentStatus) => {
                      const agent = getAgent(agentStatus.agent_name)
                      if (!agent) return null

                      return (
                        <div
                          key={agentStatus.nodeId}
                          className="flex items-center gap-2"
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: statusColors[agentStatus.status],
                              boxShadow: `0 0 8px ${statusColors[agentStatus.status]}`,
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-mono font-semibold truncate lowercase" style={{ color: colors.text }}>
                              {agent.name.toLowerCase()}
                            </p>
                            {agentStatus.message && (
                              <p className="text-xs font-mono opacity-60 truncate" style={{ color: colors.text }}>
                                {agentStatus.message}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Progress */}
              {totalAgents > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4" style={{ color: colors.accent }} />
                    <h3 className="text-xs font-mono font-semibold lowercase" style={{ color: colors.text }}>
                      progress
                    </h3>
                  </div>
                  <div className="ml-6">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono" style={{ color: colors.text }}>
                        {completedAgents} of {totalAgents} agents
                      </span>
                      <span className="text-xs font-mono font-semibold" style={{ color: colors.accent }}>
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: `${colors.accent}20` }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: 'spring', damping: 20 }}
                        className="h-full"
                        style={{
                          backgroundColor: colors.accent,
                          boxShadow: `0 0 8px ${colors.accent}`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Next Action */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4" style={{ color: colors.accent }} />
                  <h3 className="text-xs font-mono font-semibold lowercase" style={{ color: colors.text }}>
                    next action
                  </h3>
                </div>
                <p className="text-xs font-mono ml-6 leading-relaxed" style={{ color: colors.text }}>
                  {nextAction}
                </p>
              </div>

              {/* Generate Mixdown Button */}
              {completedAgents === totalAgents && totalAgents > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <button
                    onClick={() => {
                      console.log('[MissionPanel] Generate Mixdown clicked')
                      // TODO: Implement mixdown generation
                    }}
                    className="w-full px-4 py-3 rounded font-mono text-sm font-semibold lowercase flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: colors.accent,
                      color: colors.bg,
                      boxShadow: `0 0 16px ${colors.accent}80`,
                      cursor: 'pointer',
                    }}
                  >
                    <BarChart3 className="w-4 h-4" />
                    generate mixdown
                  </button>
                </motion.div>
              )}
            </div>

            {/* Footer - View Toggle */}
            <div
              className="p-4 border-t"
              style={{ borderColor: `${colors.accent}30` }}
            >
              <button
                onClick={onToggleView}
                className="w-full px-4 py-2 rounded font-mono text-sm font-semibold lowercase flex items-center justify-center gap-2 transition-all hover:scale-105"
                style={{
                  backgroundColor: `${colors.accent}20`,
                  border: `1px solid ${colors.accent}`,
                  color: colors.accent,
                }}
              >
                {view === 'flow' ? (
                  <>
                    <BarChart3 className="w-4 h-4" />
                    dashboard view
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4" />
                    flow view
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
