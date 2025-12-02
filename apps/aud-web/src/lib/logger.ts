/**
 * Logger utility for aud-web
 *
 * Structured logging with levels and scopes.
 * In production, only warn and error are shown.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerOptions {
  scope?: string
}

const isDev = process.env.NODE_ENV !== 'production'

function formatMessage(level: LogLevel, scope: string | undefined, message: string): string {
  const timestamp = new Date().toISOString()
  const scopePrefix = scope ? `[${scope}]` : ''
  return `${timestamp} ${level.toUpperCase()} ${scopePrefix} ${message}`
}

function createLogger(options?: LoggerOptions) {
  const scope = options?.scope

  return {
    debug: (message: string, data?: Record<string, unknown>) => {
      if (isDev) {
        console.debug(formatMessage('debug', scope, message), data ?? '')
      }
    },

    info: (message: string, data?: Record<string, unknown>) => {
      if (isDev) {
        console.info(formatMessage('info', scope, message), data ?? '')
      }
    },

    warn: (message: string, data?: Record<string, unknown>) => {
      console.warn(formatMessage('warn', scope, message), data ?? '')
    },

    error: (message: string, error?: unknown, data?: Record<string, unknown>) => {
      console.error(formatMessage('error', scope, message), error ?? '', data ?? '')
    },

    scope: (newScope: string) => createLogger({ scope: newScope }),
  }
}

export const logger = createLogger()
