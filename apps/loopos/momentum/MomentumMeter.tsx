'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { useMomentumStore, startMomentumDecay } from './momentumStore'

export function MomentumMeter() {
  const { momentum, currentStreak, getMomentumLevel, getMomentumColour } =
    useMomentumStore()

  // Start decay on mount
  useEffect(() => {
    startMomentumDecay()
  }, [])

  const level = getMomentumLevel()
  const colour = getMomentumColour()

  return (
    <div className="flex items-center gap-3">
      {/* Streak badge */}
      <div className="bg-loop-grey-900 border border-loop-grey-800 rounded-md px-3 py-1.5 flex items-center gap-2">
        <Zap className="w-3.5 h-3.5 text-loop-cyan" />
        <span className="text-xs font-semibold text-loop-grey-300">
          {currentStreak} day{currentStreak !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Momentum meter */}
      <div className="flex items-center gap-2">
        <div className="w-32 h-2 bg-loop-grey-900 rounded-full overflow-hidden border border-loop-grey-800">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: colour }}
            initial={{ width: 0 }}
            animate={{ width: `${momentum}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        <div className="flex flex-col items-end">
          <span
            className="text-xs font-bold"
            style={{ color: colour }}
          >
            {level}
          </span>
          <span className="text-[10px] text-loop-grey-500 font-mono">
            {Math.round(momentum)}%
          </span>
        </div>
      </div>
    </div>
  )
}
