/**
 * Rewrite History Viewer
 * Phase 21 - Display rewrite history from CreativeScore
 * British English
 */

'use client'

import { motion } from 'framer-motion'
import type { AdaptiveCreativeScore } from '@total-audio/agents/intent'
import { getRewriteSummary } from '@total-audio/agents/intent'

interface RewriteHistoryViewerProps {
  score: AdaptiveCreativeScore | null
}

export function RewriteHistoryViewer({ score }: RewriteHistoryViewerProps) {
  if (!score || !score.rewriteHistory) {
    return (
      <div className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-4">
        <div className="text-sm text-neutral-500">No rewrite history available</div>
      </div>
    )
  }

  const summary = getRewriteSummary(score)
  const recentRewrites = score.rewriteHistory.slice(-15).reverse()

  return (
    <div className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-100">Rewrite History</h3>
        <div className="text-sm text-neutral-400">{summary.totalRewrites} total</div>
      </div>

      {/* Summary Statistics */}
      <div className="mt-4 grid grid-cols-2 gap-2 rounded bg-neutral-800/50 p-3">
        <div>
          <div className="text-xs text-neutral-500">Duration Drift</div>
          <div className={`text-sm font-bold ${Math.abs(summary.durationDrift) > 5 ? 'text-amber-400' : 'text-green-400'}`}>
            {summary.durationDrift > 0 ? '+' : ''}
            {summary.durationDrift.toFixed(1)}%
          </div>
        </div>
        <div>
          <div className="text-xs text-neutral-500">Structure</div>
          <div className={`text-sm font-bold ${summary.structurePreserved ? 'text-green-400' : 'text-red-400'}`}>
            {summary.structurePreserved ? 'Preserved' : 'Modified'}
          </div>
        </div>
      </div>

      {/* Rewrites by Type */}
      <div className="mt-4">
        <div className="text-xs font-medium text-neutral-400">By Type</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.entries(summary.rewritesByType).map(([type, count]) => (
            <span
              key={type}
              className="rounded bg-neutral-700/50 px-2 py-1 text-xs font-medium text-neutral-300"
            >
              {type}: {count}
            </span>
          ))}
        </div>
      </div>

      {/* Recent Rewrites */}
      <div className="mt-4">
        <div className="text-xs font-medium text-neutral-400">Recent Changes</div>
        <div className="mt-2 max-h-64 space-y-2 overflow-y-auto">
          {recentRewrites.map((rewrite, i) => (
            <motion.div
              key={`${rewrite.timestamp}_${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded border border-neutral-700/50 bg-neutral-800/30 p-2 text-xs"
            >
              <div className="font-medium text-neutral-300">{rewrite.changeDescription}</div>
              <div className="mt-1 flex items-center gap-2 text-neutral-500">
                <span>Scene {rewrite.scene}</span>
                <span>•</span>
                <span>Bar {rewrite.bar}</span>
                <span>•</span>
                <span className="font-mono">{rewrite.affectedProperty}</span>
              </div>
              {rewrite.oldValue !== null && rewrite.newValue !== null && (
                <div className="mt-1 text-neutral-400">
                  {typeof rewrite.oldValue === 'number' ? rewrite.oldValue.toFixed(2) : rewrite.oldValue}
                  {' → '}
                  {typeof rewrite.newValue === 'number' ? rewrite.newValue.toFixed(2) : rewrite.newValue}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
