'use client'

import { Component, ReactNode } from 'react'
import { logger } from '@total-audio/core-logger'

const log = logger.scope('ErrorBoundary')

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    log.error('Error boundary caught error', error, {
      componentStack: errorInfo.componentStack,
    })

    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
          <div className="w-full max-w-md space-y-4 rounded-lg border border-red-500/20 bg-slate-800/90 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
                <span className="text-xl">⚠️</span>
              </div>
              <h2 className="text-xl font-bold text-white">Something went wrong</h2>
            </div>

            <p className="text-sm text-slate-300">
              An unexpected error occurred. The error has been logged and we'll look into it.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 rounded bg-slate-900/50 p-3">
                <summary className="cursor-pointer text-xs font-mono text-red-400">
                  Error details (dev only)
                </summary>
                <pre className="mt-2 overflow-auto text-xs text-slate-400">
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
              >
                Reload page
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="flex-1 rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700"
              >
                Go home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
