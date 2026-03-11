/**
 * Telemetry Hook
 * Phase 90+: Infrastructure Depth
 *
 * Provides a standardized way to track events across the application.
 */

'use client'

import { useCallback } from 'react'
import { usePathname } from 'next/navigation'

export interface TelemetryEvent {
  name: string
  data?: Record<string, any>
}

export function useTelemetry() {
  const pathname = usePathname()

  const track = useCallback(
    async (eventName: string, data: Record<string, unknown> = {}) => {
      try {
        // Fire and forget - don't await unless necessary
        fetch('/api/telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventName,
            eventData: data,
            path: pathname,
          }),
        }).catch(() => {
          // Silent fail for telemetry
        })
      } catch {
        // Silent fail
      }
    },
    [pathname]
  )

  return { track }
}
