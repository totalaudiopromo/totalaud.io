'use client'

import { PageHeader } from '@/components/PageHeader'
import { Play, History, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { skillRegistry } from '@/agents-sdk/registry'
import { registerBuiltInSkills } from '@/agents-sdk/skills'
import type { AgentSkill } from '@/agents-sdk/types'

export default function AgentsPage() {
  const [skills, setSkills] = useState<AgentSkill[]>([])
  const [selectedSkill, setSelectedSkill] = useState<AgentSkill | null>(null)
  const [inputJson, setInputJson] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<string>('')

  useEffect(() => {
    // Register built-in skills
    registerBuiltInSkills()
    setSkills(skillRegistry.listSkills())
  }, [])

  const runSkill = async () => {
    if (!selectedSkill) return

    setIsRunning(true)
    setResult('')

    try {
      const input = JSON.parse(inputJson)

      const response = await fetch('/api/agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId: selectedSkill.id,
          input,
        }),
      })

      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsRunning(false)
    }
  }

  const selectSkill = (skill: AgentSkill) => {
    setSelectedSkill(skill)
    // Set example input based on skill
    const exampleInputs: Record<string, unknown> = {
      generateNodesSkill: {
        brief: 'Radio campaign for indie rock single',
        goals: ['BBC Radio 6', 'Regional stations'],
        timeHorizon: '6 weeks',
      },
      coachDailyPlanSkill: {
        momentum: 75,
        availabilityHours: 3,
      },
    }
    setInputJson(JSON.stringify(exampleInputs[skill.id] || {}, null, 2))
    setResult('')
  }

  return (
    <div className="min-h-screen bg-matte-black">
      <PageHeader
        title="Agent Workbench"
        description="Test and run agent skills"
        action={
          <Link
            href="/agents/history"
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colours"
          >
            <History className="w-4 h-4" />
            View History
          </Link>
        }
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Skills List */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-white mb-4">Available Skills</h2>
            <div className="space-y-2">
              {skills.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => selectSkill(skill)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedSkill?.id === skill.id
                      ? 'bg-slate-cyan/10 border-slate-cyan'
                      : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <h3 className="text-sm font-medium text-white">{skill.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{skill.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded">
                      {skill.category}
                    </span>
                    {skill.estimatedDuration && (
                      <span className="text-xs text-gray-500">
                        ~{(skill.estimatedDuration / 1000).toFixed(1)}s
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Skill Runner */}
          <div className="lg:col-span-2">
            {selectedSkill ? (
              <div className="space-y-4">
                {/* Skill Info */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-white">{selectedSkill.name}</h2>
                      <p className="text-sm text-gray-400 mt-1">{selectedSkill.description}</p>
                    </div>
                    <a
                      href="#"
                      className="text-slate-cyan hover:text-slate-cyan/80 transition-colours"
                      title="View documentation"
                    >
                      <BookOpen className="w-5 h-5" />
                    </a>
                  </div>
                  <div className="flex gap-3 text-xs text-gray-500">
                    <span>Category: {selectedSkill.category}</span>
                    {selectedSkill.estimatedDuration && (
                      <span>Duration: ~{(selectedSkill.estimatedDuration / 1000).toFixed(1)}s</span>
                    )}
                    {selectedSkill.costEstimate?.tokens && (
                      <span>Tokens: ~{selectedSkill.costEstimate.tokens}</span>
                    )}
                  </div>
                </div>

                {/* Input Form */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-white mb-3">Input (JSON)</h3>
                  <textarea
                    value={inputJson}
                    onChange={(e) => setInputJson(e.target.value)}
                    className="w-full h-64 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-slate-cyan resize-none"
                    placeholder='{"key": "value"}'
                  />
                  <button
                    onClick={runSkill}
                    disabled={isRunning || !inputJson.trim()}
                    className="mt-4 flex items-center gap-2 px-6 py-3 bg-slate-cyan hover:bg-slate-cyan/90 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colours"
                  >
                    {isRunning ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Run Skill
                      </>
                    )}
                  </button>
                </div>

                {/* Result */}
                {result && (
                  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                    <h3 className="text-sm font-semibold text-white mb-3">Result</h3>
                    <pre className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-gray-300 font-mono text-xs overflow-x-auto">
                      {result}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-12 text-center">
                <Play className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">Select a skill from the list to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
