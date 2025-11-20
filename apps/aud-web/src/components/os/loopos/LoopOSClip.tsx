'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useThemeAudio } from '@/hooks/useThemeAudio'
import type { LoopOSLane } from './useLoopOSLocalStore'
import type { SequencedClip } from './engines/sequenceEngine'

interface LoopOSClipProps {
  clip: SequencedClip
  unitWidth: number
  zoom: number
  onChangePosition: (id: string, start: number) => void
  onChangeLength: (id: string, start: number, length: number) => void
  onSelect: (id: string) => void
  onToggleLoopOSReady: (id: string) => void
  isSelected: boolean
  isActive: boolean
  conflict: boolean
  conflictReasons: string[]
  blockedByReasons: string[]
}

const MIN_CLIP_UNITS = 1

const laneColorClasses: Record<LoopOSLane, string> = {
  creative: 'from-cyan-400/80 via-sky-400/80 to-cyan-300/90',
  action: 'from-emerald-400/80 via-emerald-500/80 to-green-300/90',
  promo: 'from-amber-400/85 via-orange-400/80 to-amber-300/95',
  analysis: 'from-violet-400/80 via-fuchsia-400/80 to-indigo-300/90',
  refine: 'from-sky-400/80 via-blue-400/80 to-indigo-300/90',
}

export function LoopOSClip({
  clip,
  unitWidth,
  zoom,
  onChangePosition,
  onChangeLength,
  onSelect,
  onToggleLoopOSReady,
  isSelected,
  isActive,
  conflict,
  conflictReasons,
  blockedByReasons,
}: LoopOSClipProps) {
  const { play } = useThemeAudio()
  const prefersReducedMotion = useReducedMotion()
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const startUnitsRef = useRef(clip.start)
  const lengthUnitsRef = useRef(clip.length)

  useEffect(() => {
    startUnitsRef.current = clip.start
    lengthUnitsRef.current = clip.length
  }, [clip.start, clip.length])

  useEffect(() => {
    if (!isDragging && !isResizing) return

    const handlePointerMove = (event: PointerEvent) => {
      const scale = unitWidth * zoom
      if (!scale) return

      const deltaUnits = event.movementX / scale
      const currentStart = startUnitsRef.current
      const currentLength = lengthUnitsRef.current

      if (isDragging) {
        const nextStart = Math.max(0, currentStart + deltaUnits)
        startUnitsRef.current = nextStart
        onChangePosition(clip.id, nextStart)
      } else if (isResizing === 'left') {
        const nextStart = Math.max(0, currentStart + deltaUnits)
        const nextLength = Math.max(MIN_CLIP_UNITS, currentLength + (currentStart - nextStart))
        startUnitsRef.current = nextStart
        lengthUnitsRef.current = nextLength
        onChangeLength(clip.id, nextStart, nextLength)
      } else if (isResizing === 'right') {
        const nextLength = Math.max(MIN_CLIP_UNITS, currentLength + deltaUnits)
        lengthUnitsRef.current = nextLength
        onChangeLength(clip.id, currentStart, nextLength)
      }
    }

    const handlePointerUp = () => {
      setIsDragging(false)
      setIsResizing(null)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [clip.id, isDragging, isResizing, onChangeLength, onChangePosition, unitWidth, zoom])

  const width = clip.length * unitWidth * zoom
  const left = clip.start * unitWidth * zoom

  const handleClick = () => {
    play('click')
    onSelect(clip.id)
  }

  const handleDoubleClick = () => {
    onToggleLoopOSReady(clip.id)
  }

  const hasBlocked = blockedByReasons.length > 0
  const hasConflict = conflict
  const shouldShowTooltip = isHovered && !isDragging && !isResizing && (hasConflict || hasBlocked)

  return (
    <motion.div
      className={`group absolute top-3 flex h-[72px] cursor-pointer items-center rounded-xl border px-3 text-[11px] text-slate-50 shadow-[0_0_0_1px_rgba(15,23,42,0.9)] ${
        isSelected
          ? 'border-[#3AA9BE]/90 bg-slate-900/95 shadow-[0_0_0_1px_rgba(58,169,190,0.95),0_0_28px_rgba(58,169,190,0.55)]'
          : conflict
            ? 'border-red-500/80 bg-slate-900/95 shadow-[0_0_0_1px_rgba(239,68,68,0.7),0_0_24px_rgba(127,29,29,0.5)] ring-1 ring-red-500/40 ring-offset-2 ring-offset-slate-950'
            : 'border-slate-700/80 bg-slate-900/95'
      } ${isActive ? 'ring-1 ring-[#3AA9BE] ring-offset-2 ring-offset-slate-950' : ''}`}
      style={{ width, left }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              boxShadow:
                '0 0 0 1px rgba(58,169,190,0.9), 0 16px 40px rgba(15,23,42,0.9), 0 0 36px rgba(58,169,190,0.9)',
            }
      }
      whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
      transition={{ type: 'tween', duration: 0.18 }}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-[2px] rounded-[0.9rem] bg-gradient-to-br ${laneColorClasses[clip.lane]}`}
        style={{
          mixBlendMode: 'screen',
          opacity: clip.loopOSReady ? 0.8 : 0.45,
        }}
      />

      <div className="relative z-10 flex w-full items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            aria-label="Drag clip"
            className="flex h-10 w-7 shrink-0 cursor-grab flex-col items-center justify-center gap-[3px] rounded-lg border border-slate-700/80 bg-slate-950/90 text-slate-400 active:cursor-grabbing"
            onPointerDown={(event) => {
              event.preventDefault()
              event.stopPropagation()
              setIsDragging(true)
            }}
          >
            <span className="h-[1px] w-4 bg-slate-500/80" />
            <span className="h-[1px] w-4 bg-slate-500/80" />
            <span className="h-[1px] w-4 bg-slate-500/80" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-[11px] font-semibold tracking-[0.16em] uppercase text-slate-50/95">
                {clip.name}
              </span>
              {clip.loopOSReady && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-[1px] text-[9px] uppercase tracking-[0.22em] text-emerald-200">
                  <span className="h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                  ▣ LoopOS ∞
                </span>
              )}
            </div>
            <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-slate-200/80">
              {clip.notes || 'Notes for this loop segment will show here.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-slate-700/70 bg-slate-950/80 px-2 py-[2px] text-[9px] uppercase tracking-[0.22em] text-slate-300">
            {clip.lane}
          </span>

          {conflict && (
            <span className="rounded-full border border-red-500/70 bg-red-500/15 px-2 py-[1px] text-[9px] uppercase tracking-[0.22em] text-red-200">
              Conflict
            </span>
          )}

          {hasBlocked && (
            <span className="relative inline-flex h-3 w-3 items-center justify-center">
              <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.7)]" />
            </span>
          )}

          <div className="flex items-center gap-1 text-[10px] text-slate-300/90">
            <span className="tabular-nums">{clip.start.toFixed(1)}</span>
            <span className="text-slate-500">→</span>
            <span className="tabular-nums">{(clip.start + clip.length).toFixed(1)}</span>
          </div>

          <button
            type="button"
            aria-label="Resize left"
            className="flex h-10 w-3 cursor-ew-resize items-center justify-center rounded-md border border-slate-700/80 bg-slate-950/90 text-slate-300 hover:border-[#3AA9BE]/80"
            onPointerDown={(event) => {
              event.preventDefault()
              event.stopPropagation()
              setIsResizing('left')
            }}
          >
            <span className="h-4 w-[1px] bg-slate-300/80" />
          </button>

          <button
            type="button"
            aria-label="Resize right"
            className="flex h-10 w-3 cursor-ew-resize items-center justify-center rounded-md border border-slate-700/80 bg-slate-950/90 text-slate-300 hover:border-[#3AA9BE]/80"
            onPointerDown={(event) => {
              event.preventDefault()
              event.stopPropagation()
              setIsResizing('right')
            }}
          >
            <span className="h-4 w-[1px] bg-slate-300/80" />
          </button>
        </div>
      </div>

      {shouldShowTooltip && (
        <motion.div
          className="pointer-events-none absolute -top-8 left-2 z-20 rounded-sm border border-[#3AA9BE] bg-[#0F1113] px-2 py-1 text-[10px] text-slate-100/90 shadow-[0_0_8px_rgba(58,169,190,0.3)]"
          initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.97, y: 2 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 2 }}
          transition={{ type: 'tween', duration: 0.16 }}
        >
          <div className="space-y-[2px]">
            {hasConflict && (
              <p className="whitespace-nowrap">
                <span className="mr-1">⚠ Conflicts with:</span>
                <span className="font-medium">
                  {conflictReasons.length ? conflictReasons.join(', ') : 'other clips in this lane'}
                </span>
              </p>
            )}
            {hasBlocked && (
              <p className="whitespace-nowrap">
                <span className="mr-1">🔒 Blocked by:</span>
                <span className="font-medium">{blockedByReasons.join(', ')}</span>
              </p>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
