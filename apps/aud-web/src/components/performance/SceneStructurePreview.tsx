/**
 * Scene Structure Preview
 * Phase 21 - Display adjusted scene durations and OS roles
 * British English
 */

'use client'

import { motion } from 'framer-motion'
import type { AdaptiveCreativeScore } from '@total-audio/agents/intent'

interface SceneStructurePreviewProps {
  score: AdaptiveCreativeScore | null
}

export function SceneStructurePreview({ score }: SceneStructurePreviewProps) {
  if (!score) {
    return (
      <div className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-4">
        <div className="text-sm text-neutral-500">No score loaded</div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-100">Scene Structure</h3>
        <div className="text-xs text-neutral-400">
          {score.adaptiveMetadata.totalRewrites} rewrites
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {score.scenes.map((scene, i) => (
          <motion.div
            key={scene.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="rounded border border-neutral-700/50 bg-neutral-800/30 p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-400">
                  {i + 1}
                </div>
                <div>
                  <div className="text-sm font-medium text-neutral-200">
                    {Math.round(scene.duration)}s
                  </div>
                  <div className="text-xs text-neutral-500">{scene.tempo} BPM</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-neutral-300">
                  {scene.leadOS?.toUpperCase() || 'None'}
                </div>
                <div className="text-xs text-neutral-500">Lead OS</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {score.adaptiveMetadata.durationDrift !== 0 && (
        <div className="mt-4 rounded bg-amber-900/20 px-3 py-2 text-xs text-amber-300">
          Duration drift: {score.adaptiveMetadata.durationDrift.toFixed(1)}%
        </div>
      )}
    </div>
  )
}
