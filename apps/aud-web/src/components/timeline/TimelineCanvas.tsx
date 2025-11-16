'use client'

/**
 * Timeline Canvas
 * Main DAW timeline component with tracks, clips, and playback
 */

import { useRef, useEffect, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { useTimeline, useCampaignMeta, useCards } from '@totalaud/os-state/campaign'
import { TrackRow } from './TrackRow'
import { Playhead } from './Playhead'
import { TimelineRuler } from './TimelineRuler'
import { TimelineControls } from './TimelineControls'
import { useTimelineKeyboards } from './hooks/useTimelineKeyboards'
import { useTimelineZoom } from './hooks/useTimelineZoom'
import { agentRunner } from '@totalaud/agents/runtime'
import { createAgentContext } from '@totalaud/agents/runtime'
import type { TimelineClip } from '@totalaud/os-state/campaign'

interface TimelineCanvasProps {
  className?: string
}

export function TimelineCanvas({ className = '' }: TimelineCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  const {
    timeline,
    addTrack,
    setPlaying,
    togglePlayback,
    setPlayheadPosition,
    addClip,
  } = useTimeline()

  const { meta } = useCampaignMeta()
  const { cards, addCard } = useCards()

  // Track which clips have been activated during this playback session
  const [activatedClips, setActivatedClips] = useState<Set<string>>(new Set())
  const [activeClips, setActiveClips] = useState<Set<string>>(new Set())

  // Keyboard shortcuts
  useTimelineKeyboards({
    onSpacePress: togglePlayback,
    onEscPress: () => setPlaying(false),
  })

  // Zoom handling (Ctrl/Cmd + Wheel)
  useTimelineZoom({ timelineRef })

  // Reset activated clips when playback stops
  useEffect(() => {
    if (!timeline.isPlaying) {
      setActivatedClips(new Set())
      setActiveClips(new Set())
    }
  }, [timeline.isPlaying])

  // Agent execution during playback
  useEffect(() => {
    if (!timeline.isPlaying) return

    const currentPosition = timeline.playheadPosition

    // Find clips that are currently active
    const nowActive = new Set<string>()
    const clipsToActivate: TimelineClip[] = []
    const clipsToComplete: TimelineClip[] = []

    timeline.clips.forEach((clip) => {
      const clipEnd = clip.startTime + clip.duration
      const isActive = currentPosition >= clip.startTime && currentPosition < clipEnd

      if (isActive) {
        nowActive.add(clip.id)

        // If this clip just became active and hasn't been activated yet
        if (!activatedClips.has(clip.id) && clip.agentSource) {
          clipsToActivate.push(clip)
        }
      } else if (activeClips.has(clip.id) && currentPosition >= clipEnd) {
        // Clip just ended
        clipsToComplete.push(clip)
      }
    })

    // Execute newly activated clips
    if (clipsToActivate.length > 0) {
      const context = createAgentContext(
        meta,
        timeline,
        cards,
        meta.currentTheme,
        crypto.randomUUID(),
        { executionMode: 'auto' }
      )

      clipsToActivate.forEach(async (clip) => {
        try {
          await agentRunner.onClipActivated(clip, currentPosition, context)

          // Mark as activated
          setActivatedClips((prev) => new Set(prev).add(clip.id))
        } catch (error) {
          console.error('Agent execution failed:', error)
        }
      })
    }

    // Complete clips that have ended
    if (clipsToComplete.length > 0) {
      clipsToComplete.forEach((clip) => {
        agentRunner.onClipCompleted(clip)
      })
    }

    // Update active clips set
    setActiveClips(nowActive)
  }, [timeline.isPlaying, timeline.playheadPosition, timeline.clips, activatedClips, activeClips, meta, cards])

  // Playback loop
  useEffect(() => {
    if (!timeline.isPlaying) return

    let animationFrameId: number
    let lastTime = Date.now()

    const tick = () => {
      const now = Date.now()
      const deltaSeconds = (now - lastTime) / 1000
      lastTime = now

      setPlayheadPosition(timeline.playheadPosition + deltaSeconds)

      if (timeline.playheadPosition < timeline.duration) {
        animationFrameId = requestAnimationFrame(tick)
      } else {
        setPlaying(false)
      }
    }

    animationFrameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animationFrameId)
  }, [timeline.isPlaying, timeline.playheadPosition, timeline.duration, setPlayheadPosition, setPlaying])

  // Auto-scroll to follow playhead
  useEffect(() => {
    if (!timelineRef.current || !timeline.isPlaying) return

    const playheadPixelPosition = timeline.playheadPosition * timeline.zoom
    const containerWidth = timelineRef.current.offsetWidth
    const scrollLeft = timelineRef.current.scrollLeft

    // Scroll if playhead is near the right edge
    if (playheadPixelPosition > scrollLeft + containerWidth - 100) {
      timelineRef.current.scrollLeft = playheadPixelPosition - containerWidth / 2
    }
  }, [timeline.playheadPosition, timeline.zoom, timeline.isPlaying])

  const handleAddTrack = useCallback(() => {
    const trackNumber = timeline.tracks.length + 1
    addTrack(`Track ${trackNumber}`)
  }, [timeline.tracks.length, addTrack])

  return (
    <div
      ref={containerRef}
      className={`flex h-full flex-col bg-[var(--flowcore-colour-bg)] ${className}`}
    >
      {/* Timeline Controls */}
      <TimelineControls onAddTrack={handleAddTrack} />

      {/* Timeline Ruler */}
      <TimelineRuler />

      {/* Tracks Container */}
      <div
        ref={timelineRef}
        className="relative flex-1 overflow-auto"
        style={{
          scrollbarWidth: 'thin',
        }}
      >
        {/* Track Rows */}
        <div className="relative min-w-full">
          {timeline.tracks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-64 items-centre justify-centre text-[var(--flowcore-colour-fg)]/50"
            >
              <div className="text-centre">
                <p className="mb-2 font-mono text-sm">No tracks yet</p>
                <button
                  onClick={handleAddTrack}
                  className="rounded border border-[var(--flowcore-colour-accent)] px-4 py-2 font-mono text-xs text-[var(--flowcore-colour-accent)] transition-colours hover:bg-[var(--flowcore-colour-accent)]/10"
                >
                  + Add Track
                </button>
              </div>
            </motion.div>
          ) : (
            timeline.tracks
              .sort((a, b) => a.order - b.order)
              .map((track) => (
                <TrackRow key={track.id} track={track} />
              ))
          )}

          {/* Playhead */}
          {timeline.tracks.length > 0 && <Playhead />}
        </div>
      </div>
    </div>
  )
}
