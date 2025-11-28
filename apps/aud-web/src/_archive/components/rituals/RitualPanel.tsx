'use client'

import React from 'react'
import { useOptionalDemo } from '@/components/demo/DemoOrchestrator'
import { useOS } from '@/components/os/navigation'
import { useRituals } from './useRituals'

interface RitualPanelProps {
  title?: string
  variant?: 'default' | 'compact'
}

export function RitualPanel({ title = "Today's rituals", variant = 'default' }: RitualPanelProps) {
  const demo = useOptionalDemo()
  const { setOS } = useOS()
  const { dailyRituals, isLoading, generateDailyRituals } = useRituals()

  const isDemoMode =
    demo?.isDemoMode || (typeof window !== 'undefined' && (window as any).__TA_DEMO__ === true)

  const showRegenerate = !isDemoMode

  if (variant === 'compact') {
    return (
      <div className="rounded-xl border border-slate-800/70 bg-slate-950/80 p-3 shadow-[0_16px_40px_rgba(0,0,0,0.85)]">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Rituals
            </p>
            <p className="text-xs text-slate-200">{title}</p>
          </div>
          {showRegenerate && (
            <button
              type="button"
              onClick={() => generateDailyRituals()}
              disabled={isLoading}
              className="inline-flex items-center rounded-full border border-slate-700/70 bg-slate-900/80 px-2 py-[3px] text-[10px] font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800/80 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500"
            >
              {isLoading ? 'Refreshing…' : 'Refresh'}
            </button>
          )}
        </div>
        <div className="space-y-2">
          {dailyRituals.length === 0 && !isLoading && (
            <p className="text-[11px] text-slate-400">
              No rituals yet.{' '}
              {showRegenerate
                ? 'Tap refresh to spin up a small stack.'
                : 'Demo mode uses a fixed Lana script.'}
            </p>
          )}
          {dailyRituals.map((ritual) => (
            <button
              key={ritual.id}
              type="button"
              onClick={() => setOS(ritual.os)}
              className="group flex w-full items-start justify-between gap-2 rounded-lg border border-slate-800/80 bg-slate-950/80 px-2 py-2 text-left text-[11px] text-slate-200 transition hover:border-slate-600 hover:bg-slate-900/80"
            >
              <div className="flex-1">
                <p className="font-medium text-slate-100 group-hover:text-slate-50">
                  {ritual.title}
                </p>
                <p className="mt-[2px] text-[10px] leading-snug text-slate-400 line-clamp-3">
                  {ritual.description}
                </p>
              </div>
              <span className="ml-1 mt-[2px] inline-flex shrink-0 items-center rounded-full border border-slate-700/80 bg-slate-900/80 px-2 py-[1px] text-[9px] uppercase tracking-[0.16em] text-slate-300">
                Open OS
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-800/70 bg-slate-950/80 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.9)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Daily rituals
          </p>
          <p className="text-xs font-medium text-slate-100">{title}</p>
          <p className="mt-[2px] text-[11px] text-slate-400">
            Lightweight prompts that keep your project moving instead of stalling.
          </p>
        </div>
        {showRegenerate && (
          <button
            type="button"
            onClick={() => generateDailyRituals()}
            disabled={isLoading}
            className="inline-flex items-center rounded-full border border-slate-700/70 bg-slate-900/80 px-3 py-[5px] text-[11px] font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-800/80 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500"
          >
            {isLoading ? 'Regenerating…' : 'Regenerate'}
          </button>
        )}
      </div>
      <div className="space-y-3">
        {dailyRituals.length === 0 && !isLoading && (
          <div className="rounded-xl border border-dashed border-slate-700/70 bg-slate-950/70 px-3 py-2 text-[11px] text-slate-400">
            {showRegenerate
              ? 'No rituals for today yet. Hit Regenerate to spin up a small, focused stack.'
              : 'Demo mode is using a fixed Lana ritual stack so nothing blows up mid-tour.'}
          </div>
        )}
        {dailyRituals.map((ritual) => (
          <div
            key={ritual.id}
            className="group rounded-xl border border-slate-800/80 bg-gradient-to-r from-slate-950/90 via-slate-950/80 to-slate-900/80 p-[1px] transition hover:border-slate-600/90"
          >
            <div className="flex items-start justify-between gap-3 rounded-[0.9rem] bg-slate-950/90 px-3 py-2.5">
              <div className="flex-1">
                <p className="text-[12px] font-semibold text-slate-50 group-hover:text-slate-100">
                  {ritual.title}
                </p>
                <p className="mt-1 text-[11px] leading-snug text-slate-300">{ritual.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setOS(ritual.os)}
                className="mt-[2px] inline-flex shrink-0 items-center rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-[5px] text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-100 transition hover:border-slate-400 hover:bg-slate-800/80"
              >
                Open OS
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
