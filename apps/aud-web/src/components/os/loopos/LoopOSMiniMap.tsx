'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { LoopOSLane } from './useLoopOSLocalStore'
import type { SequencedClip } from './engines/sequenceEngine'

interface LoopOSMiniMapProps {
  clips: SequencedClip[]
  playhead: number
  totalUnits: number
  viewportStart: number
  viewportUnits: number
  onScrubTo: (targetUnit: number) => void
}

const laneColour: Record<LoopOSLane, string> = {
  creative: 'bg-cyan-400/80',
  action: 'bg-emerald-400/80',
  promo: 'bg-amber-400/80',
  analysis: 'bg-violet-400/80',
  refine: 'bg-sky-400/80',
}

export function LoopOSMiniMap({
  clips,
  playhead,
  totalUnits,
  viewportStart,
  viewportUnits,
  onScrubTo,
}: LoopOSMiniMapProps) {
  const prefersReducedMotion = useReducedMotion()

  const safeTotal = totalUnits || 1
  const playheadRatio = Math.max(0, Math.min(1, playhead / safeTotal))
  const viewportStartRatio = Math.max(0, Math.min(1, viewportStart / safeTotal))
  const viewportWidthRatio = Math.max(0.05, Math.min(1, viewportUnits / safeTotal))

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = (event.clientX - rect.left) / rect.width
    const unit = Math.max(0, Math.min(1, ratio)) * safeTotal
    onScrubTo(unit)
  }

  return (
    <div className="pointer-events-auto fixed right-4 top-[72px] z-20 hidden w-72 rounded-xl border border-slate-800/90 bg-slate-950/90 px-3 py-2 text-[10px] text-slate-300 shadow-[0_18px_40px_rgba(0,0,0,0.85)] lg:block">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.22em] text-slate-400">
          Loop map
        </span>
        <span className="text-[9px] text-slate-500">Scrub to navigate</span>
      </div>

      <div
        className="relative h-14 cursor-pointer overflow-hidden rounded-lg bg-slate-900/90"
        onPointerDown={handlePointerDown}
      >
        <div className="absolute inset-0">
          {clips.map((clip) => {
            const startRatio = clip.start / safeTotal
            const lengthRatio = clip.length / safeTotal

            return (
              <div
                key={clip.id}
                className={`${laneColour[clip.lane]} absolute rounded-sm opacity-80`}
                style={{
                  left: `${startRatio * 100}%`,
                  width: `${Math.max(0.5, lengthRatio * 100)}%`,
                  top: '10%',
                  height: '80%',
                }}
              />
            )
          })}
        </div>

        <motion.div
          className="absolute inset-y-0 top-0 w-[2px] bg-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.95)]"
          style={{ left: `${playheadRatio * 100}%` }}
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  type: 'tween',
                  duration: 0.18,
                }
          }
        />

        <motion.div
          className="absolute inset-y-0 rounded border border-sky-400/70 bg-sky-500/10"
          style={{
            left: `${viewportStartRatio * 100}%`,
            width: `${viewportWidthRatio * 100}%`,
          }}
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  type: 'spring',
                  stiffness: 140,
                  damping: 30,
                }
          }
        />
      </div>
    </div>
  )
}


