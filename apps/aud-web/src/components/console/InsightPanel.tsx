/**
 * Insight Panel - Right Pane
 *
 * Metrics, goals, and AI recommendations
 * Phase 1: Placeholder metrics
 * Stage 8.5: Migrated to CSS variable system (Slate Cyan)
 */

'use client'

interface MetricCardProps {
  label: string
  value: string
  trend?: 'up' | 'down' | 'neutral'
}

function MetricCard({ label, value, trend = 'neutral' }: MetricCardProps) {
  const trendColor =
    trend === 'up'
      ? 'var(--accent)'
      : trend === 'down'
        ? 'var(--error)'
        : 'var(--text-secondary)'

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
        <span style={{ fontSize: '14px', color: trendColor }}>
          {trendSymbol}
        </span>
      </div>
    </div>
  )
}

export function InsightPanel() {
  return (
    <div data-testid="insight-panel" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <MetricCard label="Active Agents" value="3" trend="up" />
          <MetricCard label="Tasks Completed" value="12" trend="up" />
          <MetricCard label="Contacts Enriched" value="47" trend="neutral" />
          <MetricCard label="Open Rate" value="24%" trend="up" />
        </div>
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
          <div style={{ marginBottom: 'var(--space-2)' }}>• Enrich 100 radio contacts</div>
          <div style={{ marginBottom: 'var(--space-2)' }}>• Send 50 personalized pitches</div>
          <div>• Achieve 30% open rate</div>
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
        <div
          style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--accent)',
            borderRadius: '6px',
            fontSize: '14px',
            color: 'var(--text-primary)',
          }}
        >
          Focus on BBC Radio contacts for highest engagement potential based on your track genre.
        </div>
      </section>
    </div>
  )
}
