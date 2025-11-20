'use client'

import React from 'react'

interface LoopCardProps {
  name: string
  createdAtLabel?: string
  momentumScore?: number | null
  clipCount?: number | null
  laneSummary?: string | null
  onOpenLoop: () => void
}

export function LoopCard({
  name,
  createdAtLabel,
  momentumScore,
  clipCount,
  laneSummary,
  onOpenLoop,
}: LoopCardProps) {
  const score = typeof momentumScore === 'number' && momentumScore >= 0 ? momentumScore : null
  const scorePercent = score != null ? Math.round(score * 100) : null

  return (
    <button
      type="button"
      onClick={onOpenLoop}
      className="group flex w-full flex-col items-stretch rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-950/90 via-slate-950/85 to-slate-950/95 p-3 text-left shadow-[0_18px_50px_rgba(0,0,0,0.85)] transition hover:border-emerald-500/70 hover:bg-slate-950/95 hover:shadow-[0_22px_70px_rgba(6,95,70,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold tracking-tight text-slate-50">
            {name}
          </p>
          {createdAtLabel && (
            <p className="mt-[2px] text-[10px] text-slate-500">{createdAtLabel}</p>
          )}
        </div>
        <span className="inline-flex shrink-0 items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-[2px] text-[9px] uppercase tracking-[0.2em] text-emerald-200">
          Loop
        </span>
      </div>

      <div className="mt-3 space-y-2">
        <div className="space-y-[2px]">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Momentum</span>
            <span className="tabular-nums text-slate-200">
              {scorePercent != null ? `${scorePercent}%` : 'n/a'}
            </span>
          </div>
          <div className="h-[7px] overflow-hidden rounded-full bg-slate-900/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 transition-all duration-300"
              style={{
                width: scorePercent != null ? `${Math.min(100, Math.max(0, scorePercent))}%` : '0%',
                opacity: scorePercent != null ? 1 : 0.25,
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>
            Clips{' '}
            <span className="ml-1 rounded-full bg-slate-900/90 px-1.5 py-[1px] text-[10px] font-medium text-slate-100">
              {clipCount != null ? clipCount : '—'}
            </span>
          </span>
          {laneSummary && (
            <span className="inline-flex items-center rounded-full border border-slate-700/80 bg-slate-900/80 px-2 py-[2px] text-[9px] uppercase tracking-[0.2em] text-slate-300">
              {laneSummary}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <span className="inline-block h-[6px] w-[6px] rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.22)]" />
          <span>Open in LoopOS timeline</span>
        </span>
        <span className="text-[11px] font-medium text-emerald-300 group-hover:text-emerald-200">
          Open loop →
        </span>
      </div>
    </button>
  )
}


