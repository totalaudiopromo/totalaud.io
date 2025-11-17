'use client'

import React, { useRef } from 'react'
import type { LoopOSLane } from './useLoopOSLocalStore'
import type { SequencedClip } from './engines/sequenceEngine'
import { LoopOSTrack } from './LoopOSTrack'
import { LoopOSPlayhead } from './LoopOSPlayhead'

interface LoopOSTimelineProps {
  tracks: LoopOSLane[]
  clips: SequencedClip[]
  selectedClipId: string | null
  playhead: number
  isPlaying: boolean
  zoom: number
  totalUnits: number
  showGrid: boolean
  onSelectClip: (id: string) => void
  onChangeClipPosition: (id: string, start: number) => void
  onChangeClipLength: (id: string, start: number, length: number) => void
  onToggleLoopOSReady: (id: string) => void
  onSeek: (position: number) => void
  onEngineTick: (now: number) => void
  onScrollChange?: (scrollLeft: number, viewportWidth: number) => void
}

const BASE_UNIT_WIDTH = 40
const TRACK_HEIGHT = 120

export function LoopOSTimeline({
  tracks,
  clips,
  selectedClipId,
  playhead,
  isPlaying,
  zoom,
  totalUnits,
  showGrid,
  onSelectClip,
  onChangeClipPosition,
  onChangeClipLength,
  onToggleLoopOSReady,
  onSeek,
  onEngineTick,
  onScrollChange,
}: LoopOSTimelineProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const unitWidth = BASE_UNIT_WIDTH
  const timelineWidth = totalUnits * unitWidth * zoom
  const totalHeight = tracks.length * TRACK_HEIGHT

  const handleScroll: React.UIEventHandler<HTMLDivElement> = (event) => {
    if (!onScrollChange) return
    const target = event.currentTarget
    onScrollChange(target.scrollLeft, target.clientWidth)
  }

  return (
    <div
      ref={scrollRef}
      className="relative min-w-0 flex-1 overflow-auto border-r border-slate-800/80 bg-slate-950/70"
      data-loopos-timeline-scroll-container="true"
      onScroll={handleScroll}
    >
      <div
        className="relative"
        style={{
          minWidth: timelineWidth,
          height: totalHeight,
        }}
      >
        {showGrid && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(15,23,42,0.9) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.75) 1px, transparent 1px)',
              backgroundSize: `${unitWidth * zoom}px ${TRACK_HEIGHT}px`,
              opacity: 0.7,
            }}
          />
        )}

        <LoopOSPlayhead
          isPlaying={isPlaying}
          playhead={playhead}
          unitWidth={unitWidth}
          zoom={zoom}
          height={totalHeight}
          onSeek={onSeek}
          onEngineTick={onEngineTick}
        />

        <div className="relative">
          {tracks.map((lane, index) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={`${lane}-${index}`}
              className="relative"
              style={{ height: TRACK_HEIGHT }}
            >
              <LoopOSTrack
                lane={lane}
                label={
                  lane === 'creative'
                    ? 'Creative'
                    : lane === 'action'
                      ? 'Action'
                      : lane === 'promo'
                        ? 'Promo'
                        : lane === 'analysis'
                          ? 'Analysis'
                          : 'Refine'
                }
                clips={clips.filter((clip) => clip.lane === lane)}
                unitWidth={unitWidth}
                zoom={zoom}
                selectedClipId={selectedClipId}
                playhead={playhead}
                onSelectClip={onSelectClip}
                onChangeClipPosition={onChangeClipPosition}
                onChangeClipLength={onChangeClipLength}
                onToggleLoopOSReady={onToggleLoopOSReady}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


