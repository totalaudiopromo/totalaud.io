'use client'

import { motion } from 'framer-motion'
import { useCanvasStore } from '@/stores/canvas'

export function Playhead() {
  const { timeline } = useCanvasStore()
  const pixelsPerSecond = 1 / timeline.zoom // Convert zoom to pixels

  const leftPosition = timeline.playheadPosition * pixelsPerSecond

  return (
    <motion.div
      className="absolute top-0 bottom-0 w-[2px] bg-slate-cyan z-50 pointer-events-none"
      style={{
        left: leftPosition,
        boxShadow: '0 0 10px rgba(58, 169, 190, 0.5)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: timeline.isPlaying ? 1 : 0.6 }}
      transition={{ duration: 0.12 }}
    >
      {/* Playhead Handle */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-cyan rounded-sm" />

      {/* Time Label */}
      <div className="absolute top-4 left-2 bg-matte-black px-2 py-1 rounded text-xs text-slate-cyan font-mono">
        {formatTime(timeline.playheadPosition)}
      </div>
    </motion.div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
}
