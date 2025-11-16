/**
 * OS Performers
 * Phase 16: Container for all OS performer nodes in pentagon layout
 */

'use client'

import type { ThemeId } from '@totalaud/os-state/campaign'
import { OSPerformer } from './OSPerformer'
import { usePerformance } from './PerformanceCanvas'

/**
 * Pentagon layout positions (centered in viewport)
 * Percentages from center (50%, 50%)
 */
const PENTAGON_POSITIONS: Record<ThemeId, { x: number; y: number }> = {
  ascii: { x: 50, y: 20 }, // top
  xp: { x: 75, y: 35 }, // top-right
  aqua: { x: 65, y: 70 }, // bottom-right
  daw: { x: 35, y: 70 }, // bottom-left
  analogue: { x: 25, y: 35 }, // top-left
}

/**
 * All OS IDs
 */
const ALL_OS_IDS: ThemeId[] = ['ascii', 'xp', 'aqua', 'daw', 'analogue']

/**
 * OS Performers container
 */
export function OSPerformers() {
  const { performanceState } = usePerformance()

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      {ALL_OS_IDS.map((os) => {
        const state = performanceState.osStates.get(os) || {
          isSpeaking: false,
          isThinking: false,
          isCharged: false,
          activityLevel: 0,
        }

        const position = PENTAGON_POSITIONS[os]

        return <OSPerformer key={os} os={os} state={state} position={position} />
      })}
    </div>
  )
}
