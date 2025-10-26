'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { FlowCanvas } from './FlowCanvas'
import ConsoleShell from '../../ui/ConsoleShell'
import ThemeToggle from '../../ui/ThemeToggle'
import { AmbientSound } from '../../ui/ambient/AmbientSound'
import { deserializeFlowTemplate } from '@total-audio/core-agent-executor/client'
import type { FlowTemplate } from '@total-audio/core-agent-executor/client'

/**
 * Phase 4: Flow Studio - Main application environment.
 * Wraps existing FlowCanvas + agent status in theme-aware layout.
 */
export function FlowStudio() {
  const searchParams = useSearchParams()
  const [theme, setTheme] = useState<string>('operator')
  const flowParam = searchParams.get('flow')
  const welcomeParam = searchParams.get('welcome')

  // Get theme from localStorage (set during onboarding)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('selected_theme')
      if (savedTheme) {
        setTheme(savedTheme)
      }
    }
  }, [])

  // Deserialize flow template if provided
  let flowTemplate: FlowTemplate | null = null
  if (flowParam) {
    flowTemplate = deserializeFlowTemplate(flowParam)
    console.log('[FlowStudio] Loaded flow template:', flowTemplate?.name)
  }

  return (
    <main className="min-h-screen text-white">
      {/* Theme ambient sound */}
      <AmbientSound type="theme-ambient" theme={theme} autoPlay />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold font-mono lowercase bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
            totalaud.io flow studio
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto font-mono">
            marketing your music should be as creative as making it. visualise and orchestrate agent
            workflows in real time.
          </p>

          {/* Welcome Message (if coming from Broker) */}
          {welcomeParam === 'true' && flowTemplate && (
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4 max-w-2xl mx-auto">
              <div className="text-blue-400 font-medium font-mono lowercase mb-1">
                signal&gt; campaign flow generated
              </div>
              <div className="text-sm text-slate-300 font-mono">
                {flowTemplate.name} — {flowTemplate.description}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="flex items-center justify-center gap-8 text-sm font-mono">
            <div className="flex items-center gap-2">
              <span className="text-green-400">●</span>
              <span className="text-slate-500 lowercase">4 agents active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400">●</span>
              <span className="text-slate-500 lowercase">real-time synchronisation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-400">●</span>
              <span className="text-slate-500 lowercase">console mode ready</span>
            </div>
          </div>
        </div>

        {/* Flow Canvas wrapped in Console Shell */}
        <ConsoleShell title="agent workflow orchestrator" accentColor="#6366f1">
          <div className="h-[70vh]">
            <FlowCanvas initialTemplate={flowTemplate} />
          </div>
        </ConsoleShell>

        {/* Agent Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { name: 'scout', color: '#10b981', status: 'ready' },
            { name: 'coach', color: '#6366f1', status: 'ready' },
            { name: 'tracker', color: '#f59e0b', status: 'ready' },
            { name: 'insight', color: '#8b5cf6', status: 'ready' },
          ].map((agent) => (
            <div
              key={agent.name}
              className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all"
              style={{
                boxShadow: `0 0 20px -10px ${agent.color}20`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: agent.color }} />
                <span
                  className="text-xs px-2 py-1 rounded-full font-mono lowercase"
                  style={{
                    backgroundColor: `${agent.color}20`,
                    color: agent.color,
                  }}
                >
                  {agent.status}
                </span>
              </div>
              <div className="text-white font-medium font-mono lowercase">{agent.name}</div>
              <div className="text-xs text-slate-500 font-mono mt-1 lowercase">
                agent_{agent.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Theme Toggle */}
      <ThemeToggle />
    </main>
  )
}
