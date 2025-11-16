/**
 * Intelligence Metrics Panel
 * Phase 15: CIB 2.0 - Relationship and evolution charts
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { useIntelligence } from '@totalaud/os-state/campaign'
import type { ThemeId } from '@totalaud/os-state/campaign'
import type {
  IntelligenceMetric,
  TimeSeriesPoint,
} from '@totalaud/os-state/campaign/slices/intelligenceSlice'

const OS_COLOURS: Record<ThemeId, string> = {
  ascii: '#00ff99',
  xp: '#3478f6',
  aqua: '#3b82f6',
  daw: '#ff8000',
  analogue: '#ff1aff',
}

const OS_LABELS: Record<ThemeId, string> = {
  ascii: 'ASCII',
  xp: 'XP',
  aqua: 'Aqua',
  daw: 'DAW',
  analogue: 'Analogue',
}

export function IntelligenceMetricsPanel() {
  const { intelligence, setSelectedMetric, setSelectedOS } = useIntelligence()
  const [activeTab, setActiveTab] = useState<'relationships' | 'cohesion' | 'evolution'>(
    'relationships'
  )

  const selectedMetric = intelligence.selectedMetric || 'trust'
  const selectedOS = intelligence.selectedOS || 'all'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '20px',
        backgroundColor: flowCoreColours.matteBlack,
        border: `1px solid ${flowCoreColours.borderSubtle}`,
        borderRadius: '8px',
      }}
    >
      {/* Header with tabs */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Activity size={16} strokeWidth={1.6} style={{ color: flowCoreColours.slateCyan }} />
          <h4
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: flowCoreColours.textPrimary,
              margin: 0,
            }}
          >
            Intelligence Metrics
          </h4>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['relationships', 'cohesion', 'evolution'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 500,
                color:
                  activeTab === tab ? flowCoreColours.slateCyan : flowCoreColours.textSecondary,
                backgroundColor:
                  activeTab === tab ? `${flowCoreColours.slateCyan}10` : 'transparent',
                border: `1px solid ${activeTab === tab ? flowCoreColours.slateCyan : flowCoreColours.borderSubtle}`,
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 120ms cubic-bezier(0.22, 1, 0.36, 1)',
                textTransform: 'capitalize',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Chart area */}
      <div
        style={{
          minHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {activeTab === 'relationships' && (
          <RelationshipsChart
            relationshipSeries={intelligence.relationshipSeries}
            selectedMetric={selectedMetric}
            selectedOS={selectedOS}
            onMetricChange={setSelectedMetric}
            onOSChange={setSelectedOS}
          />
        )}

        {activeTab === 'cohesion' && (
          <CohesionChart snapshots={intelligence.snapshots} />
        )}

        {activeTab === 'evolution' && (
          <EvolutionChart
            evolutionSeries={intelligence.evolutionSeries}
            selectedMetric={selectedMetric}
            selectedOS={selectedOS}
            onMetricChange={setSelectedMetric}
            onOSChange={setSelectedOS}
          />
        )}
      </div>
    </div>
  )
}

/**
 * Relationships Chart
 */
function RelationshipsChart({
  relationshipSeries,
  selectedMetric,
  selectedOS,
  onMetricChange,
  onOSChange,
}: {
  relationshipSeries: any[]
  selectedMetric: IntelligenceMetric
  selectedOS: ThemeId | 'all'
  onMetricChange: (metric: IntelligenceMetric) => void
  onOSChange: (os?: ThemeId | 'all') => void
}) {
  return (
    <div>
      {/* Metric selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        {(['trust', 'tension', 'synergy'] as const).map((metric) => (
          <button
            key={metric}
            onClick={() => onMetricChange(metric)}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 500,
              color:
                selectedMetric === metric
                  ? flowCoreColours.slateCyan
                  : flowCoreColours.textSecondary,
              backgroundColor:
                selectedMetric === metric ? `${flowCoreColours.slateCyan}10` : 'transparent',
              border: `1px solid ${selectedMetric === metric ? flowCoreColours.slateCyan : flowCoreColours.borderSubtle}`,
              borderRadius: '3px',
              cursor: 'pointer',
              transition: 'all 120ms ease',
              textTransform: 'capitalize',
            }}
          >
            {metric}
          </button>
        ))}
      </div>

      {/* Placeholder chart */}
      <div
        style={{
          height: '240px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${flowCoreColours.borderSubtle}20`,
          borderRadius: '4px',
          border: `1px solid ${flowCoreColours.borderSubtle}`,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: flowCoreColours.textTertiary, margin: 0 }}>
            {relationshipSeries.length === 0
              ? 'No relationship data available yet'
              : `${relationshipSeries.length} OS pair${relationshipSeries.length !== 1 ? 's' : ''} tracked`}
          </p>
          <p
            style={{
              fontSize: '11px',
              color: flowCoreColours.textTertiary,
              margin: '8px 0 0 0',
            }}
          >
            Chart: {selectedMetric} over time
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Cohesion Chart
 */
function CohesionChart({ snapshots }: { snapshots: any[] }) {
  return (
    <div>
      <p style={{ fontSize: '12px', color: flowCoreColours.textSecondary, marginBottom: '12px' }}>
        Cohesion score over time (1 - average tension)
      </p>

      {/* Placeholder chart */}
      <div
        style={{
          height: '240px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${flowCoreColours.borderSubtle}20`,
          borderRadius: '4px',
          border: `1px solid ${flowCoreColours.borderSubtle}`,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: flowCoreColours.textTertiary, margin: 0 }}>
            {snapshots.length === 0
              ? 'No identity snapshots available yet'
              : `${snapshots.length} snapshot${snapshots.length !== 1 ? 's' : ''} recorded`}
          </p>
          <p
            style={{
              fontSize: '11px',
              color: flowCoreColours.textTertiary,
              margin: '8px 0 0 0',
            }}
          >
            Chart: Cohesion timeline
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Evolution Chart
 */
function EvolutionChart({
  evolutionSeries,
  selectedMetric,
  selectedOS,
  onMetricChange,
  onOSChange,
}: {
  evolutionSeries: any[]
  selectedMetric: IntelligenceMetric
  selectedOS: ThemeId | 'all'
  onMetricChange: (metric: IntelligenceMetric) => void
  onOSChange: (os?: ThemeId | 'all') => void
}) {
  return (
    <div>
      {/* Metric selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {(['confidence', 'risk', 'empathy', 'tempo'] as const).map((metric) => (
          <button
            key={metric}
            onClick={() => onMetricChange(metric)}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 500,
              color:
                selectedMetric === metric
                  ? flowCoreColours.slateCyan
                  : flowCoreColours.textSecondary,
              backgroundColor:
                selectedMetric === metric ? `${flowCoreColours.slateCyan}10` : 'transparent',
              border: `1px solid ${selectedMetric === metric ? flowCoreColours.slateCyan : flowCoreColours.borderSubtle}`,
              borderRadius: '3px',
              cursor: 'pointer',
              transition: 'all 120ms ease',
              textTransform: 'capitalize',
            }}
          >
            {metric}
          </button>
        ))}
      </div>

      {/* Placeholder chart */}
      <div
        style={{
          height: '240px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${flowCoreColours.borderSubtle}20`,
          borderRadius: '4px',
          border: `1px solid ${flowCoreColours.borderSubtle}`,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: flowCoreColours.textTertiary, margin: 0 }}>
            {evolutionSeries.length === 0
              ? 'No evolution data available yet'
              : `${evolutionSeries.length} OS profile${evolutionSeries.length !== 1 ? 's' : ''} tracked`}
          </p>
          <p
            style={{
              fontSize: '11px',
              color: flowCoreColours.textTertiary,
              margin: '8px 0 0 0',
            }}
          >
            Chart: {selectedMetric} over time
          </p>
        </div>
      </div>
    </div>
  )
}
