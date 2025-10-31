/**
 * Agent Footer - Status Bar
 *
 * Shows active agents and system status
 * Phase 1: Placeholder agent count
 * Stage 8.5: Migrated to CSS variable system (Slate Cyan)
 */

'use client'

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
                ? 'var(--accent)'
                : systemStatus === 'busy'
                  ? 'var(--warning)'
                  : 'var(--error)',
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
              backgroundColor: i < 4 ? 'var(--accent)' : i < 8 ? 'var(--warning)' : 'var(--border)',
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
