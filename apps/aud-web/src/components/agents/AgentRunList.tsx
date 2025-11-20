'use client'

import React from 'react'
import type { AgentRun } from './AgentTypes'
import { useAgentKernel } from './useAgentKernel'
import { PERSONA_PRESETS } from '@/components/persona/personaPresets'
import { useOptionalCompanion } from '@/components/companion/useCompanion'
import { getCompanionPreset } from '@/components/companion/companionPresets'

interface AgentRunListProps {
  runs: AgentRun[]
  activeRunId: string | null
  onSelectRun: (id: string) => void
}

function getStatusLabel(status: AgentRun['status']) {
  if (status === 'queued') return 'Queued'
  if (status === 'running') return 'Running'
  if (status === 'done') return 'Done'
  if (status === 'error') return 'Error'
  return 'Idle'
}

function getStatusClasses(status: AgentRun['status']) {
  switch (status) {
    case 'queued':
      return 'bg-slate-300/60 text-slate-700 border-slate-400'
    case 'running':
      return 'bg-amber-100 text-amber-800 border-amber-400'
    case 'done':
      return 'bg-emerald-100 text-emerald-800 border-emerald-400'
    case 'error':
      return 'bg-red-100 text-red-800 border-red-400'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300'
  }
}

function getRoleLabel(role: AgentRun['role']) {
  if (role === 'scout') return 'Scout'
  if (role === 'coach') return 'Coach'
  if (role === 'tracker') return 'Tracker'
  if (role === 'insight') return 'Insight'
  return 'Custom'
}

function getPersonaLabel(run: AgentRun): string | null {
  const personaId = run.meta?.personaId
  if (!personaId) return null
  const preset = PERSONA_PRESETS[personaId as keyof typeof PERSONA_PRESETS]
  return preset?.name ?? null
}

function getCompanionLabel(run: AgentRun): string | null {
  const companionId = run.meta?.companionId ?? null
  if (!companionId) return null
  const preset = getCompanionPreset(companionId as any)
  return preset?.name ?? null
}

export function AgentRunList({ runs, activeRunId, onSelectRun }: AgentRunListProps) {
  const { clearCompletedRuns } = useAgentKernel()
  const companion = useOptionalCompanion()

  if (!runs.length) {
    return (
      <div className="rounded border border-slate-200 bg-white/70 px-3 py-2 text-[11px] text-slate-500">
        No agent runs yet. Trigger an agent from ASCII, LoopOS, Aqua, or Analogue to see activity
        here.
      </div>
    )
  }

  return (
    <div className="space-y-2 text-xs text-slate-800">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-700">Agent runs</span>
        <button
          type="button"
          onClick={clearCompletedRuns}
          className="rounded border border-slate-300 bg-white px-2 py-[2px] text-[10px] text-slate-600 hover:bg-slate-100"
        >
          Clear completed
        </button>
      </div>

      <ul className="max-h-64 space-y-1 overflow-y-auto pr-1">
        {runs.map((run) => {
          const isActive = run.id === activeRunId
          const preview =
            run.input.length > 80 ? `${run.input.slice(0, 77).trimEnd()}…` : run.input || '(empty)'
          const createdAtLabel = new Date(run.createdAt).toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
          })
          const personaLabel = getPersonaLabel(run)
          const companionLabel = getCompanionLabel(run)
          const isActiveCompanionRun =
            companionLabel && companion?.activeCompanionId === run.meta?.companionId

          return (
            <li key={run.id}>
              <button
                type="button"
                onClick={() => onSelectRun(run.id)}
                className={`flex w-full items-start justify-between gap-2 rounded border px-2 py-1 text-left ${
                  isActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 bg-white/80 hover:bg-slate-50'
                }`}
              >
                <div className="flex flex-1 flex-col gap-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-800 px-1.5 py-[1px] text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-50">
                      {getRoleLabel(run.role)}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      from {run.originOS === 'loopos' ? 'LoopOS' : run.originOS}
                    </span>
                    {personaLabel && (
                      <span className="rounded-full bg-slate-200 px-1.5 py-[1px] text-[9px] uppercase tracking-[0.18em] text-slate-700">
                        {personaLabel}
                      </span>
                    )}
                    {companionLabel && (
                      <span
                        className={`rounded-full px-1.5 py-[1px] text-[9px] uppercase tracking-[0.18em] ${
                          isActiveCompanionRun
                            ? 'border border-emerald-400/80 bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        Companion: {companionLabel}
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-2 text-[11px] text-slate-700">{preview}</p>
                  <span className="text-[10px] text-slate-400">{createdAtLabel}</span>
                </div>
                <span
                  className={`mt-0.5 rounded-full border px-2 py-[1px] text-[10px] font-medium ${getStatusClasses(run.status)}`}
                >
                  {getStatusLabel(run.status)}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}


