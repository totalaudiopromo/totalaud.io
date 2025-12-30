/**
 * Sentry Client Configuration
 * totalaud.io - December 2025
 *
 * Initialises Sentry for client-side error tracking
 */

import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Environment and release tracking
    environment: process.env.NODE_ENV,

    // Performance monitoring (sample 10% of transactions)
    tracesSampleRate: 0.1,

    // Session replay for debugging (sample 10%, 100% on error)
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Only enable in production
    enabled: process.env.NODE_ENV === 'production',

    // Integrations
    integrations: [
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],

    // Filter sensitive data
    beforeSend(event) {
      // Remove sensitive query params
      if (event.request?.query_string) {
        const params = new URLSearchParams(event.request.query_string)
        params.delete('token')
        params.delete('key')
        params.delete('password')
        event.request.query_string = params.toString()
      }
      return event
    },
  })
}
