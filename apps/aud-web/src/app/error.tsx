/**
 * Root Error Boundary
 * Brand-styled with Sentry integration preserved
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
    Sentry.captureException(error, {
      tags: {
        errorBoundary: 'root',
        digest: error.digest,
      },
    })
  }, [error])

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0F1113',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '32px 24px',
        textAlign: 'center',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="1.5" opacity="0.6" />
          <line
            x1="12"
            y1="8"
            x2="12"
            y2="13"
            stroke="#EF4444"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="12" cy="16" r="1" fill="#EF4444" />
        </svg>
      </div>

      <h1
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: 'rgba(255, 255, 255, 0.85)',
          margin: '0 0 8px',
        }}
      >
        Something went wrong
      </h1>

      <p
        style={{
          fontSize: 13,
          color: 'rgba(255, 255, 255, 0.4)',
          margin: '0 0 24px',
          maxWidth: 360,
          lineHeight: 1.5,
        }}
      >
        An unexpected error occurred. Try again, or head back to your workspace.
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={reset}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            backgroundColor: '#3AA9BE',
            color: '#0F1113',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Try again
        </button>
        <a
          href="/workspace"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            color: 'rgba(255, 255, 255, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            textDecoration: 'none',
            fontFamily: 'inherit',
          }}
        >
          Back to Workspace
        </a>
      </div>

      {/* Error digest for support */}
      {error.digest && (
        <p
          style={{
            fontSize: 10,
            color: 'rgba(255, 255, 255, 0.2)',
            marginTop: 32,
            fontFamily: 'monospace',
          }}
        >
          Error ID: {error.digest}
        </p>
      )}
    </div>
  )
}
