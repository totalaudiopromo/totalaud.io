/**
 * Product analytics — a thin wrapper over PostHog (EU-hosted).
 *
 * Principles (docs/STRATEGY_2026.md §4 — trust is the brand):
 * - Explicit events only; autocapture is off.
 * - No-op when PostHog isn't configured or hasn't loaded, so callers never
 *   need to guard.
 * - Nothing here ever sees audio or track content — event properties are
 *   counts and flags only.
 */

import posthog from 'posthog-js'

let initialised = false

export function initAnalytics(): void {
  if (initialised || typeof window === 'undefined') return
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return

  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.posthog.com',
    autocapture: false,
    capture_pageview: true,
    capture_pageleave: false,
    person_profiles: 'identified_only',
    respect_dnt: true,
  })
  initialised = true
}

type AnalyticsEvent =
  | 'waitlist_joined'
  | 'finish_track_analysed'
  | 'finishing_notes_generated'
  | 'outcome_logged'
  | 'intel_summary_generated'
  | 'release_plan_created'
  | 'consistency_checked'

export function capture(event: AnalyticsEvent, properties?: Record<string, unknown>): void {
  if (!initialised) return
  posthog.capture(event, properties)
}
