/**
 * Mission Dashboard Component
 *
 * Narrative-driven campaign summary with live agent status and metrics.
 * Alternative view to FlowCanvas - like switching from Mix to Arrangement view in a DAW.
 *
 * Design Principle: "Simple, glanceable metrics in human language."
 */

'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  FileText,
  Share2,
  Loader2,
} from 'lucide-react'
import { getAgent } from '@total-audio/core-agent-executor/client'
import { playAgentSound } from '@total-audio/core-theme-engine'
import type { OSTheme } from '@/types/themes'

interface AgentStatus {
  agent_name: string
  status: 'idle' | 'queued' | 'running' | 'complete' | 'error'
  message?: string
  result?: any
  started_at?: string
  completed_at?: string
}

interface CampaignMetrics {
  totalContacts?: number
  emailsSent?: number
  repliesReceived?: number
  openRate?: number
  followUpsSent?: number
}

interface MissionDashboardProps {
  sessionId: string
  campaignName?: string
  theme: OSTheme
  agentStatuses: Record<string, AgentStatus>
  metrics?: CampaignMetrics
  onGenerateMixdown?: () => void
  onRunAgain?: () => void
  onShareReport?: () => void
  reducedMotion?: boolean
  muteSounds?: boolean
}

export function MissionDashboard({
  sessionId,
  campaignName = 'Untitled Campaign',
  theme,
  agentStatuses,
  metrics = {},
  onGenerateMixdown,
  onRunAgain,
  onShareReport,
  reducedMotion = false,
  muteSounds = false,
}: MissionDashboardProps) {
  // Convert agent statuses to array
  const agentList = useMemo(() => {
    return Object.entries(agentStatuses).map(([nodeId, status]) => ({
      nodeId,
      ...status,
    }))
  }, [agentStatuses])

  // Calculate progress
  const { totalAgents, completedAgents, runningAgents, errorAgents, progress } = useMemo(() => {
    const total = agentList.length
    const completed = agentList.filter((a) => a.status === 'complete').length
    const running = agentList.filter((a) => a.status === 'running').length
    const errors = agentList.filter((a) => a.status === 'error').length
    const prog = total > 0 ? (completed / total) * 100 : 0

    return {
      totalAgents: total,
      completedAgents: completed,
      runningAgents: running,
      errorAgents: errors,
      progress: prog,
    }
  }, [agentList])

  // Determine next action message
  const nextActionMessage = useMemo(() => {
    if (errorAgents > 0) {
      return {
        icon: AlertCircle,
        text: `${errorAgents} agent${errorAgents > 1 ? 's' : ''} encountered errors. Check the flow view for details.`,
        color: '#ef4444',
      }
    }
    if (runningAgents > 0) {
      return {
        icon: Loader2,
        text: `${runningAgents} agent${runningAgents > 1 ? 's are' : ' is'} working... Your campaign is in progress.`,
        color: '#3b82f6',
        animate: true,
      }
    }
    if (completedAgents === totalAgents && totalAgents > 0) {
      return {
        icon: CheckCircle2,
        text: '✨ Great work! All agents complete. Generate your mixdown to see results.',
        color: '#10b981',
      }
    }
    if (totalAgents === 0) {
      return {
        icon: PlayCircle,
        text: 'Add agents to your flow and click Start to begin your campaign.',
        color: '#fbbf24',
      }
    }
    return {
      icon: Activity,
      text: 'Ready to launch. Click Start on agents in the flow view.',
      color: '#94a3b8',
    }
  }, [runningAgents, completedAgents, totalAgents, errorAgents])

  // Theme colors
  const themeColors = {
    ascii: { accent: '#00ff00', text: '#00ff00', bg: '#000000', card: '#001a00' },
    xp: { accent: '#0078d4', text: '#ffffff', bg: '#000814', card: '#001e3c' },
    aqua: { accent: '#5ac8fa', text: '#ffffff', bg: '#000a14', card: '#001529' },
    daw: { accent: '#ff764d', text: '#ffffff', bg: '#0a0a0a', card: '#1a1a1a' },
    analogue: { accent: '#d3b98c', text: '#d3b98c', bg: '#1a1a18', card: '#2a2a28' },
  }

  const colors = themeColors[theme] || themeColors.ascii

  // Agent color mapping
  const agentColors = {
    broker: '#6366f1',
    scout: '#10b981',
    coach: '#3b82f6',
    tracker: '#f59e0b',
    insight: '#8b5cf6',
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', damping: 20 },
    },
  }

  return (
    <div
      className="h-full w-full overflow-auto p-8"
      style={{
        backgroundColor: colors.bg,
        backgroundImage: `
          linear-gradient(${colors.accent}10 1px, transparent 1px),
          linear-gradient(90deg, ${colors.accent}10 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }}
    >
      <motion.div
        className="max-w-5xl mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center space-y-2">
          <h1
            className="text-4xl font-mono font-bold tracking-tight"
            style={{ color: colors.accent }}
          >
            🎧 {campaignName}
          </h1>
          <p className="text-sm font-mono opacity-60" style={{ color: colors.text }}>
            Your agents are collaborating in real time
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <div
              className="px-3 py-1 rounded-full text-xs font-mono font-semibold"
              style={{
                backgroundColor: `${colors.accent}20`,
                border: `1px solid ${colors.accent}`,
                color: colors.accent,
              }}
            >
              {totalAgents} Agent{totalAgents !== 1 ? 's' : ''} Active
            </div>
            {runningAgents > 0 && (
              <div
                className="px-3 py-1 rounded-full text-xs font-mono font-semibold animate-pulse"
                style={{
                  backgroundColor: '#3b82f620',
                  border: '1px solid #3b82f6',
                  color: '#3b82f6',
                }}
              >
                Live
              </div>
            )}
          </div>
        </motion.div>

        {/* Progress Overview */}
        {totalAgents > 0 && (
          <motion.div
            variants={itemVariants}
            className="rounded-lg p-6"
            style={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.accent}30`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5" style={{ color: colors.accent }} />
                <h2 className="text-lg font-mono font-semibold" style={{ color: colors.text }}>
                  Campaign Progress
                </h2>
              </div>
              <span className="text-2xl font-mono font-bold" style={{ color: colors.accent }}>
                {Math.round(progress)}%
              </span>
            </div>

            {/* Progress Bar */}
            <div
              className="h-3 rounded-full overflow-hidden mb-2"
              style={{ backgroundColor: `${colors.accent}20` }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', damping: 20 }}
                className="h-full"
                style={{
                  backgroundColor: colors.accent,
                  boxShadow: `0 0 20px ${colors.accent}`,
                }}
              />
            </div>

            <p className="text-sm font-mono opacity-60" style={{ color: colors.text }}>
              {completedAgents} of {totalAgents} agents complete
            </p>
          </motion.div>
        )}

        {/* Agent Summaries */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agentList.map((agentStatus) => {
            const agent = getAgent(agentStatus.agent_name)
            if (!agent) return null

            const agentColor = agentColors[agentStatus.agent_name.toLowerCase()] || colors.accent
            const isRunning = agentStatus.status === 'running'
            const isComplete = agentStatus.status === 'complete'
            const isError = agentStatus.status === 'error'

            return (
              <motion.div
                key={agentStatus.nodeId}
                variants={itemVariants}
                whileHover={{ scale: reducedMotion ? 1 : 1.02 }}
                className="rounded-lg p-4 relative overflow-hidden"
                style={{
                  backgroundColor: colors.card,
                  border: `2px solid ${isRunning ? agentColor : `${agentColor}40`}`,
                  boxShadow: isRunning ? `0 0 20px ${agentColor}40` : 'none',
                }}
              >
                {/* Animated border for running state */}
                {isRunning && !reducedMotion && (
                  <motion.div
                    className="absolute inset-0 rounded-lg"
                    style={{
                      border: `2px solid ${agentColor}`,
                      opacity: 0.5,
                    }}
                    animate={{
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{agent.emoji}</span>
                      <h3 className="text-lg font-mono font-semibold" style={{ color: colors.text }}>
                        {agent.name}
                      </h3>
                    </div>
                    {isComplete && (
                      <CheckCircle2 className="w-5 h-5" style={{ color: '#10b981' }} />
                    )}
                    {isError && (
                      <AlertCircle className="w-5 h-5" style={{ color: '#ef4444' }} />
                    )}
                    {isRunning && (
                      <Loader2 className="w-5 h-5 animate-spin" style={{ color: agentColor }} />
                    )}
                  </div>

                  <p className="text-sm font-mono" style={{ color: colors.text }}>
                    {agentStatus.message || agent.description}
                  </p>

                  {/* Agent-specific metrics */}
                  {isComplete && agentStatus.result && (
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: `${agentColor}30` }}>
                      <p className="text-xs font-mono opacity-60" style={{ color: colors.text }}>
                        {typeof agentStatus.result === 'string'
                          ? agentStatus.result
                          : JSON.stringify(agentStatus.result).slice(0, 100)}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Metrics Summary (if available) */}
        {Object.keys(metrics).length > 0 && (
          <motion.div
            variants={itemVariants}
            className="rounded-lg p-6"
            style={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.accent}30`,
            }}
          >
            <h2 className="text-lg font-mono font-semibold mb-4" style={{ color: colors.text }}>
              📊 Campaign Metrics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {metrics.totalContacts !== undefined && (
                <div>
                  <p className="text-xs font-mono opacity-60 mb-1" style={{ color: colors.text }}>
                    Contacts Found
                  </p>
                  <p className="text-2xl font-mono font-bold" style={{ color: colors.accent }}>
                    {metrics.totalContacts}
                  </p>
                </div>
              )}
              {metrics.emailsSent !== undefined && (
                <div>
                  <p className="text-xs font-mono opacity-60 mb-1" style={{ color: colors.text }}>
                    Emails Sent
                  </p>
                  <p className="text-2xl font-mono font-bold" style={{ color: colors.accent }}>
                    {metrics.emailsSent}
                  </p>
                </div>
              )}
              {metrics.openRate !== undefined && (
                <div>
                  <p className="text-xs font-mono opacity-60 mb-1" style={{ color: colors.text }}>
                    Open Rate
                  </p>
                  <p className="text-2xl font-mono font-bold" style={{ color: colors.accent }}>
                    {metrics.openRate}%
                  </p>
                </div>
              )}
              {metrics.followUpsSent !== undefined && (
                <div>
                  <p className="text-xs font-mono opacity-60 mb-1" style={{ color: colors.text }}>
                    Follow-ups
                  </p>
                  <p className="text-2xl font-mono font-bold" style={{ color: colors.accent }}>
                    {metrics.followUpsSent}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Next Action Panel */}
        <motion.div
          variants={itemVariants}
          className="rounded-lg p-6"
          style={{
            backgroundColor: colors.card,
            border: `2px solid ${nextActionMessage.color}40`,
            boxShadow: `0 0 20px ${nextActionMessage.color}20`,
          }}
        >
          <div className="flex items-start gap-4">
            <nextActionMessage.icon
              className={`w-6 h-6 flex-shrink-0 ${nextActionMessage.animate ? 'animate-spin' : ''}`}
              style={{ color: nextActionMessage.color }}
            />
            <div className="flex-1">
              <h3 className="text-sm font-mono font-semibold mb-1 uppercase" style={{ color: colors.text }}>
                Next Action
              </h3>
              <p className="text-sm font-mono leading-relaxed" style={{ color: colors.text }}>
                {nextActionMessage.text}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex flex-wrap gap-3 justify-center">
          {onRunAgain && (
            <button
              onClick={onRunAgain}
              className="px-6 py-3 rounded font-mono font-semibold flex items-center gap-2 transition-all hover:scale-105"
              style={{
                backgroundColor: `${colors.accent}20`,
                border: `2px solid ${colors.accent}`,
                color: colors.accent,
              }}
            >
              <PlayCircle className="w-5 h-5" />
              Run Again
            </button>
          )}

          {onGenerateMixdown && completedAgents > 0 && (
            <button
              onClick={onGenerateMixdown}
              className="px-6 py-3 rounded font-mono font-semibold flex items-center gap-2 transition-all hover:scale-105"
              style={{
                backgroundColor: colors.accent,
                color: theme === 'ascii' ? '#000000' : '#ffffff',
              }}
            >
              <FileText className="w-5 h-5" />
              Generate Mixdown
            </button>
          )}

          {onShareReport && completedAgents === totalAgents && totalAgents > 0 && (
            <button
              onClick={onShareReport}
              className="px-6 py-3 rounded font-mono font-semibold flex items-center gap-2 transition-all hover:scale-105"
              style={{
                backgroundColor: `${colors.accent}20`,
                border: `2px solid ${colors.accent}`,
                color: colors.accent,
              }}
            >
              <Share2 className="w-5 h-5" />
              Share Report
            </button>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
