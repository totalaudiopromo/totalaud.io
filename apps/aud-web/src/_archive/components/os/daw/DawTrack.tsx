'use client'

import React from 'react'
import { useReducedMotion } from 'framer-motion'
import { DawClip } from './DawClip'

type DawTrackVariant = 'creative' | 'promo' | 'analysis' | 'refine'

interface DawTrackProps {
  name: string
  variant: DawTrackVariant
  clips: {
    id: string
    label: string
    loopOSReady: boolean
  }[]
  selectedClipId?: string | null
  onSelectClip?: (id: string) => void
}

const variantTint: Record<DawTrackVariant, string> = {
  creative: 'from-cyan-500/10 via-sky-500/5 to-slate-900/0',
  promo: 'from-amber-500/12 via-orange-500/6 to-slate-900/0',
  analysis: 'from-fuchsia-500/12 via-violet-500/6 to-slate-900/0',
  refine: 'from-blue-500/12 via-sky-500/6 to-slate-900/0',
}

export function DawTrack({ name, variant, clips, selectedClipId, onSelectClip }: DawTrackProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="relative flex h-[104px] items-stretch border-b border-slate-900/80 px-4 last:border-b-0">
      {/* Lane tint */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${variantTint[variant]} opacity-80`}
      />

      {/* Track header */}
      <div className="relative z-10 flex w-40 flex-col justify-center pr-4">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(58,169,190,0.9)]" />
          <p className="truncate text-xs font-medium text-slate-100/90">{name}</p>
        </div>
        <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-slate-500">
          {variant === 'creative'
            ? 'Ideas lane'
            : variant === 'promo'
              ? 'Campaign lane'
              : variant === 'analysis'
                ? 'Insight lane'
                : 'Refinement lane'}
        </p>
      </div>

      {/* Clip area */}
      <div className="relative z-10 flex flex-1 items-center gap-3">
        {clips.map((clip) => (
          <DawClip
            key={clip.id}
            label={clip.label}
            variant={variant}
            isSelected={selectedClipId === clip.id}
            loopOSReady={clip.loopOSReady}
            onSelect={() => onSelectClip?.(clip.id)}
          />
        ))}
        {!prefersReducedMotion && clips.length === 0 && (
          <DawClip label="Empty lane" variant={variant} />
        )}
      </div>
    </div>
  )
}
