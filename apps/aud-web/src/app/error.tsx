/**
 * Root Error Boundary
 * Required by Next.js App Router
 * Catches errors in the root layout and pages
 */

'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'

const log = logger.scope('Root Error')

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    log.error('Root error', error)

    // Report to Sentry with digest for server-side correlation
    Sentry.captureException(error, {
      tags: {
        errorBoundary: 'root',
        digest: error.digest,
      },
    })
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
      <p className="text-gray-400 mb-6">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
