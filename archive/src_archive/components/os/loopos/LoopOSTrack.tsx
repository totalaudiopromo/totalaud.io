'use client'

import React from 'react'
import type { LoopOSLane } from './useLoopOSLocalStore'
import type { SequencedClip } from './engines/sequenceEngine'
import { LoopOSClip } from './LoopOSClip'

interface LoopOSTrackProps {
  lane: LoopOSLane
  label: string
  clips: SequencedClip[]
  unitWidth: number
  zoom: number
  selectedClipId: string | null
  playhead: number
  onSelectClip: (id: string) => void
  onChangeClipPosition: (id: string, start: number) => void
  onChangeClipLength: (id: string, start: number, length: number) => void
  onToggleLoopOSReady: (id: string) => void
}

const laneAccent: Record<LoopOSLane, string> = {
  creative: 'bg-cyan-400/80 text-slate-900',
  action: 'bg-emerald-400/80 text-slate-900',
  promo: 'bg-amber-400/80 text-slate-900',
  analysis: 'bg-violet-400/80 text-slate-900',
  refine: 'bg-sky-400/80 text-slate-900',
}

function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd
}

export function LoopOSTrack({
  lane,
  label,
  clips,
  unitWidth,
  zoom,
  selectedClipId,
  playhead,
  onSelectClip,
  onChangeClipPosition,
  onChangeClipLength,
  onToggleLoopOSReady,
}: LoopOSTrackProps) {
  return (
    <div className="relative flex h-[120px] border-b border-slate-800/70 last:border-b-0">
      <div className="flex w-40 shrink-0 flex-col justify-between border-r border-slate-800/70 bg-slate-950/70 px-3 py-2">
        <div>
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
            <span className={`h-4 w-4 rounded-full ${laneAccent[lane]}`} />
            {label}
          </span>
          <p className="mt-1 text-[10px] text-slate-400">
            {lane === 'creative' && 'Ideas, sketches, and hooks.'}
            {lane === 'action' && 'Concrete moves, tasks, and sends.'}
            {lane === 'promo' && 'Campaign bursts, drops, and pushes.'}
            {lane === 'analysis' && 'Check-ins, reporting, and review.'}
            {lane === 'refine' && 'Tightening, polishing, and tweaks.'}
          </p>
        </div>
      </div>

      <div className="relative min-w-0 flex-1 overflow-hidden">
        <div className="relative h-full">
          {clips.map((clip) => {
            const isActive = playhead >= clip.start && playhead < clip.end
            const conflictReasons = clip.conflicts
              ? clips
                  .filter((other) => {
                    if (!other.conflicts || other.id === clip.id) return false
                    return rangesOverlap(clip.start, clip.end, other.start, other.end)
                  })
                  .map((other) => other.name)
              : []

            const blockedByReasons = clip.blockedBy.map((code) => {
              if (code === 'prereq:creative-or-action') {
                return 'Creative or action work earlier in the loop'
              }
              if (code === 'prereq:promo-or-creative') {
                return 'Promo or creative work before analysis'
              }
              return code
            })

            return (
              <LoopOSClip
                key={clip.id}
                clip={clip}
                unitWidth={unitWidth}
                zoom={zoom}
                onChangePosition={onChangeClipPosition}
                onChangeLength={onChangeClipLength}
                onSelect={onSelectClip}
                onToggleLoopOSReady={onToggleLoopOSReady}
                isSelected={clip.id === selectedClipId}
                isActive={isActive}
                conflict={clip.conflicts}
                conflictReasons={conflictReasons}
                blockedByReasons={blockedByReasons}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
