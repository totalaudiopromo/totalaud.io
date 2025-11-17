/**
 * Adaptive Timeline Graph
 * Phase 21 - Sparkline visualization of tension/cohesion/density
 * British English
 */

'use client'

import { motion } from 'framer-motion'
import type { AdaptiveMetrics } from '@total-audio/performance'

interface AdaptiveTimelineGraphProps {
  metricsHistory: AdaptiveMetrics[]
  maxPoints?: number
}

export function AdaptiveTimelineGraph({ metricsHistory, maxPoints = 50 }: AdaptiveTimelineGraphProps) {
  const recentMetrics = metricsHistory.slice(-maxPoints)

  // Generate SVG path for sparkline
  const generateSparkline = (values: number[], color: string) => {
    if (values.length === 0) return null

    const width = 100
    const height = 40
    const step = width / (values.length - 1 || 1)

    const points = values
      .map((value, i) => {
        const x = i * step
        const y = height - value * height
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ')

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
        <path
          d={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  const tensionValues = recentMetrics.map((m) => m.tension)
  const cohesionValues = recentMetrics.map((m) => m.cohesion)
  const energyValues = recentMetrics.map((m) => m.energy)

  return (
    <div className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-6">
      <h3 className="text-lg font-semibold text-neutral-100">Timeline</h3>

      <div className="mt-4 space-y-4">
        {/* Tension */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Tension</span>
            <span className="text-xs text-red-400">
              {recentMetrics.length > 0 ? Math.round(recentMetrics[recentMetrics.length - 1].tension * 100) : 0}%
            </span>
          </div>
          <div className="h-10">{generateSparkline(tensionValues, '#f87171')}</div>
        </div>

        {/* Cohesion */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Cohesion</span>
            <span className="text-xs text-green-400">
              {recentMetrics.length > 0 ? Math.round(recentMetrics[recentMetrics.length - 1].cohesion * 100) : 0}%
            </span>
          </div>
          <div className="h-10">{generateSparkline(cohesionValues, '#4ade80')}</div>
        </div>

        {/* Energy */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Energy</span>
            <span className="text-xs text-cyan-400">
              {recentMetrics.length > 0 ? Math.round(recentMetrics[recentMetrics.length - 1].energy * 100) : 0}%
            </span>
          </div>
          <div className="h-10">{generateSparkline(energyValues, '#06b6d4')}</div>
        </div>
      </div>

      <div className="mt-4 text-xs text-neutral-500">Last {recentMetrics.length} bars</div>
    </div>
  )
}
