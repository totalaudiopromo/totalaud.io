/**
 * Agent Logger - Phase 9
 * Structured logging for agent execution
 */

import type { AgentType } from '@total-audio/timeline'

/**
 * Log Level
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/**
 * Log Entry
 */
export interface LogEntry {
  level: LogLevel
  agentType: AgentType
  clipId: string
  message: string
  data?: Record<string, unknown>
  timestamp: string
}

/**
 * Agent Logger Class
 */
export class AgentLogger {
  private logs: LogEntry[] = []
  private maxLogs: number = 500
  private logLevel: LogLevel = 'info'

  constructor(options?: { maxLogs?: number; logLevel?: LogLevel }) {
    if (options?.maxLogs) {
      this.maxLogs = options.maxLogs
    }

    if (options?.logLevel) {
      this.logLevel = options.logLevel
    }
  }

  /**
   * Set minimum log level
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level
  }

  /**
   * Check if should log at this level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    const currentIndex = levels.indexOf(this.logLevel)
    const requestedIndex = levels.indexOf(level)

    return requestedIndex >= currentIndex
  }

  /**
   * Add log entry
   */
  private log(level: LogLevel, agentType: AgentType, clipId: string, message: string, data?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) {
      return
    }

    const entry: LogEntry = {
      level,
      agentType,
      clipId,
      message,
      data,
      timestamp: new Date().toISOString(),
    }

    this.logs.push(entry)

    // Trim if exceeds max
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // Console output for errors and warnings
    if (level === 'error') {
      console.error(`[Agent:${agentType}:${clipId}] ${message}`, data)
    } else if (level === 'warn') {
      console.warn(`[Agent:${agentType}:${clipId}] ${message}`, data)
    } else if (level === 'debug' && this.logLevel === 'debug') {
      console.log(`[Agent:${agentType}:${clipId}] ${message}`, data)
    }
  }

  /**
   * Log debug message
   */
  debug(agentType: AgentType, clipId: string, message: string, data?: Record<string, unknown>): void {
    this.log('debug', agentType, clipId, message, data)
  }

  /**
   * Log info message
   */
  info(agentType: AgentType, clipId: string, message: string, data?: Record<string, unknown>): void {
    this.log('info', agentType, clipId, message, data)
  }

  /**
   * Log warning
   */
  warn(agentType: AgentType, clipId: string, message: string, data?: Record<string, unknown>): void {
    this.log('warn', agentType, clipId, message, data)
  }

  /**
   * Log error
   */
  error(agentType: AgentType, clipId: string, message: string, data?: Record<string, unknown>): void {
    this.log('error', agentType, clipId, message, data)
  }

  /**
   * Get all logs
   */
  getLogs(filter?: { agentType?: AgentType; clipId?: string; level?: LogLevel; limit?: number }): LogEntry[] {
    let logs = this.logs

    if (filter?.agentType) {
      logs = logs.filter((log) => log.agentType === filter.agentType)
    }

    if (filter?.clipId) {
      logs = logs.filter((log) => log.clipId === filter.clipId)
    }

    if (filter?.level) {
      logs = logs.filter((log) => log.level === filter.level)
    }

    if (filter?.limit) {
      logs = logs.slice(-filter.limit)
    }

    return logs
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = []
  }

  /**
   * Get log count
   */
  getCount(filter?: { agentType?: AgentType; level?: LogLevel }): number {
    return this.getLogs(filter).length
  }
}

/**
 * Global logger instance
 */
let globalLogger: AgentLogger | null = null

/**
 * Get or create the global logger
 */
export function getAgentLogger(): AgentLogger {
  if (!globalLogger) {
    globalLogger = new AgentLogger({ logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info' })
  }
  return globalLogger
}

/**
 * Reset the global logger (useful for testing)
 */
export function resetAgentLogger(): void {
  globalLogger = null
}
