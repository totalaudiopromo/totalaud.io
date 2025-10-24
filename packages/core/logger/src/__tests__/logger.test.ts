import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger } from '../index'

describe('Logger', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  describe('debug', () => {
    it('should log debug messages in development', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      logger.debug('Test debug message')

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('DEBUG'))
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Test debug message'))

      process.env.NODE_ENV = originalEnv
    })

    it('should include context in debug messages', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      logger.debug('Test message', { userId: '123', action: 'login' })

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('userId'))
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('123'))

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('info', () => {
    it('should log info messages in development', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      logger.info('Test info message')

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('INFO'))
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Test info message'))

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('warn', () => {
    it('should log warnings in all environments', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      logger.warn('Test warning')

      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('WARN'))
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Test warning'))

      process.env.NODE_ENV = originalEnv
    })

    it('should include context in warnings', () => {
      logger.warn('Rate limit warning', { requests: 95, limit: 100 })

      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('requests'))
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('95'))
    })
  })

  describe('error', () => {
    it('should log errors in all environments', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      logger.error('Test error')

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('ERROR'))
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Test error'))

      process.env.NODE_ENV = originalEnv
    })

    it('should include Error objects in error messages', () => {
      const error = new Error('Something went wrong')
      logger.error('Operation failed', error)

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Something went wrong'))
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error:'))
    })

    it('should handle non-Error objects', () => {
      const error = { code: 'AUTH_FAILED', message: 'Unauthorised' }
      logger.error('Auth failed', error)

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Auth failed'))
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('AUTH_FAILED'))
    })

    it('should include context in error messages', () => {
      const error = new Error('Test error')
      logger.error('Operation failed', error, { userId: '123', operation: 'login' })

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('userId'))
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('123'))
    })
  })

  describe('scope', () => {
    it('should create a scoped logger', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const scopedLogger = logger.scope('TestComponent')
      scopedLogger.info('Test message')

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[TestComponent]'))
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Test message'))

      process.env.NODE_ENV = originalEnv
    })

    it('should maintain scope across different log levels', () => {
      const scopedLogger = logger.scope('ApiHandler')

      scopedLogger.warn('Warning message')
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('[ApiHandler]'))

      scopedLogger.error('Error message')
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('[ApiHandler]'))
    })
  })

  describe('environment-specific behavior', () => {
    it('should suppress debug logs in production', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      logger.debug('Debug message')

      expect(consoleLogSpy).not.toHaveBeenCalled()

      process.env.NODE_ENV = originalEnv
    })

    it('should suppress info logs in production', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      logger.info('Info message')

      expect(consoleLogSpy).not.toHaveBeenCalled()

      process.env.NODE_ENV = originalEnv
    })

    it('should show all logs in development', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      logger.debug('Debug')
      logger.info('Info')
      logger.warn('Warn')
      logger.error('Error')

      expect(consoleLogSpy).toHaveBeenCalledTimes(2) // debug + info
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)

      process.env.NODE_ENV = originalEnv
    })
  })
})
