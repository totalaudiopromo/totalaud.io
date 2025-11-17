/**
 * Adaptive Directive Feed
 * Phase 21 - Scrollable list of adaptive directives
 * British English
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { AdaptiveDirective } from '@total-audio/performance'

interface AdaptiveDirectiveFeedProps {
  directives: AdaptiveDirective[]
  maxItems?: number
}

export function AdaptiveDirectiveFeed({ directives, maxItems = 20 }: AdaptiveDirectiveFeedProps) {
  const recentDirectives = directives.slice(-maxItems).reverse()

  return (
    <div className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-6">
      <h3 className="text-lg font-semibold text-neutral-100">Directive Feed</h3>
      <div className="mt-4 max-h-96 space-y-2 overflow-y-auto">
        <AnimatePresence>
          {recentDirectives.map((directive, i) => (
            <motion.div
              key={directive.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: i * 0.05 }}
              className="rounded border border-neutral-700/50 bg-neutral-800/30 p-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-xs font-medium uppercase text-cyan-400">
                      {directive.type}
                    </span>
                    <span className="text-xs text-neutral-500">Bar {directive.bar}</span>
                  </div>
                  <div className="mt-1 text-sm text-neutral-300">{directive.reasoning}</div>
                </div>
                <div className={`text-lg font-bold ${directive.delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {directive.delta >= 0 ? '+' : ''}
                  {directive.delta.toFixed(2)}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {recentDirectives.length === 0 && (
          <div className="py-8 text-center text-sm text-neutral-500">
            No directives generated yet
          </div>
        )}
      </div>
    </div>
  )
}
