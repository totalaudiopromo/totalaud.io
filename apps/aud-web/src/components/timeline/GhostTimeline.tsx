'use client'

/**
 * Ghost Mode Timeline
 * Minimal timeline strip visible in all non-DAW OSs
 * Shows upcoming clips and allows quick switch to DAW OS
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTimeline, useCampaignMeta } from '@totalaud/os-state/campaign'
import { Play, Pause, Maximize2, ChevronUp, ChevronDown } from 'lucide-react'

interface GhostTimelineProps {
  onSwitchToDAW?: () => void
}

export function GhostTimeline({ onSwitchToDAW }: GhostTimelineProps) {
  const { timeline, setPlaying, togglePlayback } = useTimeline()
  const { setTheme } = useCampaignMeta()
  const [isExpanded, setIsExpanded] = useState(false)

  const upcomingClips = timeline.clips
    .filter((clip) => clip.startTime >= timeline.playheadPosition)
    .sort((a, b) => a.startTime - b.startTime)
    .slice(0, 5)

  const currentClips = timeline.clips.filter((clip) => {
    const endTime = clip.startTime + clip.duration
    return (
      clip.startTime <= timeline.playheadPosition &&
      timeline.playheadPosition < endTime
    )
  })

  const handleSwitchToDAW = () => {
    setTheme('daw')
    onSwitchToDAW?.()
  }

  if (timeline.clips.length === 0) {
    return null // Don't show if no clips
  }

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--flowcore-colour-border)] bg-[var(--flowcore-overlay-strong)]/95 backdrop-blur-sm"
      initial={{ y: isExpanded ? 0 : 'calc(100% - 48px)' }}
      animate={{ y: isExpanded ? 0 : 'calc(100% - 48px)' }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      style={{
        height: isExpanded ? '240px' : '48px',
      }}
    >
      {/* Collapsed Header */}
      <div className="flex h-12 items-centre justify-between px-4">
        <div className="flex items-centre gap-3">
          {/* Expand/Collapse button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded p-1 text-[var(--flowcore-colour-fg)]/70 transition-colours hover:bg-[var(--flowcore-colour-fg)]/10 hover:text-[var(--flowcore-colour-fg)]"
            title={isExpanded ? 'Collapse timeline' : 'Expand timeline'}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlayback}
            className="rounded p-1.5 text-[var(--flowcore-colour-fg)] transition-colours hover:bg-[var(--flowcore-colour-accent)]/10 hover:text-[var(--flowcore-colour-accent)]"
            title={timeline.isPlaying ? 'Pause' : 'Play'}
          >
            {timeline.isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>

          {/* Current info */}
          <div className="font-mono text-xs text-[var(--flowcore-colour-fg)]/70">
            {currentClips.length > 0 ? (
              <span className="text-[var(--flowcore-colour-accent)]">
                Playing: {currentClips[0].name}
              </span>
            ) : (
              <span>{upcomingClips.length} upcoming clips</span>
            )}
          </div>
        </div>

        {/* Switch to DAW button */}
        <button
          onClick={handleSwitchToDAW}
          className="flex items-centre gap-2 rounded border border-[var(--flowcore-colour-accent)] px-3 py-1 font-mono text-xs text-[var(--flowcore-colour-accent)] transition-colours hover:bg-[var(--flowcore-colour-accent)]/10"
        >
          <Maximize2 size={12} />
          Open Timeline
        </button>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="h-[calc(100%-48px)] overflow-y-auto p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            {/* Progress bar */}
            <div className="mb-4">
              <div className="mb-1 flex items-centre justify-between font-mono text-xs text-[var(--flowcore-colour-fg)]/70">
                <span>Progress</span>
                <span>
                  {formatTime(timeline.playheadPosition)} / {formatTime(timeline.duration)}
                </span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-[var(--flowcore-colour-border)]">
                <motion.div
                  className="h-full bg-[var(--flowcore-colour-accent)]"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(timeline.playheadPosition / timeline.duration) * 100}%`,
                  }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>

            {/* Upcoming clips */}
            <div>
              <h3 className="mb-2 font-mono text-xs font-semibold uppercase text-[var(--flowcore-colour-fg)]/70">
                Upcoming Clips
              </h3>
              <div className="space-y-2">
                {upcomingClips.length === 0 ? (
                  <p className="font-mono text-xs text-[var(--flowcore-colour-fg)]/50">
                    No upcoming clips
                  </p>
                ) : (
                  upcomingClips.map((clip) => (
                    <motion.div
                      key={clip.id}
                      className="flex items-centre gap-3 rounded-lg bg-[var(--flowcore-overlay-soft)] p-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.24 }}
                    >
                      <div
                        className="h-8 w-1 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: clip.colour }}
                      />
                      <div className="flex-1">
                        <p className="font-mono text-xs font-medium text-[var(--flowcore-colour-fg)]">
                          {clip.name}
                        </p>
                        <p className="font-mono text-[10px] text-[var(--flowcore-colour-fg)]/50">
                          Starts at {formatTime(clip.startTime)}
                        </p>
                      </div>
                      {clip.cardLinks.length > 0 && (
                        <div className="rounded bg-[var(--flowcore-colour-accent)]/20 px-2 py-0.5 font-mono text-[10px] text-[var(--flowcore-colour-accent)]">
                          {clip.cardLinks.length} card{clip.cardLinks.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
