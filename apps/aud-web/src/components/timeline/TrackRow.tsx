'use client'

/**
 * Track Row
 * Displays a single timeline track with its clips
 */

import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import type { TimelineTrack } from '@totalaud/os-state/campaign'
import { useTimeline } from '@totalaud/os-state/campaign'
import { Clip } from './Clip'
import { Volume2, VolumeX, Circle } from 'lucide-react'

interface TrackRowProps {
  track: TimelineTrack
}

export function TrackRow({ track }: TrackRowProps) {
  const { timeline, updateTrack, removeTrack, addClip } = useTimeline()
  const [isHovered, setIsHovered] = useState(false)

  const clips = timeline.clips.filter((clip) => clip.trackId === track.id)

  const handleToggleMute = useCallback(() => {
    updateTrack(track.id, { muted: !track.muted })
  }, [track.id, track.muted, updateTrack])

  const handleToggleSolo = useCallback(() => {
    updateTrack(track.id, { solo: !track.solo })
  }, [track.id, track.solo, updateTrack])

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Add clip at click position
      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const startTime = clickX / timeline.zoom

      addClip({
        trackId: track.id,
        name: `Clip ${clips.length + 1}`,
        startTime,
        duration: 5, // 5 seconds default
        colour: track.colour,
        cardLinks: [],
      })
    },
    [track.id, track.colour, timeline.zoom, clips.length, addClip]
  )

  return (
    <div
      className="group flex border-b border-[var(--flowcore-colour-border)]"
      style={{ height: `${track.height}px` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Track Header */}
      <div
        className="flex w-48 flex-shrink-0 flex-col border-r border-[var(--flowcore-colour-border)] bg-[var(--flowcore-overlay-strong)] px-3 py-2"
        style={{
          opacity: track.muted ? 0.5 : 1,
        }}
      >
        <div className="mb-1 flex items-centre justify-between">
          <input
            type="text"
            value={track.name}
            onChange={(e) => updateTrack(track.id, { name: e.target.value })}
            className="flex-1 bg-transparent font-mono text-xs text-[var(--flowcore-colour-fg)] outline-none"
          />
          <button
            onClick={() => removeTrack(track.id)}
            className="ml-2 opacity-0 transition-opacity group-hover:opacity-50 hover:opacity-100"
          >
            <span className="text-xs text-[var(--flowcore-colour-error)]">×</span>
          </button>
        </div>

        <div className="flex items-centre gap-2">
          {/* Mute button */}
          <button
            onClick={handleToggleMute}
            className={`rounded p-1 transition-colours ${
              track.muted
                ? 'bg-[var(--flowcore-colour-warning)]/20 text-[var(--flowcore-colour-warning)]'
                : 'text-[var(--flowcore-colour-fg)]/50 hover:text-[var(--flowcore-colour-fg)]'
            }`}
            title={track.muted ? 'Unmute' : 'Mute'}
          >
            {track.muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>

          {/* Solo button */}
          <button
            onClick={handleToggleSolo}
            className={`rounded p-1 font-mono text-xs transition-colours ${
              track.solo
                ? 'bg-[var(--flowcore-colour-accent)]/20 text-[var(--flowcore-colour-accent)]'
                : 'text-[var(--flowcore-colour-fg)]/50 hover:text-[var(--flowcore-colour-fg)]'
            }`}
            title={track.solo ? 'Unsolo' : 'Solo'}
          >
            <Circle size={14} fill={track.solo ? 'currentColor' : 'none'} />
          </button>

          {/* Colour indicator */}
          <div
            className="ml-auto h-3 w-3 rounded-full"
            style={{ backgroundColor: track.colour }}
          />
        </div>
      </div>

      {/* Track Timeline Area */}
      <div
        className="relative flex-1"
        onDoubleClick={handleDoubleClick}
        style={{
          width: `${timeline.duration * timeline.zoom}px`,
          minWidth: '100%',
        }}
      >
        {/* Grid lines */}
        <div className="pointer-events-none absolute inset-0">
          {Array.from({
            length: Math.ceil(timeline.duration / timeline.gridSize),
          }).map((_, i) => (
            <div
              key={i}
              className="absolute h-full border-l border-[var(--flowcore-colour-border)]/30"
              style={{
                left: `${i * timeline.gridSize * timeline.zoom}px`,
              }}
            />
          ))}
        </div>

        {/* Clips */}
        {clips.map((clip) => (
          <Clip key={clip.id} clip={clip} trackHeight={track.height} />
        ))}

        {/* Hover hint */}
        {isHovered && clips.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-centre justify-centre font-mono text-xs text-[var(--flowcore-colour-fg)]/30"
          >
            Double-click to add clip
          </motion.div>
        )}
      </div>
    </div>
  )
}
