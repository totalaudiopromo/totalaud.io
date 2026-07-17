'use client'

/**
 * Initialises product analytics on the client. Renders nothing.
 * No-ops entirely when NEXT_PUBLIC_POSTHOG_KEY is unset.
 */

import { useEffect } from 'react'
import { initAnalytics } from '@/lib/analytics'

export function AnalyticsProvider() {
  useEffect(() => {
    initAnalytics()
  }, [])

  return null
}
