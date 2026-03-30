/**
 * Global Error Boundary
 * Catches errors in the root layout itself
 * Must use inline styles (no CSS imports available at this level)
 */

'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: {
        errorBoundary: 'global',
        digest: error.digest,
      },
    })
  }, [error])

  return (
    <html lang="en-GB">
      <body
        style={{
          margin: 0,
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
          Application error
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
          Something went wrong at the application level. This has been reported automatically.
        </p>

        <button
          onClick={reset}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
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
      </body>
    </html>
  )
}
