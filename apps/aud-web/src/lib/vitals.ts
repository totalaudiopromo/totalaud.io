/**
 * Web Vitals Reporter
 *
 * Tracks Core Web Vitals (CWV) and reports them to the logger.
 * Metrics: CLS, INP, LCP, FCP, TTFB
 */

import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals'
import { logger } from '@/lib/logger'

const log = logger.scope('WebVitals')

type MetricRating = 'good' | 'needs-improvement' | 'poor'

interface MetricReport {
  name: string
  value: number
  rating: MetricRating
  id: string
  delta: number
  navigationType: string
  [key: string]: string | number // Index signature for Record<string, unknown> compatibility
}

/**
 * Report a single metric
 */
function reportMetric(metric: Metric): void {
  const report: MetricReport = {
    name: metric.name,
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    rating: metric.rating,
    id: metric.id,
    delta: metric.delta,
    navigationType: metric.navigationType,
  }

  // Log based on rating
  switch (metric.rating) {
    case 'good':
      log.debug(`${metric.name}: ${report.value}ms (good)`, report)
      break
    case 'needs-improvement':
      log.info(`${metric.name}: ${report.value}ms (needs improvement)`, report)
      break
    case 'poor':
      log.warn(`${metric.name}: ${report.value}ms (poor)`, report)
      break
  }

  // Send to analytics if available
  if (typeof window !== 'undefined') {
    // Vercel Analytics
    if (
      'va' in window &&
      typeof (window as unknown as { va: (cmd: string, data: object) => void }).va === 'function'
    ) {
      ;(window as unknown as { va: (cmd: string, data: object) => void }).va('event', {
        name: `cwv-${metric.name.toLowerCase()}`,
        value: report.value,
        rating: metric.rating,
      })
    }

    // Google Analytics (if configured)
    if (
      'gtag' in window &&
      typeof (window as unknown as { gtag: (...args: unknown[]) => void }).gtag === 'function'
    ) {
      ;(window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: report.value,
        event_label: metric.id,
        non_interaction: true,
      })
    }
  }
}

/**
 * Initialise Web Vitals reporting
 * Call this once in your root layout or _app
 */
export function initWebVitals(): void {
  // Only run on client
  if (typeof window === 'undefined') return

  try {
    // Core Web Vitals
    onCLS(reportMetric) // Cumulative Layout Shift
    onINP(reportMetric) // Interaction to Next Paint (replaced FID)
    onLCP(reportMetric) // Largest Contentful Paint

    // Additional metrics
    onFCP(reportMetric) // First Contentful Paint
    onTTFB(reportMetric) // Time to First Byte

    log.debug('Web Vitals initialised')
  } catch (error) {
    log.error('Failed to initialise Web Vitals', error as Error)
  }
}

/**
 * Get thresholds for each metric
 * Based on Google's Core Web Vitals thresholds
 */
export const thresholds = {
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 },
  LCP: { good: 2500, poor: 4000 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
} as const

/**
 * Helper to check if a value meets the threshold
 */
export function checkThreshold(metric: keyof typeof thresholds, value: number): MetricRating {
  const threshold = thresholds[metric]
  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}
