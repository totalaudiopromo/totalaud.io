/**
 * Insight Panel - Right Pane
 *
 * Metrics, goals, and AI recommendations
 * Phase 12.3.5: Live data integration with useCampaignInsights
 * Phase 13.0: FlowCore Studio Aesthetics
 */

'use client'

import { useCampaignInsights } from '@/hooks/useCampaignInsights'
import { useConsoleStore } from '@aud-web/stores/consoleStore'

interface MetricCardProps {
  label: string
  value: string
  trend?: 'up' | 'down' | 'neutral'
}

function MetricCard({ label, value, trend = 'neutral' }: MetricCardProps) {
  const trendColor =
    trend === 'up' ? 'var(--accent)' : trend === 'down' ? 'var(--error)' : 'var(--text-secondary)'

  const trendSymbol = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'

  return (
    <div
      data-testid={`metric-${label.toLowerCase().replace(/\s+/g, '-')}`}
      style={{
        padding: 'var(--space-3)',
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '6px',
      }}
    >
      <div
        style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          marginBottom: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '20px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
        }}
      >
        {value}
        <span style={{ fontSize: '14px', color: trendColor }}>{trendSymbol}</span>
      </div>
    </div>
  )
}

export function InsightPanel() {
  const { activeCampaignId } = useConsoleStore()
  const { metrics, goals, recommendations, isLoading, error } = useCampaignInsights(
    activeCampaignId,
    30000 // 30s refresh
  )

  return (
    <div
      data-testid="insight-panel"
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
    >
      {/* Metrics Section */}
      <section data-testid="campaign-metrics">
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 600,
            marginBottom: 'var(--space-3)',
            color: 'var(--text-secondary)',
          }}
        >
          Campaign Metrics
        </h3>
        {isLoading ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>loading metrics...</div>
        ) : error ? (
          <div style={{ color: 'var(--error)', fontSize: '14px' }}>Error: {error}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <MetricCard
              label="Active Agents"
              value={String(metrics.activeAgents)}
              trend={metrics.activeAgentsTrend}
            />
            <MetricCard
              label="Tasks Completed"
              value={String(metrics.tasksCompleted)}
              trend={metrics.tasksCompletedTrend}
            />
            <MetricCard
              label="Contacts Enriched"
              value={String(metrics.contactsEnriched)}
              trend={metrics.contactsEnrichedTrend}
            />
            <MetricCard
              label="Open Rate"
              value={`${metrics.openRate}%`}
              trend={metrics.openRateTrend}
            />
          </div>
        )}
      </section>

      {/* Goals Section */}
      <section style={{ marginTop: 'var(--space-4)' }}>
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 600,
            marginBottom: 'var(--space-3)',
            color: 'var(--text-secondary)',
          }}
        >
          Current Goals
        </h3>
        <div
          style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            fontSize: '14px',
            color: 'var(--text-secondary)',
          }}
        >
          {goals.length === 0 ? (
            <div style={{ fontStyle: 'italic', color: 'var(--text-tertiary)' }}>
              no goals set yet
            </div>
          ) : (
            goals.map((goal) => (
              <div
                key={goal.id}
                style={{
                  marginBottom: goals.length > 1 ? 'var(--space-2)' : 0,
                  textDecoration: goal.completed ? 'line-through' : 'none',
                  opacity: goal.completed ? 0.6 : 1,
                }}
              >
                {goal.completed ? '✓' : '•'} {goal.description}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Recommendations Section */}
      <section style={{ marginTop: 'var(--space-4)' }}>
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 600,
            marginBottom: 'var(--space-3)',
            color: 'var(--text-secondary)',
          }}
        >
          AI Recommendations
        </h3>
        {recommendations.length === 0 ? (
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontSize: '14px',
              color: 'var(--text-tertiary)',
              fontStyle: 'italic',
            }}
          >
            no recommendations yet — run insight analysis
          </div>
        ) : (
          recommendations.map((rec) => (
            <div
              key={rec.id}
              style={{
                padding: 'var(--space-3)',
                backgroundColor: 'var(--surface)',
                border: `1px solid ${rec.priority === 'high' ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '6px',
                fontSize: '14px',
                color: 'var(--text-primary)',
                marginBottom: recommendations.length > 1 ? 'var(--space-2)' : 0,
              }}
            >
              {rec.text}
            </div>
          ))
        )}
      </section>
    </div>
  )
}
