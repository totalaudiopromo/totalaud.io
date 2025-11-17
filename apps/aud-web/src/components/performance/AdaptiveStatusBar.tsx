/**
 * Adaptive Status Bar
 * Phase 21 - Display real-time adaptive metrics
 * British English
 */

'use client'

import { motion } from 'framer-motion'
import type { AdaptiveMetrics } from '@total-audio/performance'

interface AdaptiveStatusBarProps {
  metrics: AdaptiveMetrics | null
}

export function AdaptiveStatusBar({ metrics }: AdaptiveStatusBarProps) {
  if (!metrics) {
    return (
      <div className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-4">
        <div className="text-sm text-neutral-500">No adaptive metrics available</div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-100">Adaptive Status</h3>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-neutral-400">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Cohesion */}
        <div className="rounded-lg bg-neutral-800/50 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Cohesion
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-2xl font-bold text-green-400">
              {Math.round(metrics.cohesion * 100)}
            </div>
            <div className="text-xs text-neutral-500">%</div>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-700">
            <motion.div
              className="h-full bg-green-500"
              initial={{ width: 0 }}
              animate={{ width: `${metrics.cohesion * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Tension */}
        <div className="rounded-lg bg-neutral-800/50 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Tension
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-2xl font-bold text-red-400">
              {Math.round(metrics.tension * 100)}
            </div>
            <div className="text-xs text-neutral-500">%</div>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-700">
            <motion.div
              className="h-full bg-red-500"
              initial={{ width: 0 }}
              animate={{ width: `${metrics.tension * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Density */}
        <div className="rounded-lg bg-neutral-800/50 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Energy
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-2xl font-bold text-cyan-400">
              {Math.round(metrics.energy * 100)}
            </div>
            <div className="text-xs text-neutral-500">%</div>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-700">
            <motion.div
              className="h-full bg-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${metrics.energy * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Structural Drift */}
        <div className="rounded-lg bg-neutral-800/50 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Drift
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-2xl font-bold text-amber-400">
              {Math.round(metrics.structuralDrift * 100)}
            </div>
            <div className="text-xs text-neutral-500">%</div>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-700">
            <motion.div
              className="h-full bg-amber-500"
              initial={{ width: 0 }}
              animate={{ width: `${metrics.structuralDrift * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </div>

      {/* Anomaly Flags */}
      {metrics.anomalyFlags.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-700/50 bg-amber-900/20 p-3">
          <div className="text-xs font-medium text-amber-400">Anomalies Detected</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {metrics.anomalyFlags.map((flag) => (
              <span
                key={flag}
                className="rounded bg-amber-700/30 px-2 py-1 text-xs font-medium text-amber-300"
              >
                {flag.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bar and Scene Info */}
      <div className="mt-4 flex items-center justify-between border-t border-neutral-700 pt-4 text-xs text-neutral-400">
        <div>Bar: {metrics.bar}</div>
        <div>Scene: {metrics.scene + 1}</div>
        <div>Tempo Stability: {Math.round(metrics.tempoStability * 100)}%</div>
      </div>
    </div>
  )
}
