'use client'

import { useMomentumStore } from '@/state/momentumStore'
import { motion } from 'framer-motion'
import { Zap, TrendingUp } from 'lucide-react'

export function MomentumMeter() {
  const { momentum } = useMomentumStore()

  if (!momentum) {
    return (
      <div className="rounded-lg border border-foreground/10 bg-background/50 p-6">
        <p className="text-sm text-foreground/50">Loading momentum...</p>
      </div>
    )
  }

  const { momentum: value, streak } = momentum

  // Color based on momentum level
  const getColor = () => {
    if (value >= 70) return '#3AA9BE' // Accent cyan
    if (value >= 40) return '#10B981' // Green
    if (value >= 20) return '#F59E0B' // Amber
    return '#EF4444' // Red
  }

  return (
    <div className="rounded-lg border border-foreground/10 bg-background/50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Zap className="h-5 w-5 text-accent" />
          Momentum
        </h3>
        <span className="text-2xl font-bold" style={{ color: getColor() }}>
          {value}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-foreground/10">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: getColor() }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {/* Streak */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground/70">Current streak</span>
        <div className="flex items-center gap-1 font-medium text-accent">
          <TrendingUp className="h-4 w-4" />
          {streak} {streak === 1 ? 'day' : 'days'}
        </div>
      </div>

      {/* Status message */}
      <div className="mt-4 text-xs text-foreground/50">
        {value >= 70 && "You're on fire! Keep the momentum going."}
        {value >= 40 && value < 70 && 'Solid progress. Stay consistent.'}
        {value >= 20 && value < 40 && 'Building momentum. Keep pushing.'}
        {value < 20 && 'Time to rebuild. Start with small wins.'}
      </div>
    </div>
  )
}
