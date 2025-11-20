'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useThemeAudio } from '@/hooks/useThemeAudio'

interface LoopOSToolbarProps {
  isPlaying: boolean
  bpm: number
  zoom: number
  showGrid: boolean
  isSaving?: boolean
  onTogglePlay: () => void
  onBpmChange: (value: number) => void
  onZoomChange: (value: number) => void
  onAddClip: () => void
  onClearSelection: () => void
  onToggleGrid: () => void
}

export function LoopOSToolbar({
  isPlaying,
  bpm,
  zoom,
  showGrid,
  isSaving,
  onTogglePlay,
  onBpmChange,
  onZoomChange,
  onAddClip,
  onClearSelection,
  onToggleGrid,
}: LoopOSToolbarProps) {
  const { play } = useThemeAudio()
  const prefersReducedMotion = useReducedMotion()

  const handleClick = (kind: 'click' | 'success') => {
    play(kind)
  }

  const handlePlayToggle = () => {
    handleClick('click')
    onTogglePlay()
  }

  const handleAddClip = () => {
    handleClick('success')
    onAddClip()
  }

  return (
    <header className="relative z-10 border-b border-slate-800/80 bg-black/60 px-4 py-2 shadow-[0_18px_48px_rgba(0,0,0,0.75)] backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            onClick={handlePlayToggle}
            className={`inline-flex h-8 items-center justify-center rounded-full border px-3 text-[11px] font-semibold tracking-[0.16em] uppercase ${
              isPlaying
                ? 'border-emerald-400/80 bg-emerald-500/20 text-emerald-100'
                : 'border-[#3AA9BE]/80 bg-[#020617] text-[#E5F9FF]'
            }`}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
            transition={{ type: 'tween', duration: 0.16 }}
          >
            <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-[#3AA9BE] shadow-[0_0_12px_rgba(58,169,190,0.95)]" />
            {isPlaying ? 'Stop' : 'Play'}
          </motion.button>

          <div className="flex items-center gap-2 text-[11px] text-slate-300">
            <span className="uppercase tracking-[0.18em] text-slate-400">BPM</span>
            <input
              type="range"
              min={60}
              max={180}
              value={bpm}
              onChange={(event) => onBpmChange(Number(event.target.value))}
              className="h-1 w-32 cursor-pointer rounded-full bg-slate-800 accent-[#3AA9BE]"
            />
            <span className="tabular-nums text-slate-200">{bpm}</span>
          </div>

          <div className="hidden items-center gap-2 text-[11px] text-slate-300 md:flex">
            <span className="uppercase tracking-[0.18em] text-slate-400">Zoom</span>
            <button
              type="button"
              onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-xs text-slate-200 hover:border-[#3AA9BE]/80 hover:text-[#E5F9FF]"
            >
              −
            </button>
            <span className="w-10 text-center tabular-nums text-slate-200">{zoom.toFixed(1)}x</span>
            <button
              type="button"
              onClick={() => onZoomChange(Math.min(2, zoom + 0.1))}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-xs text-slate-200 hover:border-[#3AA9BE]/80 hover:text-[#E5F9FF]"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          {isSaving && (
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-slate-500">
              <span className="inline-flex h-[6px] w-[6px] animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
              saving
            </div>
          )}

          <motion.button
            type="button"
            onClick={handleAddClip}
            className="inline-flex items-center rounded-full border border-[#3AA9BE]/80 bg-[#020617] px-3 py-1 text-[11px] font-medium text-[#E5F9FF] shadow-[0_0_0_1px_rgba(15,23,42,0.9),0_0_22px_rgba(58,169,190,0.65)] hover:border-[#7BD7EB]/80 hover:text-white"
            whileHover={
              prefersReducedMotion
                ? undefined
                : {
                    boxShadow:
                      '0 0 0 1px rgba(58,169,190,0.9), 0 15px 40px rgba(15,23,42,0.95), 0 0 32px rgba(58,169,190,0.85)',
                  }
            }
            whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
            transition={{ type: 'tween', duration: 0.16 }}
          >
            <span className="mr-1 text-base leading-none">+</span>
            Add clip
          </motion.button>

          <button
            type="button"
            onClick={() => {
              handleClick('click')
              onClearSelection()
            }}
            className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-[11px] text-slate-300 hover:border-slate-500 hover:text-slate-50"
          >
            Clear selection
          </button>

          <button
            type="button"
            onClick={() => {
              handleClick('click')
              onToggleGrid()
            }}
            className={`rounded-full border px-3 py-1 text-[11px] ${
              showGrid
                ? 'border-[#3AA9BE]/80 bg-[#020617] text-[#E5F9FF]'
                : 'border-slate-700 bg-slate-900/80 text-slate-400'
            }`}
          >
            Grid {showGrid ? 'on' : 'off'}
          </button>
        </div>
      </div>
    </header>
  )
}
