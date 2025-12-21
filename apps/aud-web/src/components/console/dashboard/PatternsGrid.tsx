'use client'

import { Card } from '../ui/Card'
import { motion } from 'framer-motion'
import { LightBulbIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline'

interface PatternsGridProps {
  patterns: Array<{
    id: string
    pattern: string
    confidence: number
    impact: string
  }>
}

export function PatternsGrid({ patterns }: PatternsGridProps) {
  return (
    <Card className="bg-transparent border-0 p-0 shadow-none">
      <div className="flex items-center gap-3 mb-6 px-1">
        <ArrowTrendingUpIcon className="w-5 h-5 text-tap-cyan" />
        <h3 className="text-lg font-medium text-tap-white tracking-tight">Detected Patterns</h3>
      </div>

      {patterns.length === 0 ? (
        <div className="p-8 border border-white/5 rounded-2xl bg-white/[0.02] text-center">
          <p className="text-sm text-tap-grey">No campaign patterns detected yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patterns.map((item, i) => (
            <motion.div
              key={item.id}
              className="relative group p-5 bg-[#161A1D] rounded-xl border border-white/5 overflow-hidden transition-colors hover:border-tap-cyan/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.01 }}
            >
              {/* Glass sheen effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className="relative z-10 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-tap-cyan/10 text-tap-cyan">
                      <LightBulbIcon className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-medium text-tap-white leading-snug">
                      {item.pattern}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-mono text-tap-grey/60 uppercase tracking-wider">
                      Confidence
                    </span>
                    <span className="text-sm font-mono text-tap-cyan">
                      {(item.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <span className="text-xs text-tap-grey">Estimated Impact:</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium bg-white/5 text-tap-white/80 border border-white/10 group-hover:border-tap-cyan/20 group-hover:text-tap-cyan transition-colors">
                    {item.impact}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  )
}
