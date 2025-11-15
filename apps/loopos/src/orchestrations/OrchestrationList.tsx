'use client'

import { useState } from 'react'
import { Play, CheckCircle2, XCircle, Clock, Sparkles } from 'lucide-react'
import { OrchestrationBuilder } from './OrchestrationBuilder'
import { AgentOrchestrator } from '@/agents/AgentOrchestrator'
import type { Orchestration } from '@/types'

export function OrchestrationList() {
  const [orchestrations, setOrchestrations] = useState<Orchestration[]>([])
  const [showBuilder, setShowBuilder] = useState(false)

  const handleSaveOrchestration = async (orchestration: Orchestration) => {
    setOrchestrations([orchestration, ...orchestrations])
    setShowBuilder(false)

    // Optionally run immediately
    // await handleRunOrchestration(orchestration)
  }

  const handleRunOrchestration = async (orchestration: Orchestration) => {
    const updatedOrch: Orchestration = {
      ...orchestration,
      status: 'running',
      updatedAt: new Date(),
    }

    setOrchestrations(
      orchestrations.map((o) => (o.id === orchestration.id ? updatedOrch : o))
    )

    try {
      const orchestrator = new AgentOrchestrator()
      const result = await orchestrator.executeOrchestration(orchestration, {
        userId: 'temp-user-id', // TODO: Replace with real auth
      })

      setOrchestrations(orchestrations.map((o) => (o.id === orchestration.id ? result : o)))
    } catch (error) {
      console.error('Orchestration failed:', error)

      setOrchestrations(
        orchestrations.map((o) =>
          o.id === orchestration.id
            ? { ...o, status: 'error' as const, updatedAt: new Date() }
            : o
        )
      )
    }
  }

  const loadTemplate = (templateName: string) => {
    const template = AgentOrchestrator.getTemplate(templateName)
    const orchestration: Orchestration = {
      ...template,
      id: `template-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setOrchestrations([orchestration, ...orchestrations])
  }

  const statusIcons = {
    draft: <Clock className="w-5 h-5 text-slate-400" />,
    running: <Sparkles className="w-5 h-5 text-slate-cyan animate-pulse" />,
    complete: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
  }

  return (
    <div className="min-h-screen bg-matte-black">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Agent Orchestrations</h1>
            <p className="text-slate-400">Multi-agent workflows for complex creative tasks</p>
          </div>

          <button
            onClick={() => setShowBuilder(!showBuilder)}
            className="px-6 py-3 bg-slate-cyan hover:bg-slate-cyan/90 text-white font-semibold rounded transition-fast"
          >
            {showBuilder ? 'Hide Builder' : 'New Orchestration'}
          </button>
        </div>

        {/* Templates */}
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => loadTemplate('release-planner')}
            className="p-4 bg-[var(--border)] hover:bg-slate-cyan/10 border border-[var(--border-subtle)] rounded text-left transition-fast"
          >
            <h3 className="font-semibold mb-1">Release Planner</h3>
            <p className="text-sm text-slate-400">Complete release strategy</p>
          </button>

          <button
            onClick={() => loadTemplate('pr-cycle')}
            className="p-4 bg-[var(--border)] hover:bg-slate-cyan/10 border border-[var(--border-subtle)] rounded text-left transition-fast"
          >
            <h3 className="font-semibold mb-1">PR Cycle</h3>
            <p className="text-sm text-slate-400">Generate PR campaign</p>
          </button>

          <button
            onClick={() => loadTemplate('30-day-growth')}
            className="p-4 bg-[var(--border)] hover:bg-slate-cyan/10 border border-[var(--border-subtle)] rounded text-left transition-fast"
          >
            <h3 className="font-semibold mb-1">30-Day Growth</h3>
            <p className="text-sm text-slate-400">Sustained growth loop</p>
          </button>
        </div>

        {/* Builder */}
        {showBuilder && (
          <div className="bg-[var(--border)] border border-[var(--border-subtle)] rounded">
            <OrchestrationBuilder onSave={handleSaveOrchestration} />
          </div>
        )}

        {/* Orchestrations List */}
        <div className="space-y-4">
          {orchestrations.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-[var(--border)] rounded">
              <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-4 opacity-50" />
              <p className="text-slate-400">
                No orchestrations yet. Create one or load a template.
              </p>
            </div>
          ) : (
            orchestrations.map((orch) => (
              <div
                key={orch.id}
                className="p-6 bg-[var(--border)] border border-[var(--border-subtle)] rounded"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {statusIcons[orch.status]}
                      <h3 className="text-xl font-bold">{orch.name}</h3>
                      <span className="px-2 py-1 bg-slate-cyan/20 text-slate-cyan rounded text-xs uppercase font-medium">
                        {orch.status}
                      </span>
                    </div>
                    <p className="text-slate-400">{orch.description}</p>
                  </div>

                  {orch.status === 'draft' && (
                    <button
                      onClick={() => handleRunOrchestration(orch)}
                      className="px-4 py-2 bg-slate-cyan/20 hover:bg-slate-cyan/30 text-slate-cyan rounded transition-fast flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Run
                    </button>
                  )}
                </div>

                {/* Steps */}
                <div className="space-y-2">
                  {orch.steps.map((step, i) => (
                    <div
                      key={step.id}
                      className="p-3 bg-matte-black rounded flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">#{i + 1}</span>
                        <span className="px-2 py-1 bg-slate-cyan/10 text-slate-cyan rounded text-xs uppercase">
                          {step.agentRole}
                        </span>
                        <span className="text-sm">{step.action}</span>
                      </div>
                      {statusIcons[step.status]}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
