'use client'

import React from 'react'
import { AgentRunList } from '@/components/agents/AgentRunList'
import { AgentRunDetails } from '@/components/agents/AgentRunDetails'
import { useAgentKernel } from '@/components/agents/useAgentKernel'
import { usePersona } from '@/components/persona/usePersona'
import { CompanionPicker } from '@/components/companion/CompanionPicker'
import { RitualPanel } from '@/components/rituals/RitualPanel'

export function CorePanels() {
  const { runs, activeRunId, setActiveRun } = useAgentKernel()
  const persona = usePersona()

  const orderedRuns = [...runs].sort((a, b) => {
    if (a.createdAt === b.createdAt) return 0
    return a.createdAt < b.createdAt ? 1 : -1
  })

  const activeRun = orderedRuns.find((run) => run.id === activeRunId) ?? null

  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)]">
      <div className="space-y-3">
        <RitualPanel />
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/85 p-3">
          <div className="mb-1 flex items-center justify-between text-[11px] text-slate-300">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Agent runs
            </span>
            <span className="text-[10px] text-slate-500">
              {orderedRuns.length.toString().padStart(2, '0')} total
            </span>
          </div>
          <AgentRunList runs={orderedRuns} activeRunId={activeRunId} onSelectRun={setActiveRun} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/85 p-3 text-[11px] text-slate-200">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Persona
              </span>
              <p className="mt-[2px] text-[11px] text-slate-200">
                {persona.persona ? persona.persona.name : 'None'}
              </p>
            </div>
          </div>
          {persona.persona ? (
            <div className="space-y-1 text-[10px] text-slate-300">
              <p className="text-slate-200">{persona.persona.tone}</p>
              {persona.personaTraits.length > 0 && (
                <p className="text-slate-400">Traits: {persona.personaTraits.join(', ')}</p>
              )}
            </div>
          ) : (
            <p className="text-[10px] text-slate-500">
              No persona locked in. Use the ASCII command{' '}
              <span className="font-mono text-emerald-300">persona lana_glass</span> to activate the
              demo persona.
            </p>
          )}
        </div>

        <CompanionPicker />

        <AgentRunDetails run={activeRun} />
      </div>
    </div>
  )
}
