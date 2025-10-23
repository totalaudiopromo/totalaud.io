/**
 * Logger Utility
 *
 * Structured logging with levels and scopes.
 * Replaces console.log throughout the codebase.
 *
 * Usage:
 *   import { logger } from '@total-audio/core-logger'
 *
 *   logger.debug('Detailed debug info', { userId: '123' })
 *   logger.info('Operation completed', { duration: 500 })
 *   logger.warn('Rate limit approaching', { requests: 95 })
 *   logger.error('Operation failed', error, { context: 'value' })
 *
 * Scoped logger:
 *   const log = logger.scope('ComponentName')
 *   log.debug('Component mounted')
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  [key: string]: unknown
}

export interface Logger {
  debug(message: string, context?: LogContext): void
  info(message: string, context?: LogContext): void
  warn(message: string, context?: LogContext): void
  error(message: string, error?: Error | unknown, context?: LogContext): void
  scope(scopeName: string): Logger
}

class LoggerImpl implements Logger {
  private scopeName?: string

  constructor(scopeName?: string) {
    this.scopeName = scopeName
  }

  private shouldLog(level: LogLevel): boolean {
    // In production, only show warnings and errors
    if (process.env.NODE_ENV === 'production') {
      return level === 'warn' || level === 'error'
    }

    // In development, show all levels
    return true
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString()
    const scope = this.scopeName ? `[${this.scopeName}]` : ''
    const levelStr = level.toUpperCase().padEnd(5)

    return `${timestamp} ${levelStr} ${scope} ${message}`
  }

  private formatContext(context?: LogContext): string {
    if (!context || Object.keys(context).length === 0) {
      return ''
    }

    try {
      return '\n' + JSON.stringify(context, null, 2)
    } catch {
      return '\n[Context serialization failed]'
    }
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('debug')) return

    const formatted = this.formatMessage('debug', message)
    const contextStr = this.formatContext(context)

    console.log(formatted + contextStr)
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog('info')) return

    const formatted = this.formatMessage('info', message)
    const contextStr = this.formatContext(context)

    console.log(formatted + contextStr)
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog('warn')) return

    const formatted = this.formatMessage('warn', message)
    const contextStr = this.formatContext(context)

    console.warn(formatted + contextStr)
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (!this.shouldLog('error')) return

    const formatted = this.formatMessage('error', message)

    // Format error if provided
    let errorStr = ''
    if (error) {
      if (error instanceof Error) {
        errorStr = `\nError: ${error.message}\nStack: ${error.stack || 'No stack trace'}`
      } else {
        try {
          errorStr = '\nError: ' + JSON.stringify(error)
        } catch {
          errorStr = '\nError: [Could not serialize error]'
        }
      }
    }

    const contextStr = this.formatContext(context)

    console.error(formatted + errorStr + contextStr)
  }

  scope(scopeName: string): Logger {
    return new LoggerImpl(scopeName)
  }
}

// Export singleton instance
export const logger = new LoggerImpl()

// Export default
export default logger
