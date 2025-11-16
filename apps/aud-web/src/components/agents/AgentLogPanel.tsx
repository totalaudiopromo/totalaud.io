'use client'

/**
 * Agent Log Panel
 * Real-time activity log displaying all agent actions
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { agentLogger } from '@totalaud/agents/runtime'
import type { AgentLogEntry, LogLevel } from '@totalaud/agents/runtime'
import { X, Filter, Download, Trash2 } from 'lucide-react'

interface AgentLogPanelProps {
  isOpen: boolean
  onClose: () => void
}

const LOG_LEVEL_COLOURS: Record<LogLevel, string> = {
  debug: '#6B7280',
  info: '#3AA9BE',
  warn: '#F59E0B',
  error: '#EF4444',
}

const AGENT_COLOURS: Record<string, string> = {
  scout: '#51CF66',
  coach: '#8B5CF6',
  tracker: '#3AA9BE',
  insight: '#F59E0B',
}

export function AgentLogPanel({ isOpen, onClose }: AgentLogPanelProps) {
  const [logs, setLogs] = useState<AgentLogEntry[]>([])
  const [filterAgent, setFilterAgent] = useState<string | null>(null)
  const [filterLevel, setFilterLevel] = useState<LogLevel | null>(null)
  const [filterSource, setFilterSource] = useState<'all' | 'timeline' | 'loops'>('all')
  const [autoScroll, setAutoScroll] = useState(true)
  const logContainerRef = useRef<HTMLDivElement>(null)

  // Subscribe to new logs
  useEffect(() => {
    const unsubscribe = agentLogger.subscribe((entry) => {
      setLogs((prev) => [...prev, entry].slice(-100)) // Keep last 100 logs
    })

    // Load initial logs
    setLogs(agentLogger.getRecent(100))

    return unsubscribe
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs, autoScroll])

  const handleClearLogs = () => {
    agentLogger.clear()
    setLogs([])
  }

  const handleDownloadLogs = () => {
    const logText = logs.map((log) => {
      return `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] [${log.agentName}] ${log.message}`
    }).join('\n')

    const blob = new Blob([logText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `agent-logs-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const filteredLogs = logs.filter((log) => {
    if (filterAgent && log.agentName !== filterAgent) return false
    if (filterLevel && log.level !== filterLevel) return false
    if (filterSource !== 'all') {
      const source = log.metadata?.source as string | undefined
      if (filterSource === 'timeline' && source !== 'timeline') return false
      if (filterSource === 'loops' && source !== 'loop') return false
    }
    return true
  })

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Panel */}
        <motion.div
          className="relative z-10 flex h-[600px] w-full max-w-2xl flex-col border-l border-t border-[var(--flowcore-colour-border)] bg-[var(--flowcore-colour-bg)] shadow-2xl"
          initial={{ x: '100%', y: '100%' }}
          animate={{ x: 0, y: 0 }}
          exit={{ x: '100%', y: '100%' }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Header */}
          <div className="flex items-centre justify-between border-b border-[var(--flowcore-colour-border)] p-4">
            <div>
              <h2 className="font-mono text-lg font-semibold text-[var(--flowcore-colour-fg)]">
                Agent Activity Log
              </h2>
              <p className="mt-0.5 font-mono text-xs text-[var(--flowcore-colour-fg)]/70">
                {filteredLogs.length} entries
              </p>
            </div>

            <div className="flex items-centre gap-2">
              <button
                onClick={handleDownloadLogs}
                className="rounded p-2 text-[var(--flowcore-colour-fg)]/70 transition-colours hover:bg-[var(--flowcore-colour-fg)]/10 hover:text-[var(--flowcore-colour-fg)]"
                title="Download logs"
              >
                <Download size={18} />
              </button>

              <button
                onClick={handleClearLogs}
                className="rounded p-2 text-[var(--flowcore-colour-error)]/70 transition-colours hover:bg-[var(--flowcore-colour-error)]/10 hover:text-[var(--flowcore-colour-error)]"
                title="Clear logs"
              >
                <Trash2 size={18} />
              </button>

              <button
                onClick={onClose}
                className="rounded p-2 text-[var(--flowcore-colour-fg)]/70 transition-colours hover:bg-[var(--flowcore-colour-fg)]/10 hover:text-[var(--flowcore-colour-fg)]"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-centre gap-4 border-b border-[var(--flowcore-colour-border)] p-4">
            <div className="flex items-centre gap-2">
              <Filter size={14} className="text-[var(--flowcore-colour-fg)]/50" />
              <span className="font-mono text-xs uppercase text-[var(--flowcore-colour-fg)]/70">
                Filter:
              </span>
            </div>

            <select
              value={filterAgent || ''}
              onChange={(e) => setFilterAgent(e.target.value || null)}
              className="rounded border border-[var(--flowcore-colour-border)] bg-[var(--flowcore-overlay-soft)] px-2 py-1 font-mono text-xs text-[var(--flowcore-colour-fg)] outline-none"
            >
              <option value="">All Agents</option>
              <option value="scout">Scout</option>
              <option value="coach">Coach</option>
              <option value="tracker">Tracker</option>
              <option value="insight">Insight</option>
            </select>

            <select
              value={filterLevel || ''}
              onChange={(e) => setFilterLevel((e.target.value as LogLevel) || null)}
              className="rounded border border-[var(--flowcore-colour-border)] bg-[var(--flowcore-overlay-soft)] px-2 py-1 font-mono text-xs text-[var(--flowcore-colour-fg)] outline-none"
            >
              <option value="">All Levels</option>
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warn">Warn</option>
              <option value="error">Error</option>
            </select>

            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value as 'all' | 'timeline' | 'loops')}
              className="rounded border border-[var(--flowcore-colour-border)] bg-[var(--flowcore-overlay-soft)] px-2 py-1 font-mono text-xs text-[var(--flowcore-colour-fg)] outline-none"
            >
              <option value="all">All Sources</option>
              <option value="timeline">Timeline Only</option>
              <option value="loops">Loops Only</option>
            </select>

            <label className="ml-auto flex items-centre gap-2 font-mono text-xs text-[var(--flowcore-colour-fg)]/70">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded"
              />
              Auto-scroll
            </label>
          </div>

          {/* Logs */}
          <div
            ref={logContainerRef}
            className="flex-1 overflow-y-auto p-4 font-mono text-xs"
          >
            {filteredLogs.length === 0 ? (
              <div className="flex h-full items-centre justify-centre text-[var(--flowcore-colour-fg)]/50">
                No logs to display
              </div>
            ) : (
              <div className="space-y-1">
                {filteredLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    className="rounded border border-[var(--flowcore-colour-border)]/50 p-2 transition-colours hover:bg-[var(--flowcore-colour-fg)]/5"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.12 }}
                  >
                    <div className="flex items-start gap-2">
                      {/* Timestamp */}
                      <span className="text-[var(--flowcore-colour-fg)]/50">
                        {log.timestamp.toLocaleTimeString()}
                      </span>

                      {/* Level badge */}
                      <span
                        className="rounded px-1.5 py-0.5 font-semibold uppercase"
                        style={{
                          backgroundColor: `${LOG_LEVEL_COLOURS[log.level]}20`,
                          color: LOG_LEVEL_COLOURS[log.level],
                        }}
                      >
                        {log.level}
                      </span>

                      {/* Agent badge */}
                      <span
                        className="rounded px-1.5 py-0.5 font-semibold uppercase"
                        style={{
                          backgroundColor: `${AGENT_COLOURS[log.agentName] || '#6B7280'}20`,
                          color: AGENT_COLOURS[log.agentName] || '#6B7280',
                        }}
                      >
                        {log.agentName}
                      </span>

                      {/* Message */}
                      <span className="flex-1 text-[var(--flowcore-colour-fg)]">
                        {log.message}
                      </span>
                    </div>

                    {/* Metadata */}
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="mt-1 rounded bg-[var(--flowcore-colour-bg)] p-2 text-[var(--flowcore-colour-fg)]/60">
                        {JSON.stringify(log.metadata, null, 2)}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
