'use client'

import type { DailySummary } from '@loopos/db'

interface ActivityChartProps {
  summaries: DailySummary[]
}

export function ActivityChart({ summaries }: ActivityChartProps) {
  if (summaries.length === 0) {
    return (
      <div
        style={{
          padding: '3rem',
          textAlign: 'center',
          color: 'var(--colour-muted)',
          fontSize: '14px',
        }}
      >
        No activity data yet. Just start creating.
      </div>
    )
  }

  // Get last 7 days
  const last7Days = summaries.slice(-7)
  const maxActivity = Math.max(
    ...last7Days.map(
      (s) => s.entries + s.nodes_added + s.coach_messages + s.scenes_generated
    ),
    1
  )

  return (
    <div style={{ padding: '1.5rem' }}>
      <h3
        style={{
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '1rem',
          color: 'var(--colour-foreground)',
        }}
      >
        Last 7 days
      </h3>

      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'flex-end',
          height: '120px',
        }}
      >
        {last7Days.map((summary, i) => {
          const total =
            summary.entries +
            summary.nodes_added +
            summary.coach_messages +
            summary.scenes_generated
          const heightPercent = (total / maxActivity) * 100

          const date = new Date(summary.date)
          const dayName = date.toLocaleDateString('en-GB', { weekday: 'short' })

          return (
            <div
              key={summary.id}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100px',
                  display: 'flex',
                  alignItems: 'flex-end',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: `${heightPercent}%`,
                    backgroundColor: total > 0 ? 'var(--colour-accent)' : 'var(--colour-border)',
                    borderRadius: '4px',
                    opacity: total > 0 ? 0.8 : 0.2,
                    transition: 'height 240ms ease-out',
                  }}
                  title={`${total} activities`}
                />
              </div>
              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--colour-muted)',
                  fontWeight: '500',
                }}
              >
                {dayName}
              </span>
            </div>
          )
        })}
      </div>

      <div
        style={{
          marginTop: '1rem',
          fontSize: '12px',
          color: 'var(--colour-muted)',
          textAlign: 'center',
        }}
      >
        {summaries.length < 7 ? `${summaries.length} days recorded` : 'Weekly view'}
      </div>
    </div>
  )
}
