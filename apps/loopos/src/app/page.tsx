'use client'

import { useEffect, useState } from 'react'
import { useLoopStore } from '@/state/loopStore'
import { useNotesStore } from '@/state/notesStore'
import { useMomentumStore } from '@/state/momentumStore'
import { fetchNodes } from '@/lib/syncNodes'
import { fetchNotes } from '@/lib/syncNotes'
import { fetchMomentum } from '@/lib/syncMomentum'
import { MomentumMeter } from '@/components/MomentumMeter'
import { DailyActions } from '@/components/DailyActions'
import { NotesList } from '@/components/NotesList'
import { LoopInsights } from '@/components/LoopInsights'
import { LoopCanvas } from '@/components/LoopCanvas'
import type { AgentAction } from '@/agents/types'
import type { LoopInsight } from '@/insights/LoopInsightsEngine'

export default function HomePage() {
  const { nodes, syncState } = useLoopStore()
  const { notes } = useNotesStore()
  const { momentum } = useMomentumStore()

  const [dailyActions, setDailyActions] = useState<AgentAction[]>([])
  const [loopInsights, setLoopInsights] = useState<LoopInsight[]>([])
  const [isLoadingActions, setIsLoadingActions] = useState(false)
  const [isLoadingInsights, setIsLoadingInsights] = useState(false)

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchNodes(), fetchNotes(), fetchMomentum()])
    }
    loadData()
  }, [])

  // Generate daily actions when data is loaded
  useEffect(() => {
    if (nodes.length > 0 && momentum && dailyActions.length === 0) {
      handleRegenerateActions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length, momentum])

  // Generate insights when data is loaded
  useEffect(() => {
    if (nodes.length > 0 && loopInsights.length === 0) {
      handleRegenerateInsights()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length])

  const handleRegenerateActions = async () => {
    setIsLoadingActions(true)
    try {
      const response = await fetch('/api/ai/daily-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user-id', // TODO: Replace with actual auth
        },
        body: JSON.stringify({
          nodes,
          momentum,
        }),
      })

      if (response.ok) {
        const { actions } = await response.json()
        setDailyActions(actions)
      }
    } catch (error) {
      console.error('Error generating daily actions:', error)
    } finally {
      setIsLoadingActions(false)
    }
  }

  const handleRegenerateInsights = async () => {
    setIsLoadingInsights(true)
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user-id', // TODO: Replace with actual auth
        },
        body: JSON.stringify({
          nodes,
          notes,
          momentum,
        }),
      })

      if (response.ok) {
        const { insights } = await response.json()
        setLoopInsights(insights)
      }
    } catch (error) {
      console.error('Error generating insights:', error)
    } finally {
      setIsLoadingInsights(false)
    }
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-[1800px]">
        {/* Header */}
        <header className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <h1 className="text-4xl font-bold">LoopOS</h1>
            <div className="flex items-center gap-2 text-sm text-foreground/50">
              {syncState === 'syncing' && (
                <>
                  <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-500" />
                  Syncing...
                </>
              )}
              {syncState === 'synced' && (
                <>
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Synced
                </>
              )}
              {syncState === 'error' && (
                <>
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  Error
                </>
              )}
            </div>
          </div>
          <p className="text-lg text-foreground/70">
            Phase 2: Intelligence + Persistence
          </p>
        </header>

        {/* Two-column responsive layout */}
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Left column - Canvas and Actions */}
          <div className="space-y-6">
            {/* Loop Canvas */}
            <div className="h-[500px] lg:h-[600px]">
              <LoopCanvas />
            </div>

            {/* Daily Actions */}
            <DailyActions
              actions={dailyActions}
              onRegenerate={handleRegenerateActions}
              isLoading={isLoadingActions}
            />
          </div>

          {/* Right column - Momentum, Insights, Notes */}
          <div className="space-y-6">
            {/* Momentum Meter */}
            <MomentumMeter />

            {/* Loop Insights */}
            <LoopInsights
              insights={loopInsights}
              isLoading={isLoadingInsights}
            />

            {/* Notes List */}
            <NotesList />
          </div>
        </div>

        {/* Quick stats footer */}
        <footer className="mt-8 rounded-lg border border-foreground/10 bg-background/50 p-4">
          <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
            <div>
              <div className="text-2xl font-bold text-accent">{nodes.length}</div>
              <div className="text-xs text-foreground/50">Total Nodes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">
                {nodes.filter((n: any) => n.status === 'active').length}
              </div>
              <div className="text-xs text-foreground/50">Active</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">{notes.length}</div>
              <div className="text-xs text-foreground/50">Notes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">
                {momentum?.momentum || 0}
              </div>
              <div className="text-xs text-foreground/50">Momentum</div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
