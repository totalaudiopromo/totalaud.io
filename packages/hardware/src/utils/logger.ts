/**
 * Hardware Control Layer Logger
 * Provides structured logging for HCL operations
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class HCLLogger {
  private scope: string;

  constructor(scope = 'HCL') {
    this.scope = scope;
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      scope: this.scope,
      message,
      ...(context && { context }),
    };

    // In development, log everything
    // In production, only log warn and error
    if (process.env.NODE_ENV === 'development' || level === 'warn' || level === 'error') {
      const method = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      console[method](`[${this.scope}]`, message, context || '');
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = error instanceof Error
      ? { error: error.message, stack: error.stack, ...context }
      : { error, ...context };

    this.log('error', message, errorContext);
  }

  createScope(newScope: string): HCLLogger {
    return new HCLLogger(`${this.scope}:${newScope}`);
  }
}

export const logger = new HCLLogger('HCL');
export { HCLLogger };
