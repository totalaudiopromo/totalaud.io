/**
 * Agent Footer - Status Bar
 *
 * Shows active agents and system status
 * Phase 1: Placeholder agent count
 */

'use client'

import { consolePalette } from '@aud-web/themes/consolePalette'

export function AgentFooter() {
  // Placeholder data
  const activeAgents = 0
  const systemStatus = 'ready'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      {/* Left: Agent Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor:
              systemStatus === 'ready'
                ? consolePalette.accent.primary
                : systemStatus === 'busy'
                  ? consolePalette.grid.lineWarning
                  : consolePalette.grid.lineError,
          }}
        />
        <span style={{ fontWeight: 500 }}>
          {activeAgents} active {activeAgents === 1 ? 'agent' : 'agents'}
        </span>
      </div>

      {/* Center: Grid Indicator (placeholder) */}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: '3px',
              height: '12px',
              backgroundColor:
                i < 4
                  ? consolePalette.accent.primary
                  : i < 8
                    ? consolePalette.grid.lineWarning
                    : consolePalette.border.default,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      {/* Right: System Status */}
      <div style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
        {systemStatus}
      </div>
    </div>
  )
}
