/**
 * Intent Map Preview
 * Phase 20 - Display parsed IntentMap
 */

'use client'

import { motion } from 'framer-motion'
import type { IntentMap } from '@total-audio/agents/intent'

interface IntentMapPreviewProps {
  intentMap: IntentMap | null
}

export function IntentMapPreview({ intentMap }: IntentMapPreviewProps) {
  if (!intentMap) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-neutral-700 bg-neutral-900/30 p-12">
        <p className="text-sm text-neutral-500">
          Parse an intent to see the creative map
        </p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 rounded-lg border border-neutral-700 bg-neutral-900/50 p-6"
    >
      <h2 className="text-lg font-semibold text-neutral-100">Intent Map</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Style */}
        <div className="rounded-lg bg-neutral-800/50 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Style
          </div>
          <div className="mt-1 text-lg font-semibold capitalize text-cyan-400">
            {intentMap.style}
          </div>
        </div>

        {/* Arc */}
        <div className="rounded-lg bg-neutral-800/50 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Arc
          </div>
          <div className="mt-1 text-lg font-semibold capitalize text-purple-400">
            {intentMap.arc}
          </div>
        </div>

        {/* Palette */}
        <div className="rounded-lg bg-neutral-800/50 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Palette
          </div>
          <div className="mt-1 text-lg font-semibold capitalize text-amber-400">
            {intentMap.palette}
          </div>
        </div>

        {/* Lead OS */}
        <div className="rounded-lg bg-neutral-800/50 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Lead OS
          </div>
          <div className="mt-1 text-lg font-semibold uppercase text-green-400">
            {intentMap.leadOS || 'None'}
          </div>
        </div>

        {/* Resisting OS */}
        <div className="rounded-lg bg-neutral-800/50 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Resisting OS
          </div>
          <div className="mt-1 text-lg font-semibold uppercase text-red-400">
            {intentMap.resistingOS || 'None'}
          </div>
        </div>

        {/* Duration */}
        <div className="rounded-lg bg-neutral-800/50 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Duration
          </div>
          <div className="mt-1 text-lg font-semibold text-neutral-100">
            {Math.floor(intentMap.durationSeconds / 60)}:
            {(intentMap.durationSeconds % 60).toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Tempo Curve */}
      <div className="rounded-lg bg-neutral-800/50 p-4">
        <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          Tempo Curve
        </div>
        <div className="mt-3 flex items-end gap-1">
          {intentMap.tempoCurve.map((tempo, i) => {
            const maxTempo = Math.max(...intentMap.tempoCurve)
            const minTempo = Math.min(...intentMap.tempoCurve)
            const normalised = (tempo - minTempo) / (maxTempo - minTempo || 1)
            const height = 40 + normalised * 60

            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}px` }}
                  transition={{ delay: i * 0.05 }}
                  className="w-full rounded-sm bg-gradient-to-t from-cyan-600 to-cyan-400"
                />
                <div className="text-xs text-neutral-400">{tempo}</div>
              </div>
            )
          })}
        </div>
        <div className="mt-2 text-center text-xs text-neutral-500">BPM</div>
      </div>

      {/* Emotional Curve */}
      <div className="rounded-lg bg-neutral-800/50 p-4">
        <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          Emotional Curve
        </div>
        <div className="mt-3 flex items-end gap-1">
          {intentMap.emotionalCurve.map((emotion, i) => {
            const height = 40 + emotion * 60

            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}px` }}
                  transition={{ delay: i * 0.05 }}
                  className="w-full rounded-sm bg-gradient-to-t from-purple-600 to-purple-400"
                />
                <div className="text-xs text-neutral-400">{Math.round(emotion * 100)}%</div>
              </div>
            )
          })}
        </div>
        <div className="mt-2 text-center text-xs text-neutral-500">Intensity</div>
      </div>

      {/* Performance Structure */}
      <div className="rounded-lg bg-neutral-800/50 p-4">
        <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          Performance Structure
        </div>
        <div className="mt-3 space-y-2">
          {intentMap.performanceStructure.map((segment, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-16 text-xs font-medium text-neutral-400">
                Scene {i + 1}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="text-xs text-neutral-500">Tension</div>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-700">
                    <div
                      className="h-full bg-red-500"
                      style={{ width: `${segment.tension * 100}%` }}
                    />
                  </div>
                  <div className="w-8 text-right text-xs text-neutral-400">
                    {Math.round(segment.tension * 100)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-neutral-500">Cohesion</div>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-700">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${segment.cohesion * 100}%` }}
                    />
                  </div>
                  <div className="w-8 text-right text-xs text-neutral-400">
                    {Math.round(segment.cohesion * 100)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-neutral-500">Density</div>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-700">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${segment.density * 100}%` }}
                    />
                  </div>
                  <div className="w-8 text-right text-xs text-neutral-400">
                    {Math.round(segment.density * 100)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Keywords */}
      {intentMap.keywords.length > 0 && (
        <div className="rounded-lg bg-neutral-800/50 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Keywords
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {intentMap.keywords.map((keyword, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-full bg-neutral-700 px-3 py-1 text-sm text-neutral-300"
              >
                {keyword}
              </motion.span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
