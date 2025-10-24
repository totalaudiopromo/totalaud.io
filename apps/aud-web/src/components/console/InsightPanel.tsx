/**
 * Insight Panel - Right Pane
 *
 * Metrics, goals, and AI recommendations
 * Phase 1: Placeholder metrics
 */

'use client'

import { consolePalette } from '@aud-web/themes/consolePalette'

interface MetricCardProps {
  label: string
  value: string
  trend?: 'up' | 'down' | 'neutral'
}

function MetricCard({ label, value, trend = 'neutral' }: MetricCardProps) {
  const trendColor =
    trend === 'up'
      ? consolePalette.accent.primary
      : trend === 'down'
        ? consolePalette.grid.lineError
        : consolePalette.text.tertiary

  const trendSymbol = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'

  return (
    <div
      data-testid={`metric-${label.toLowerCase().replace(/\s+/g, '-')}`}
      style={{
        padding: consolePalette.spacing.elementPadding,
        backgroundColor: consolePalette.background.tertiary,
        border: `1px solid ${consolePalette.border.default}`,
        borderRadius: '6px',
      }}
    >
      <div
        style={{
          fontSize: consolePalette.typography.fontSize.small,
          color: consolePalette.text.tertiary,
          marginBottom: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: consolePalette.typography.fontSize.h3,
          fontWeight: 600,
          color: consolePalette.text.primary,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {value}
        <span style={{ fontSize: consolePalette.typography.fontSize.small, color: trendColor }}>
          {trendSymbol}
        </span>
      </div>
    </div>
  )
}

export function InsightPanel() {
  return (
    <div data-testid="insight-panel" style={{ display: 'flex', flexDirection: 'column', gap: consolePalette.spacing.gap }}>
      {/* Metrics Section */}
      <section data-testid="campaign-metrics">
        <h3
          style={{
            fontSize: consolePalette.typography.fontSize.body,
            fontWeight: 600,
            marginBottom: consolePalette.spacing.elementPadding,
            color: consolePalette.text.secondary,
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
      <section style={{ marginTop: consolePalette.spacing.sectionMargin }}>
        <h3
          style={{
            fontSize: consolePalette.typography.fontSize.body,
            fontWeight: 600,
            marginBottom: consolePalette.spacing.elementPadding,
            color: consolePalette.text.secondary,
          }}
        >
          Current Goals
        </h3>
        <div
          style={{
            padding: consolePalette.spacing.elementPadding,
            backgroundColor: consolePalette.background.tertiary,
            border: `1px solid ${consolePalette.border.default}`,
            borderRadius: '6px',
            fontSize: consolePalette.typography.fontSize.small,
            color: consolePalette.text.secondary,
          }}
        >
          <div style={{ marginBottom: '8px' }}>• Enrich 100 radio contacts</div>
          <div style={{ marginBottom: '8px' }}>• Send 50 personalized pitches</div>
          <div>• Achieve 30% open rate</div>
        </div>
      </section>

      {/* Recommendations Section */}
      <section style={{ marginTop: consolePalette.spacing.sectionMargin }}>
        <h3
          style={{
            fontSize: consolePalette.typography.fontSize.body,
            fontWeight: 600,
            marginBottom: consolePalette.spacing.elementPadding,
            color: consolePalette.text.secondary,
          }}
        >
          AI Recommendations
        </h3>
        <div
          style={{
            padding: consolePalette.spacing.elementPadding,
            backgroundColor: consolePalette.background.tertiary,
            border: `1px solid ${consolePalette.accent.primary}`,
            borderRadius: '6px',
            fontSize: consolePalette.typography.fontSize.small,
            color: consolePalette.text.primary,
          }}
        >
          Focus on BBC Radio contacts for highest engagement potential based on your track genre.
        </div>
      </section>
    </div>
  )
}
