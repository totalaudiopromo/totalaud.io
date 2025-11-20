'use client'

import React from 'react'
import { useOptionalMood } from '@/components/mood/useMood'
import { useProjectEngine } from '@/components/projects/useProjectEngine'
import { RitualPanel } from '@/components/rituals/RitualPanel'

export function StudioSidebar() {
  const { currentProject } = useProjectEngine()
  const mood = useOptionalMood()

  const projectName = currentProject?.name ?? 'Untitled project'

  return (
    <aside className="flex min-h-0 flex-col gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/85 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Project studio
          </p>
          <p className="text-[12px] font-semibold text-slate-50">{projectName}</p>
        </div>
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/80">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-400/25 via-sky-500/15 to-fuchsia-500/20 blur-md" />
          <span className="relative text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-100">
            OS
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800/80 bg-slate-950/90 p-3 text-[11px] text-slate-200">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Mood preview
          </p>
          {mood && (
            <span className="rounded-full bg-slate-900/90 px-2 py-[1px] text-[9px] uppercase tracking-[0.2em] text-slate-100">
              {mood.mood}
            </span>
          )}
        </div>
        {mood ? (
          <div className="mt-2 space-y-1 text-[10px] text-slate-400">
            <div className="flex items-center justify-between">
              <span>Score</span>
              <span className="tabular-nums text-slate-100">
                {(mood.score * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Loop momentum</span>
              <span className="tabular-nums text-slate-100">
                {(mood.loopMomentum * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-[10px] text-slate-500">
            Mood engine will wake up as you start working with agents and loops.
          </p>
        )}
      </div>

      <div className="mt-1">
        <RitualPanel variant="compact" title="Today’s studio rituals" />
      </div>
    </aside>
  )
}


