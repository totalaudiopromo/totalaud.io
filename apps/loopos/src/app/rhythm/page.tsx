'use client'

/**
 * Phase 31: Creative Rhythm System - Rhythm Page
 *
 * Shows creative patterns:
 * - Energy windows (when you're most active)
 * - Return patterns (how often you return)
 * - Mood detection
 * - Calm suggestions
 *
 * Philosophy: Awareness, not productivity. Just helpful patterns.
 */

import { useEffect, useState } from 'react'
import { ActivityChart } from '@/components/rhythm/ActivityChart'
import { EnergyWindowCard } from '@/components/rhythm/EnergyWindowCard'
import { SuggestionsList } from '@/components/rhythm/SuggestionsList'
import { MoodIndicator } from '@/components/rhythm/MoodIndicator'
import type { DailySummary } from '@loopos/db'

interface RhythmData {
  energyWindows: Array<{
    window: string
    score: number
    confidence: number
    activityCount: number
  }>
  returnPattern: {
    currentStreak: number
    longestStreak: number
    averageGapDays: number
    totalActiveDays: number
    confidence: number
  }
  mood: {
    mood: 'calm' | 'focused' | 'exploratory' | 'stuck' | 'flowing'
    confidence: number
    reason: string
  }
  suggestions: Array<{
    id: string
    message: string
    tone: 'info' | 'encouragement' | 'awareness'
  }>
}

export default function RhythmPage() {
  const [data, setData] = useState<RhythmData | null>(null)
  const [summaries, setSummaries] = useState<DailySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // TODO: Get actual workspace ID from auth/context
  const workspaceId = 'demo-workspace-id'

  useEffect(() => {
    async function fetchRhythmData() {
      try {
        const response = await fetch(`/api/rhythm/analyze?workspaceId=${workspaceId}`)

        if (!response.ok) {
          throw new Error('Failed to fetch rhythm data')
        }

        const result = await response.json()

        if (result.success) {
          setData(result.data)
        } else {
          throw new Error('Analysis failed')
        }
      } catch (err) {
        console.error('Failed to load rhythm data:', err)
        setError('Could not load rhythm data. Try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchRhythmData()
  }, [workspaceId])

  if (loading) {
    return (
      <div
        style={{
          padding: '3rem',
          textAlign: 'center',
          color: 'var(--colour-muted)',
        }}
      >
        Loading your rhythm...
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          padding: '3rem',
          textAlign: 'center',
          color: 'var(--colour-muted)',
        }}
      >
        {error}
      </div>
    )
  }

  if (!data) {
    return (
      <div
        style={{
          padding: '3rem',
          textAlign: 'center',
          color: 'var(--colour-muted)',
        }}
      >
        No rhythm data yet. Start creating and patterns will emerge.
      </div>
    )
  }

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem',
      }}
    >
      {/* Header */}
      <header style={{ marginBottom: '2rem' }}>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: '600',
            color: 'var(--colour-foreground)',
            marginBottom: '0.5rem',
          }}
        >
          Your Creative Rhythm
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--colour-muted)',
            lineHeight: '1.6',
            maxWidth: '600px',
          }}
        >
          Patterns in when you create, how often you return, and what you're working on. Not
          productivity tracking — just awareness.
        </p>
      </header>

      {/* Mood Indicator */}
      <section style={{ marginBottom: '2rem' }}>
        <MoodIndicator mood={data.mood} />
      </section>

      {/* Activity Chart */}
      <section
        style={{
          marginBottom: '2rem',
          border: '1px solid var(--colour-border)',
          borderRadius: '12px',
          backgroundColor: 'var(--colour-panel)',
        }}
      >
        <ActivityChart summaries={summaries} />
      </section>

      {/* Energy Windows */}
      <section style={{ marginBottom: '2rem' }}>
        <h2
          style={{
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--colour-foreground)',
            marginBottom: '1rem',
          }}
        >
          Energy Windows
        </h2>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--colour-muted)',
            marginBottom: '1rem',
            lineHeight: '1.6',
          }}
        >
          When you tend to be most active. No judgment — just patterns.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          {data.energyWindows.map((window) => (
            <EnergyWindowCard
              key={window.window}
              window={window.window as any}
              score={window.score}
              confidence={window.confidence}
              activityCount={window.activityCount}
            />
          ))}
        </div>
      </section>

      {/* Return Pattern */}
      {data.returnPattern.totalActiveDays > 0 && (
        <section
          style={{
            marginBottom: '2rem',
            padding: '1.5rem',
            border: '1px solid var(--colour-border)',
            borderRadius: '12px',
            backgroundColor: 'var(--colour-panel)',
          }}
        >
          <h2
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--colour-foreground)',
              marginBottom: '1rem',
            }}
          >
            Return Pattern
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
            }}
          >
            <div>
              <p style={{ fontSize: '12px', color: 'var(--colour-muted)', marginBottom: '0.25rem' }}>
                Current streak
              </p>
              <p style={{ fontSize: '24px', fontWeight: '600', color: 'var(--colour-accent)' }}>
                {data.returnPattern.currentStreak}
                <span style={{ fontSize: '14px', fontWeight: '400', color: 'var(--colour-muted)' }}>
                  {' '}
                  days
                </span>
              </p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--colour-muted)', marginBottom: '0.25rem' }}>
                Longest streak
              </p>
              <p style={{ fontSize: '24px', fontWeight: '600', color: 'var(--colour-foreground)' }}>
                {data.returnPattern.longestStreak}
                <span style={{ fontSize: '14px', fontWeight: '400', color: 'var(--colour-muted)' }}>
                  {' '}
                  days
                </span>
              </p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--colour-muted)', marginBottom: '0.25rem' }}>
                Total active days
              </p>
              <p style={{ fontSize: '24px', fontWeight: '600', color: 'var(--colour-foreground)' }}>
                {data.returnPattern.totalActiveDays}
              </p>
            </div>
            {data.returnPattern.averageGapDays > 0 && (
              <div>
                <p style={{ fontSize: '12px', color: 'var(--colour-muted)', marginBottom: '0.25rem' }}>
                  Typical gap
                </p>
                <p style={{ fontSize: '24px', fontWeight: '600', color: 'var(--colour-foreground)' }}>
                  {data.returnPattern.averageGapDays.toFixed(1)}
                  <span style={{ fontSize: '14px', fontWeight: '400', color: 'var(--colour-muted)' }}>
                    {' '}
                    days
                  </span>
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Suggestions */}
      <section>
        <h2
          style={{
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--colour-foreground)',
            marginBottom: '1rem',
          }}
        >
          Gentle Suggestions
        </h2>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--colour-muted)',
            marginBottom: '1rem',
            lineHeight: '1.6',
          }}
        >
          Based on your patterns. Take what helps, ignore the rest.
        </p>
        <div
          style={{
            border: '1px solid var(--colour-border)',
            borderRadius: '12px',
            backgroundColor: 'var(--colour-panel)',
          }}
        >
          <SuggestionsList suggestions={data.suggestions} />
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: '3rem',
          padding: '1.5rem',
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--colour-muted)',
          borderTop: '1px solid var(--colour-border)',
        }}
      >
        This is awareness, not productivity tracking. Your creative process is yours.
      </footer>
    </div>
  )
}
