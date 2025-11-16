'use client'

/**
 * XP OS Page - Liberty Campaign Agents
 * Supports director focus on agent runs
 */

import { useEffect, useState } from 'react'
import { useDirector } from '@/components/demo/director/DirectorProvider'
import { Activity, CheckCircle2, Clock } from 'lucide-react'

interface AgentRun {
  id: string
  agent: string
  prompt: string
  status: 'running' | 'done' | 'pending'
  result?: string
  timestamp: Date
}

const LIBERTY_RUNS: AgentRun[] = [
  {
    id: 'liberty-run-1',
    agent: 'coach',
    prompt: 'Plan UK launch for Liberty Music PR audience',
    status: 'done',
    result: `# Liberty Music PR - UK Launch Strategy

**Phase 1: Pre-Launch (2 weeks)**
- Press release to UK indie blogs and music publications
- Pitch to BBC Introducing shows across regions
- Student radio station outreach (priority universities)
- Social media teaser campaign

**Phase 2: Launch Week**
- Day 1: Spotify release + press embargo lift
- Day 2-3: Student radio interviews and sessions
- Day 4-5: Blog premiere and reviews go live
- Weekend: Social amplification push

**Phase 3: Post-Launch (Weeks 2-4)**
- Playlist pitching: Spotify Editorial, Apple Music, Amazon Music
- Community radio follow-ups
- Live session recordings for online distribution
- Review round-up and social proof compilation

**Key Targets**:
- BBC Introducing (regional shows)
- Amazing Radio
- Top 20 student stations
- Key indie blogs: The Line of Best Fit, DIY, Louder Than War`,
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: 'liberty-run-2',
    agent: 'scout',
    prompt: 'Find similar UK indie artists and their campaigns',
    status: 'done',
    result: `# Similar UK Indie Artist Campaigns

**Reference Artists**:
- Beabadoobee: Student radio to mainstream success
- Alfie Templeman: DIY → major label via BBC Introducing
- Lime Garden: Brighton student scene breakthrough

**Successful Campaign Patterns**:
- Strong regional BBC Introducing presence
- Student radio relationships (especially university cities)
- Live session content (COLORS, Mahogany, etc.)
- TikTok-friendly singles with student appeal

**Playlist Targets**:
- Fresh Finds: Indie (Spotify)
- Breaking Indie (Apple Music)
- BBC Radio 1 Introducing Playlist`,
    timestamp: new Date(Date.now() - 45000),
  },
  {
    id: 'liberty-run-3',
    agent: 'designer',
    prompt: 'Generate campaign visuals matching indie aesthetic',
    status: 'running',
    timestamp: new Date(Date.now() - 20000),
  },
]

export function XPOSPage() {
  const director = useDirector()
  const [runs, setRuns] = useState<AgentRun[]>(LIBERTY_RUNS)
  const [activeRunId, setActiveRunId] = useState<string | null>(null)

  // Register director callback
  useEffect(() => {
    director.engine.setCallbacks({
      onFocusXpAgentRun: () => {
        // Find last completed run
        const lastCompleted = runs.find((run) => run.status === 'done')
        if (lastCompleted) {
          setActiveRunId(lastCompleted.id)
        }
      },
    })
  }, [director, runs])

  const activeRun = runs.find((run) => run.id === activeRunId)

  return (
    <div className="w-full h-full bg-gradient-to-br from-[#3A6EA5] to-[#004E8C] text-white p-8 overflow-auto">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm rounded-t-lg px-4 py-2 mb-4 flex items-centre justify-between">
        <div className="flex items-centre gap-2">
          <Activity className="w-5 h-5" />
          <span className="font-bold">Liberty Campaign — Agent Monitor</span>
        </div>
        <span className="text-xs opacity-60">{runs.length} runs</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Runs list */}
        <div className="lg:col-span-1 space-y-2">
          <h2 className="text-sm font-bold mb-3 opacity-60">CAMPAIGN AGENTS</h2>
          {runs.map((run) => {
            const isActive = run.id === activeRunId

            return (
              <button
                key={run.id}
                onClick={() => setActiveRunId(run.id)}
                className={`
                  w-full text-left p-3 rounded-lg transition-all
                  ${
                    isActive
                      ? 'bg-white/20 border-2 border-white/40 shadow-lg'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }
                `}
              >
                {/* Status icon */}
                <div className="flex items-centre gap-2 mb-2">
                  {run.status === 'done' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                  {run.status === 'running' && (
                    <Clock className="w-4 h-4 text-yellow-400 animate-spin" />
                  )}
                  {run.status === 'pending' && <Clock className="w-4 h-4 text-gray-400" />}
                  <span className="text-xs font-bold uppercase">{run.agent}</span>
                </div>

                {/* Prompt preview */}
                <p className="text-xs opacity-70 line-clamp-2">{run.prompt}</p>

                {/* Timestamp */}
                <p className="text-[10px] opacity-50 mt-1">
                  {run.timestamp.toLocaleTimeString()}
                </p>
              </button>
            )
          })}
        </div>

        {/* Run details */}
        <div className="lg:col-span-2">
          {activeRun ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">{activeRun.agent} Agent</h3>
                  <p className="text-sm opacity-60">{activeRun.prompt}</p>
                </div>
                <div className="flex items-centre gap-2">
                  {activeRun.status === 'done' && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">
                      ✓ Complete
                    </span>
                  )}
                  {activeRun.status === 'running' && (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded">
                      ⏳ Running
                    </span>
                  )}
                </div>
              </div>

              {/* Result */}
              {activeRun.result && (
                <div className="bg-black/20 rounded-lg p-4">
                  <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                    {activeRun.result}
                  </pre>
                </div>
              )}

              {activeRun.status === 'running' && (
                <div className="flex items-centre gap-3 text-sm opacity-60">
                  <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
                    <div className="h-full bg-yellow-400 w-2/3 animate-pulse" />
                  </div>
                  <span>Processing...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/5 rounded-lg p-12 text-centre">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm opacity-60">Select an agent run to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* XP-style taskbar hint */}
      <div className="fixed bottom-0 left-0 right-0 h-10 bg-gradient-to-r from-[#245EDC] to-[#3A8BF5] flex items-centre px-4">
        <div className="flex items-centre gap-2">
          <div className="w-6 h-6 bg-white/20 rounded flex items-centre justify-centre text-xs font-bold">
            L
          </div>
          <span className="text-xs font-bold">Liberty Campaign Monitor</span>
        </div>
      </div>
    </div>
  )
}
