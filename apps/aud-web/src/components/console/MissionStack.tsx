/**
 * Mission Stack - Left Pane
 *
 * Plan → Do → Track → Learn workflow progression
 * Phase 1: Placeholder structure
 */

'use client'

import { useConsoleStore, type MissionView } from '@aud-web/stores/consoleStore'
import { consolePalette } from '@aud-web/themes/consolePalette'

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
    setActivePane('mission')  // Ensure center pane shows ContextPane
  }

  return (
    <div data-testid="mission-stack" style={{ display: 'flex', flexDirection: 'column', gap: consolePalette.spacing.gap }}>
      {MISSION_PHASES.map((phase) => {
        const isActive = missionView === phase.id

        return (
          <button
            key={phase.id}
            data-testid={`mission-${phase.id}`}
            onClick={() => handleClick(phase.id)}
            style={{
              padding: consolePalette.spacing.elementPadding,
              backgroundColor: isActive
                ? consolePalette.background.tertiary
                : 'transparent',
              border: `1px solid ${
                isActive ? consolePalette.accent.primary : consolePalette.border.default
              }`,
              borderRadius: '6px',
              color: isActive ? consolePalette.accent.primary : consolePalette.text.secondary,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
              fontFamily: consolePalette.typography.fontFamily,
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = consolePalette.border.subtle
                e.currentTarget.style.backgroundColor = consolePalette.background.tertiary
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = consolePalette.border.default
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>{phase.label}</div>
            <div
              style={{
                fontSize: consolePalette.typography.fontSize.small,
                color: consolePalette.text.tertiary,
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
