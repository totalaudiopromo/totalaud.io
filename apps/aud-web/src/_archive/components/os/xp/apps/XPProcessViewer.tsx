'use client'

import React, { useEffect, useMemo } from 'react'
import { AgentRunList } from '@/components/agents/AgentRunList'
import { AgentRunDetails } from '@/components/agents/AgentRunDetails'
import { useAgentKernel } from '@/components/agents/useAgentKernel'
import { useOptionalDemo } from '@/components/demo/DemoOrchestrator'
import { registerXpController } from '@/components/demo/director/DirectorEngine'
import { useAgentTeams } from '@/components/agents/teams/AgentTeamOrchestrator'

const processes = ['audio.engine', 'xp.window.manager', 'xp.taskbar', 'theme.daemon'] as const

export function XPProcessViewer() {
  const { runs, activeRunId, setActiveRun } = useAgentKernel()
  const demo = useOptionalDemo()
  const isDemoMode =
    demo?.isDemoMode || (typeof window !== 'undefined' && (window as any).__TA_DEMO__ === true)

  const orderedRuns = useMemo(
    () =>
      [...runs].sort((a, b) => {
        if (a.createdAt === b.createdAt) return 0
        return a.createdAt < b.createdAt ? 1 : -1
      }),
    [runs]
  )

  const activeRun = orderedRuns.find((run) => run.id === activeRunId) ?? null

  const { teamRuns } = useAgentTeams()

  const orderedTeamRuns = useMemo(
    () =>
      [...teamRuns].sort((a, b) => {
        if (a.createdAt === b.createdAt) return 0
        return a.createdAt < b.createdAt ? 1 : -1
      }),
    [teamRuns]
  )

  useEffect(() => {
    if (!isDemoMode) {
      registerXpController(null)
      return
    }

    registerXpController({
      focusLastCompletedRun: () => {
        const lastDone = orderedRuns.find((run) => run.status === 'done')
        if (!lastDone) return
        setActiveRun(lastDone.id)
      },
    })

    return () => {
      registerXpController(null)
    }
  }, [isDemoMode, orderedRuns, setActiveRun])

  return (
    <div className="space-y-3 text-xs text-slate-800">
      <p className="text-[11px] text-slate-600">
        XP as control centre. Core OS processes on the left, live agent runs on the right.
      </p>
      <div className="grid gap-3 md:grid-cols-[minmax(0,0.8fr),minmax(0,1.2fr)]">
        <div className="rounded border border-[#cbd5e1] bg-white/80">
          <div className="border-b border-[#e2e8f0] bg-[#e5edf7] px-2 py-1 font-semibold">
            Active processes
          </div>
          <ul className="divide-y divide-[#e2e8f0]">
            {processes.map((name) => (
              <li key={name} className="flex items-center justify-between px-2 py-1">
                <span className="font-mono text-[11px]">{name}</span>
                <span className="rounded-full bg-[#22c55e]/10 px-2 py-0.5 text-[10px] text-[#16a34a]">
                  running
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          {orderedTeamRuns.length > 0 && (
            <div className="rounded border border-[#cbd5e1] bg-white/80 px-3 py-2 text-[11px] text-slate-700">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-semibold text-slate-800">Team runs</span>
                <span className="text-[10px] text-slate-500">
                  {orderedTeamRuns.length} active sequence
                  {orderedTeamRuns.length === 1 ? '' : 's'}
                </span>
              </div>
              <ul className="space-y-1">
                {orderedTeamRuns.slice(0, 4).map((teamRun) => {
                  const totalSteps = teamRun.steps.length
                  const completed = teamRun.steps.filter((step) => step.status === 'done').length
                  const errored = teamRun.steps.some((step) => step.status === 'error')

                  return (
                    <li
                      key={teamRun.teamRunId}
                      className="flex items-center justify-between rounded border border-slate-200 bg-white/70 px-2 py-1"
                    >
                      <div className="flex flex-col">
                        <span className="text-[11px] font-medium text-slate-800">
                          {teamRun.label}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {completed}/{totalSteps} steps complete
                        </span>
                      </div>
                      <span
                        className={`rounded-full border px-2 py-[1px] text-[10px] ${
                          teamRun.status === 'running'
                            ? 'border-sky-400 bg-sky-100 text-sky-800'
                            : teamRun.status === 'done' && !errored
                              ? 'border-emerald-400 bg-emerald-100 text-emerald-800'
                              : 'border-red-400 bg-red-100 text-red-800'
                        }`}
                      >
                        {teamRun.status}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
          <AgentRunList runs={orderedRuns} activeRunId={activeRunId} onSelectRun={setActiveRun} />
          <AgentRunDetails run={activeRun} />
        </div>
      </div>
    </div>
  )
}
