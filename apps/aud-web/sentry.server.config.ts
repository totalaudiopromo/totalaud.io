/**
 * Sentry Server Configuration
 * totalaud.io - December 2025
 *
 * Initialises Sentry for server-side error tracking
 */

import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Environment tracking
    environment: process.env.NODE_ENV,

    // Performance monitoring (sample 10% of transactions)
    tracesSampleRate: 0.1,

    // Only enable in production
    enabled: process.env.NODE_ENV === 'production',

    // Filter sensitive data from server errors
    beforeSend(event) {
      // Scrub sensitive headers
      if (event.request?.headers) {
        delete event.request.headers['authorization']
        delete event.request.headers['cookie']
        delete event.request.headers['x-api-key']
      }
      return event
    },
  })
}
