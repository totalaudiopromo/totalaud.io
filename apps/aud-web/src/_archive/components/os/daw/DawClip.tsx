'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useThemeAudio } from '@/hooks/useThemeAudio'

type DawClipVariant = 'creative' | 'promo' | 'analysis' | 'refine'

interface DawClipProps {
  label: string
  variant: DawClipVariant
  isSelected?: boolean
  loopOSReady?: boolean
  onSelect?: () => void
}

const variantGradient: Record<DawClipVariant, string> = {
  creative: 'from-cyan-400/70 via-sky-400/70 to-cyan-300/80',
  promo: 'from-amber-400/75 via-orange-400/70 to-amber-300/90',
  analysis: 'from-violet-400/70 via-fuchsia-400/70 to-indigo-300/90',
  refine: 'from-sky-400/70 via-blue-400/70 to-indigo-300/90',
}

export function DawClip({
  label,
  variant,
  isSelected = false,
  loopOSReady = false,
  onSelect,
}: DawClipProps) {
  const { play } = useThemeAudio()
  const prefersReducedMotion = useReducedMotion()

  const handlePress = () => {
    play('click')
  }

  return (
    <motion.div
      className={`group relative flex h-14 min-w-[120px] cursor-pointer items-center rounded-xl border px-3 text-[11px] text-slate-50 shadow-[0_0_0_1px_rgba(15,23,42,0.9)] ${
        isSelected
          ? 'border-cyan-300/90 bg-slate-900 shadow-[0_0_0_1px_rgba(34,211,238,0.95),0_0_28px_rgba(34,211,238,0.55)]'
          : 'border-slate-700/80 bg-slate-900/90'
      }`}
      drag="x"
      dragElastic={prefersReducedMotion ? 0 : 0.2}
      dragMomentum={false}
      onDragStart={handlePress}
      onClick={onSelect}
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              boxShadow:
                '0 0 0 1px rgba(58,169,190,0.9), 0 16px 40px rgba(15,23,42,0.9), 0 0 32px rgba(58,169,190,0.85)',
            }
      }
      whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
      transition={{ type: 'tween', duration: 0.16 }}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-[2px] rounded-[0.75rem] bg-gradient-to-br ${variantGradient[variant]}`}
        style={{ mixBlendMode: 'screen', opacity: loopOSReady ? 0.7 : 0.4 }}
      />

      <div className="relative z-10 flex flex-1 items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-5 items-center gap-[2px]">
            {Array.from({ length: 7 }).map((_v, index) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className="h-3 w-[3px] rounded-sm bg-slate-200/75 group-hover:bg-white/90"
              />
            ))}
          </div>
          <div className="flex flex-col">
            <span className="truncate text-[11px] font-semibold tracking-wide text-slate-50/95">
              {label}
            </span>
            {loopOSReady && (
              <span className="mt-[1px] inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.22em] text-emerald-300/90">
                <span className="h-1 w-1 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                loopos-ready
              </span>
            )}
          </div>
        </div>

        {/* Faux resize handle (visual only) */}
        <motion.div
          className="flex cursor-ew-resize items-center pl-2"
          drag="x"
          dragElastic={prefersReducedMotion ? 0 : 0.15}
          dragMomentum={false}
          onDragStart={handlePress}
        >
          <div className="flex h-5 w-2 flex-col items-center justify-center gap-[2px] rounded-[4px] border border-slate-500/80 bg-slate-900/90 group-hover:border-cyan-300">
            <span className="h-[1px] w-2 bg-slate-300/80 group-hover:bg-cyan-200" />
            <span className="h-[1px] w-2 bg-slate-300/80 group-hover:bg-cyan-200" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
