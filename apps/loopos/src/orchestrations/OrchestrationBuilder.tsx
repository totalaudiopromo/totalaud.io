'use client'

import { useState } from 'react'
import { Plus, Play, Trash2 } from 'lucide-react'
import { nanoid } from 'nanoid'
import type { Orchestration, OrchestrationStep, AgentRole } from '@/types'

interface OrchestrationBuilderProps {
  onSave: (orchestration: Orchestration) => void
}

export function OrchestrationBuilder({ onSave }: OrchestrationBuilderProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [steps, setSteps] = useState<OrchestrationStep[]>([])

  const addStep = () => {
    const newStep: OrchestrationStep = {
      id: nanoid(),
      agentRole: 'create',
      action: '',
      status: 'pending',
      dependsOn: [],
    }
    setSteps([...steps, newStep])
  }

  const updateStep = (id: string, updates: Partial<OrchestrationStep>) => {
    setSteps(steps.map((step) => (step.id === id ? { ...step, ...updates } : step)))
  }

  const removeStep = (id: string) => {
    setSteps(steps.filter((step) => step.id !== id))
  }

  const handleSave = () => {
    if (!name || steps.length === 0) return

    const orchestration: Orchestration = {
      id: nanoid(),
      name,
      description,
      steps,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    onSave(orchestration)

    // Reset form
    setName('')
    setDescription('')
    setSteps([])
  }

  const agentRoles: AgentRole[] = ['create', 'promote', 'analyse', 'refine', 'orchestrate']

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Build Orchestration</h2>
        <p className="text-slate-400">Create multi-agent workflows for complex creative tasks</p>
      </div>

      {/* Name & Description */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Release Campaign"
            className="w-full px-4 py-2 bg-[var(--border)] border border-[var(--border-subtle)] rounded focus:outline-none focus:ring-2 focus:ring-slate-cyan"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this orchestration does..."
            rows={2}
            className="w-full px-4 py-2 bg-[var(--border)] border border-[var(--border-subtle)] rounded focus:outline-none focus:ring-2 focus:ring-slate-cyan resize-none"
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Steps ({steps.length})</h3>
          <button
            onClick={addStep}
            className="flex items-center gap-2 px-4 py-2 bg-slate-cyan/20 hover:bg-slate-cyan/30 text-slate-cyan rounded transition-fast"
          >
            <Plus className="w-4 h-4" />
            Add Step
          </button>
        </div>

        {steps.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-[var(--border)] rounded">
            <p className="text-slate-400">No steps yet. Add your first step to begin.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="p-4 bg-[var(--border)] border border-[var(--border-subtle)] rounded space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-400">Step {index + 1}</span>
                  <button
                    onClick={() => removeStep(step.id)}
                    className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-fast"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Agent Role</label>
                    <select
                      value={step.agentRole}
                      onChange={(e) =>
                        updateStep(step.id, { agentRole: e.target.value as AgentRole })
                      }
                      className="w-full px-3 py-2 bg-matte-black border border-[var(--border)] rounded text-sm focus:outline-none focus:ring-2 focus:ring-slate-cyan"
                    >
                      {agentRoles.map((role) => (
                        <option key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Action</label>
                    <input
                      type="text"
                      value={step.action}
                      onChange={(e) => updateStep(step.id, { action: e.target.value })}
                      placeholder="What should this agent do?"
                      className="w-full px-3 py-2 bg-matte-black border border-[var(--border)] rounded text-sm focus:outline-none focus:ring-2 focus:ring-slate-cyan"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={!name || steps.length === 0}
        className="w-full px-6 py-3 bg-slate-cyan hover:bg-slate-cyan/90 text-white font-semibold rounded transition-fast disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Play className="w-5 h-5" />
        Save & Run Orchestration
      </button>
    </div>
  )
}
