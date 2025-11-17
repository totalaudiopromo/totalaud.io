'use client'

import React, { useMemo } from 'react'
import { useAgentKernel } from '@/components/agents/useAgentKernel'
import { useOptionalMood } from '@/components/mood/useMood'
import { useOS } from '@/components/os/navigation'
import { useOptionalAmbient } from '@/components/ambient/useAmbient'

export function CoreStats() {
  const { runs } = useAgentKernel()
  const mood = useOptionalMood()
  const { history } = useOS()
  const ambient = useOptionalAmbient()

  const activeAgents = runs.filter(
    (run) => run.status === 'queued' || run.status === 'running',
  ).length
  const erroredAgents = runs.filter((run) => run.status === 'error').length

  const osActivityCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    history.forEach((slug) => {
      counts[slug] = (counts[slug] ?? 0) + 1
    })
    return counts
  }, [history])

  const totalTransitions = history.length

  return (
    <div className="space-y-2 rounded-2xl border border-slate-800/80 bg-slate-950/85 p-3 text-[11px] text-slate-200">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Core stats
        </span>
        <span className="rounded-full bg-slate-800 px-2 py-[1px] text-[10px] uppercase tracking-[0.18em] text-slate-100">
          {mood?.mood ?? 'calm'}
        </span>
      </div>

      <div className="mt-1 grid grid-cols-2 gap-2">
        <div className="space-y-[2px]">
          <p className="text-slate-400">Active agents</p>
          <p className="text-sm font-semibold text-emerald-300">{activeAgents}</p>
        </div>
        <div className="space-y-[2px]">
          <p className="text-slate-400">Conflicts</p>
          <p className="text-sm font-semibold text-amber-300">{erroredAgents}</p>
        </div>
        <div className="space-y-[2px]">
          <p className="text-slate-400">Ambient score</p>
          <p className="text-sm font-semibold text-sky-300">
            {ambient ? Math.round(ambient.effectiveIntensity * 100) : 0}
          </p>
        </div>
        <div className="space-y-[2px]">
          <p className="text-slate-400">Transitions</p>
          <p className="text-sm font-semibold text-slate-100">{totalTransitions}</p>
        </div>
      </div>

      <div className="mt-2 border-t border-slate-800/80 pt-2 text-[10px] text-slate-400">
        <p className="mb-1 font-semibold uppercase tracking-[0.18em] text-slate-500">
          OS activity
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(osActivityCounts).map(([slug, count]) => (
            <span
              key={slug}
              className="rounded-full bg-slate-800/80 px-2 py-[1px] text-[10px] uppercase tracking-[0.18em] text-slate-200"
            >
              {slug}: {count}
            </span>
          ))}
          {Object.keys(osActivityCounts).length === 0 && (
            <span className="text-slate-500">No OS transitions yet.</span>
          )}
        </div>
      </div>
    </div>
  )
}


