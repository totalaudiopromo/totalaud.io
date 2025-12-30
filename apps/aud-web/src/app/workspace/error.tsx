/**
 * Workspace Error Boundary
 *
 * Catches errors in workspace routes and provides recovery options.
 */

'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import * as Sentry from '@sentry/nextjs'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'
import { logger } from '@/lib/logger'
import { transition, variants } from '@/lib/motion'

const log = logger.scope('WorkspaceError')

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    log.error('Workspace error', error, { digest: error.digest })

    // Report to Sentry
    Sentry.captureException(error, {
      tags: {
        errorBoundary: 'workspace',
        digest: error.digest,
      },
    })
  }, [error])

  return (
    <div
      className="min-h-screen flex items-center justify-center p-8"
      style={{ backgroundColor: '#0F1113' }}
    >
      <motion.div
        className="max-w-md w-full text-center"
        {...variants.fadeIn}
        transition={transition.normal}
      >
        {/* Error icon */}
        <motion.div
          className="mx-auto mb-6 w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...transition.normal, delay: 0.1 }}
        >
          <AlertCircle className="w-8 h-8 text-red-500" />
        </motion.div>

        {/* Error message */}
        <motion.h2
          className="text-xl font-semibold text-white mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition.normal, delay: 0.15 }}
        >
          Something went wrong
        </motion.h2>

        <motion.p
          className="text-[#9CA3AF] mb-6 text-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition.normal, delay: 0.2 }}
        >
          We couldn't load this workspace mode. This has been reported and we're looking into it.
        </motion.p>

        {/* Action buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition.normal, delay: 0.25 }}
        >
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#3AA9BE] text-white rounded-lg font-medium text-sm hover:bg-[#3AA9BE]/90 transition-colors min-h-[44px]"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>

          <Link
            href="/console"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2A2D31] text-white rounded-lg font-medium text-sm hover:bg-[#2A2D31]/80 transition-colors min-h-[44px]"
          >
            <Home className="w-4 h-4" />
            Go to Console
          </Link>
        </motion.div>

        {/* Error details (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <motion.details
            className="mt-8 text-left"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...transition.slow, delay: 0.3 }}
          >
            <summary className="text-xs text-[#6B7280] cursor-pointer hover:text-[#9CA3AF]">
              Error details
            </summary>
            <pre className="mt-2 p-3 bg-[#1A1D21] rounded-lg text-xs text-red-400 overflow-auto max-h-40">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </motion.details>
        )}
      </motion.div>
    </div>
  )
}
