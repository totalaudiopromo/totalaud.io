/**
 * Agent Log Panel - Phase 9
 * Live feed of agent execution logs with OS-specific styling
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { AgentEvent } from '@total-audio/agents'
import { logger } from '@/lib/logger'

const log = logger.scope('AgentLogPanel')

/**
 * Agent Log Entry for display
 */
interface AgentLogEntry {
  id: string
  agentType: string
  eventType: string
  message: string
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'success'
}

/**
 * Agent Log Panel Props
 */
export interface AgentLogPanelProps {
  campaignId?: string
  maxEntries?: number
  autoScroll?: boolean
  showFilter?: boolean
  osTheme?: 'ascii' | 'xp' | 'aqua' | 'daw' | 'analogue'
}

/**
 * Agent Log Panel Component
 */
export function AgentLogPanel({
  campaignId,
  maxEntries = 50,
  autoScroll = true,
  showFilter = true,
  osTheme = 'daw',
}: AgentLogPanelProps) {
  const [logs, setLogs] = useState<AgentLogEntry[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [isPaused, setIsPaused] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  /**
   * Scroll to bottom when new logs arrive
   */
  useEffect(() => {
    if (autoScroll && !isPaused && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs, autoScroll, isPaused])

  /**
   * Subscribe to agent events (would integrate with event bus in production)
   */
  useEffect(() => {
    // In production, this would subscribe to the AgentEventBus
    // For now, we'll simulate with mock data
    const mockLogs: AgentLogEntry[] = [
      {
        id: '1',
        agentType: 'scout',
        eventType: 'clip_activated',
        message: 'Research task started: Find radio contacts',
        timestamp: new Date().toISOString(),
        level: 'info',
      },
      {
        id: '2',
        agentType: 'coach',
        eventType: 'clip_completed',
        message: 'Planning sequence generated: 3 steps',
        timestamp: new Date().toISOString(),
        level: 'success',
      },
    ]

    setLogs(mockLogs)

    log.info('Agent log panel initialised', { campaignId, osTheme })

    // Cleanup function
    return () => {
      log.debug('Agent log panel unmounted')
    }
  }, [campaignId, osTheme])

  /**
   * Add a new log entry
   */
  const addLogEntry = useCallback(
    (entry: AgentLogEntry) => {
      setLogs((prev) => {
        const newLogs = [...prev, entry]
        if (newLogs.length > maxEntries) {
          return newLogs.slice(-maxEntries)
        }
        return newLogs
      })
    },
    [maxEntries]
  )

  /**
   * Clear all logs
   */
  const clearLogs = useCallback(() => {
    setLogs([])
    log.info('Agent logs cleared')
  }, [])

  /**
   * Get filtered logs
   */
  const filteredLogs = logs.filter((entry) => {
    if (filter === 'all') return true
    return entry.agentType === filter
  })

  /**
   * Get log entry colour based on level and OS theme
   */
  const getLogColour = (level: AgentLogEntry['level']): string => {
    const colours = {
      ascii: {
        info: '#00FF00',
        warn: '#FFFF00',
        error: '#FF0000',
        success: '#00FFFF',
      },
      xp: {
        info: '#0066CC',
        warn: '#CC9900',
        error: '#CC0000',
        success: '#009900',
      },
      aqua: {
        info: '#007AFF',
        warn: '#FF9500',
        error: '#FF3B30',
        success: '#34C759',
      },
      daw: {
        info: '#3AA9BE',
        warn: '#FFC107',
        error: '#F44336',
        success: '#4CAF50',
      },
      analogue: {
        info: '#8B7355',
        warn: '#DAA520',
        error: '#A52A2A',
        success: '#556B2F',
      },
    }

    return colours[osTheme][level]
  }

  /**
   * Format timestamp
   */
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#0F1113',
        border: '1px solid #2A2D30',
        borderRadius: '8px',
        overflow: 'hidden',
        fontFamily: osTheme === 'ascii' || osTheme === 'daw' ? 'monospace' : 'sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'centre',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid #2A2D30',
          backgroundColor: '#16181A',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'centre',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isPaused ? '#FFC107' : '#4CAF50',
            }}
          />
          <span
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#E0E0E0',
              textTransform: osTheme === 'ascii' || osTheme === 'daw' ? 'lowercase' : 'none',
            }}
          >
            {osTheme === 'ascii' ? '[agent log]' : 'Agent Log'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsPaused(!isPaused)}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              backgroundColor: 'transparent',
              border: '1px solid #2A2D30',
              borderRadius: '4px',
              color: '#B0B0B0',
              cursor: 'pointer',
              textTransform: 'lowercase',
            }}
          >
            {isPaused ? 'resume' : 'pause'}
          </button>

          <button
            onClick={clearLogs}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              backgroundColor: 'transparent',
              border: '1px solid #2A2D30',
              borderRadius: '4px',
              color: '#B0B0B0',
              cursor: 'pointer',
              textTransform: 'lowercase',
            }}
          >
            clear
          </button>
        </div>
      </div>

      {/* Filter */}
      {showFilter && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '8px 16px',
            borderBottom: '1px solid #2A2D30',
            backgroundColor: '#16181A',
          }}
        >
          {['all', 'scout', 'coach', 'tracker', 'insight'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              style={{
                padding: '4px 12px',
                fontSize: '11px',
                backgroundColor: filter === filterType ? '#3AA9BE20' : 'transparent',
                border: filter === filterType ? '1px solid #3AA9BE' : '1px solid #2A2D30',
                borderRadius: '4px',
                color: filter === filterType ? '#3AA9BE' : '#808080',
                cursor: 'pointer',
                textTransform: 'lowercase',
              }}
            >
              {filterType}
            </button>
          ))}
        </div>
      )}

      {/* Log entries */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px',
        }}
      >
        <AnimatePresence mode="popLayout">
          {filteredLogs.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.12 }}
              style={{
                padding: '8px 12px',
                marginBottom: '4px',
                backgroundColor: '#16181A',
                borderLeft: `3px solid ${getLogColour(entry.level)}`,
                borderRadius: '4px',
                fontSize: '12px',
                lineHeight: '1.4',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'baseline',
                }}
              >
                <span
                  style={{
                    color: '#808080',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                >
                  {formatTime(entry.timestamp)}
                </span>

                <span
                  style={{
                    color: getLogColour(entry.level),
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: '11px',
                  }}
                >
                  {entry.agentType}
                </span>

                <span
                  style={{
                    color: '#B0B0B0',
                    flex: 1,
                  }}
                >
                  {entry.message}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredLogs.length === 0 && (
          <div
            style={{
              padding: '32px',
              textAlign: 'centre',
              color: '#606060',
              fontSize: '13px',
            }}
          >
            {filter === 'all' ? 'No agent activity yet' : `No ${filter} activity`}
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '8px 16px',
          borderTop: '1px solid #2A2D30',
          backgroundColor: '#16181A',
          fontSize: '11px',
          color: '#808080',
        }}
      >
        <span>
          {filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'}
        </span>
        <span>{isPaused ? 'paused' : 'live'}</span>
      </div>
    </div>
  )
}
