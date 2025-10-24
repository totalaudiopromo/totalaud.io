'use client'

import { useEffect } from 'react'
import { logger } from '@total-audio/core-logger'

const log = logger.scope('GlobalError')

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    log.error('Global error caught', error, { digest: error.digest })
  }, [error])

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
          <div className="w-full max-w-md space-y-4 rounded-lg border border-red-500/20 bg-slate-800/90 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
                <span className="text-xl">⚠️</span>
              </div>
              <h2 className="text-xl font-bold text-white">Application Error</h2>
            </div>

            <p className="text-sm text-slate-300">
              A critical error occurred. Please try refreshing the page or return home.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 rounded bg-slate-900/50 p-3">
                <summary className="cursor-pointer text-xs font-mono text-red-400">
                  Error details (dev only)
                </summary>
                <pre className="mt-2 overflow-auto text-xs text-slate-400">
                  {error.toString()}
                  {'\n\n'}
                  {error.stack}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => reset()}
                className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
              >
                Try again
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
      </body>
    </html>
  )
}
