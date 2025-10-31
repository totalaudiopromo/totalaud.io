/**
 * Mission Stack - Left Pane
 *
 * Plan → Do → Track → Learn workflow progression
 * Phase 1: Placeholder structure
 * Stage 8.5: Migrated to CSS variable system (Slate Cyan)
 */

'use client'

import { useConsoleStore, type MissionView } from '@aud-web/stores/consoleStore'

const MISSION_PHASES: { id: MissionView; label: string; description: string }[] = [
  { id: 'plan', label: 'Plan', description: 'Define campaign goals' },
  { id: 'do', label: 'Do', description: 'Execute workflows' },
  { id: 'track', label: 'Track', description: 'Monitor progress' },
  { id: 'learn', label: 'Learn', description: 'Analyze outcomes' },
]

export function MissionStack() {
  const { missionView, setMissionView, setActivePane } = useConsoleStore()

  const handleClick = (phaseId: MissionView) => {
    setMissionView(phaseId)
    setActivePane('mission') // Ensure center pane shows ContextPane
  }

  return (
    <div
      data-testid="mission-stack"
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
    >
      {MISSION_PHASES.map((phase) => {
        const isActive = missionView === phase.id

        return (
          <button
            key={phase.id}
            data-testid={`mission-${phase.id}`}
            onClick={() => handleClick(phase.id)}
            style={{
              padding: 'var(--space-3)',
              backgroundColor: isActive ? 'var(--surface)' : 'transparent',
              border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: '6px',
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all var(--motion-fast) ease',
              fontFamily: 'var(--font-primary)',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.backgroundColor = 'var(--surface)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>{phase.label}</div>
            <div
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
              }}
            >
              {phase.description}
            </div>
          </button>
        )
      })}
    </div>
  )
}
