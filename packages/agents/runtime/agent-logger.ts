/**
 * Agent Logger
 * Logs agent actions, outputs, and errors
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface AgentLogEntry {
  id: string
  timestamp: Date
  agentName: string
  level: LogLevel
  message: string
  clipId?: string
  metadata?: Record<string, unknown>
}

export class AgentLogger {
  private logs: AgentLogEntry[] = []
  private maxLogs: number = 1000
  private listeners: Array<(entry: AgentLogEntry) => void> = []

  constructor(maxLogs: number = 1000) {
    this.maxLogs = maxLogs
  }

  /**
   * Log a message
   */
  log(
    agentName: string,
    level: LogLevel,
    message: string,
    clipId?: string,
    metadata?: Record<string, unknown>
  ): void {
    const entry: AgentLogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      agentName,
      level,
      message,
      clipId,
      metadata,
    }

    this.logs.push(entry)

    // Trim old logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Notify listeners
    this.listeners.forEach((listener) => listener(entry))

    // Console output in development
    if (process.env.NODE_ENV === 'development') {
      const prefix = `[${agentName}]`
      switch (level) {
        case 'debug':
          console.debug(prefix, message, metadata)
          break
        case 'info':
          console.info(prefix, message, metadata)
          break
        case 'warn':
          console.warn(prefix, message, metadata)
          break
        case 'error':
          console.error(prefix, message, metadata)
          break
      }
    }
  }

  /**
   * Convenience methods
   */
  debug(agentName: string, message: string, clipId?: string, metadata?: Record<string, unknown>) {
    this.log(agentName, 'debug', message, clipId, metadata)
  }

  info(agentName: string, message: string, clipId?: string, metadata?: Record<string, unknown>) {
    this.log(agentName, 'info', message, clipId, metadata)
  }

  warn(agentName: string, message: string, clipId?: string, metadata?: Record<string, unknown>) {
    this.log(agentName, 'warn', message, clipId, metadata)
  }

  error(agentName: string, message: string, clipId?: string, metadata?: Record<string, unknown>) {
    this.log(agentName, 'error', message, clipId, metadata)
  }

  /**
   * Get logs
   */
  getLogs(filter?: {
    agentName?: string
    level?: LogLevel
    clipId?: string
    since?: Date
  }): AgentLogEntry[] {
    let filtered = this.logs

    if (filter?.agentName) {
      filtered = filtered.filter((log) => log.agentName === filter.agentName)
    }

    if (filter?.level) {
      filtered = filtered.filter((log) => log.level === filter.level)
    }

    if (filter?.clipId) {
      filtered = filtered.filter((log) => log.clipId === filter.clipId)
    }

    if (filter?.since) {
      filtered = filtered.filter((log) => log.timestamp >= filter.since)
    }

    return filtered
  }

  /**
   * Subscribe to new logs
   */
  subscribe(listener: (entry: AgentLogEntry) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  /**
   * Clear logs
   */
  clear(): void {
    this.logs = []
  }

  /**
   * Get recent logs
   */
  getRecent(count: number = 50): AgentLogEntry[] {
    return this.logs.slice(-count)
  }
}

// Global logger instance
export const agentLogger = new AgentLogger()
