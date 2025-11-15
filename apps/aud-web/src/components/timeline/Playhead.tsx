'use client'

/**
 * Playhead
 * Timeline playback cursor
 */

import { useTimeline } from '@totalaud/os-state/campaign'
import { motion } from 'framer-motion'

export function Playhead() {
  const { timeline } = useTimeline()

  const playheadPosition = timeline.playheadPosition * timeline.zoom

  return (
    <motion.div
      className="pointer-events-none absolute top-0 z-20"
      style={{
        left: `${playheadPosition}px`,
        height: '100%',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Playhead line */}
      <div className="relative h-full w-0.5 bg-[var(--flowcore-colour-accent)]">
        {/* Top handle */}
        <div className="absolute -left-1.5 -top-1 h-3 w-4 rounded-b border border-[var(--flowcore-colour-accent)] bg-[var(--flowcore-colour-accent)]">
          <svg
            width="16"
            height="12"
            viewBox="0 0 16 12"
            className="text-[var(--flowcore-colour-bg)]"
          >
            <path
              d="M4 2 L8 8 L12 2"
              fill="currentColor"
              stroke="none"
            />
          </svg>
        </div>

        {/* Glow effect when playing */}
        {timeline.isPlaying && (
          <motion.div
            className="absolute inset-0 w-full bg-[var(--flowcore-colour-accent)]"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scaleX: [1, 1.5, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              filter: 'blur(4px)',
            }}
          />
        )}
      </div>

      {/* Time display */}
      <div className="pointer-events-auto absolute -top-8 -translate-x-1/2 rounded bg-[var(--flowcore-colour-accent)] px-2 py-1 font-mono text-xs text-[var(--flowcore-colour-bg)]">
        {formatTime(timeline.playheadPosition)}
      </div>
    </motion.div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 10)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`
}
