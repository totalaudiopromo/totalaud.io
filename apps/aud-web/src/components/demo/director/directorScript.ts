/**
 * Director Script for /demo/artist
 * Cinematic auto-playback for Lana Glass demo
 */

import type { DemoStepId } from '../DemoScript'

export type DirectorActionKind =
  | 'WAIT'
  | 'SET_OS'
  | 'TYPE_ASCII'
  | 'RUN_ASCII_COMMAND'
  | 'HIGHLIGHT_ANALOGUE_CARD'
  | 'FOCUS_XP_AGENT_RUN'
  | 'PAN_CAMERA'
  | 'PLAY_LOOPOS'
  | 'STOP_LOOPOS'
  | 'OPEN_AQUA_AGENT'
  | 'SET_AMBIENT_INTENSITY'
  | 'SHOW_NOTE'

export interface DirectorAction {
  id: string
  stepId: DemoStepId // Link to existing DEMO_STEPS
  kind: DirectorActionKind
  delayMs?: number // Wait before running this action
  durationMs?: number // For camera pans, etc.
  payload?: any // Typed per kind
}

/**
 * Cinematic script for Lana Glass demo
 * 60-90 second auto-playthrough
 */
export const DIRECTOR_SCRIPT: DirectorAction[] = [
  // ============================================================
  // ANALOGUE OS - Notebook & Concepts
  // ============================================================
  {
    id: 'analogue-intro',
    stepId: 'analogue-intro',
    kind: 'SET_OS',
    payload: { osSlug: 'analogue' },
    delayMs: 500,
  },
  {
    id: 'analogue-show-note',
    stepId: 'analogue-intro',
    kind: 'SHOW_NOTE',
    payload: { text: "This is Lana's creative notebook..." },
    delayMs: 800,
  },
  {
    id: 'analogue-highlight-card',
    stepId: 'analogue-intro',
    kind: 'HIGHLIGHT_ANALOGUE_CARD',
    payload: { title: 'midnight signals — concept' },
    delayMs: 1200,
    durationMs: 2000,
  },
  {
    id: 'analogue-wait',
    stepId: 'analogue-intro',
    kind: 'WAIT',
    delayMs: 2500,
  },

  // ============================================================
  // ASCII OS - Command Agent
  // ============================================================
  {
    id: 'ascii-intro',
    stepId: 'ascii-intro',
    kind: 'SET_OS',
    payload: { osSlug: 'ascii' },
    delayMs: 800,
  },
  {
    id: 'ascii-show-note',
    stepId: 'ascii-intro',
    kind: 'SHOW_NOTE',
    payload: { text: 'Running an agent command...' },
    delayMs: 600,
  },
  {
    id: 'ascii-type-command',
    stepId: 'ascii-intro',
    kind: 'TYPE_ASCII',
    payload: {
      text: 'agent run coach "Suggest an announcement plan for the \'Midnight Signals\' EP."',
    },
    delayMs: 1000,
    durationMs: 2000, // Typing animation duration
  },
  {
    id: 'ascii-run-command',
    stepId: 'ascii-intro',
    kind: 'RUN_ASCII_COMMAND',
    delayMs: 500,
  },
  {
    id: 'ascii-wait',
    stepId: 'ascii-intro',
    kind: 'WAIT',
    delayMs: 2000,
  },

  // ============================================================
  // XP OS - Agent Monitor
  // ============================================================
  {
    id: 'xp-intro',
    stepId: 'xp-intro',
    kind: 'SET_OS',
    payload: { osSlug: 'xp' },
    delayMs: 800,
  },
  {
    id: 'xp-show-note',
    stepId: 'xp-intro',
    kind: 'SHOW_NOTE',
    payload: { text: 'Agent response arriving...' },
    delayMs: 1000,
  },
  {
    id: 'xp-focus-run',
    stepId: 'xp-intro',
    kind: 'FOCUS_XP_AGENT_RUN',
    delayMs: 1500,
  },
  {
    id: 'xp-wait',
    stepId: 'xp-intro',
    kind: 'WAIT',
    delayMs: 3000,
  },

  // ============================================================
  // LOOPOS - Timeline & Playback
  // ============================================================
  {
    id: 'loopos-intro',
    stepId: 'loopos-intro',
    kind: 'SET_OS',
    payload: { osSlug: 'loopos' },
    delayMs: 800,
  },
  {
    id: 'loopos-show-note',
    stepId: 'loopos-intro',
    kind: 'SHOW_NOTE',
    payload: { text: 'The creative timeline...' },
    delayMs: 600,
  },
  {
    id: 'loopos-pan-timeline',
    stepId: 'loopos-intro',
    kind: 'PAN_CAMERA',
    payload: { target: 'timeline' },
    delayMs: 1000,
    durationMs: 1500,
  },
  {
    id: 'loopos-play',
    stepId: 'loopos-intro',
    kind: 'PLAY_LOOPOS',
    delayMs: 800,
    durationMs: 3000, // Play for 3 seconds
  },
  {
    id: 'loopos-pan-inspector',
    stepId: 'loopos-intro',
    kind: 'PAN_CAMERA',
    payload: { target: 'inspector' },
    delayMs: 500,
    durationMs: 1200,
  },
  {
    id: 'loopos-stop',
    stepId: 'loopos-intro',
    kind: 'STOP_LOOPOS',
    delayMs: 1500,
  },
  {
    id: 'loopos-wait',
    stepId: 'loopos-intro',
    kind: 'WAIT',
    delayMs: 1000,
  },

  // ============================================================
  // AQUA OS - Coach Agent
  // ============================================================
  {
    id: 'aqua-intro',
    stepId: 'aqua-intro',
    kind: 'SET_OS',
    payload: { osSlug: 'aqua' },
    delayMs: 800,
  },
  {
    id: 'aqua-ambient-boost',
    stepId: 'aqua-intro',
    kind: 'SET_AMBIENT_INTENSITY',
    payload: { intensity: 0.7 },
    delayMs: 400,
  },
  {
    id: 'aqua-show-note',
    stepId: 'aqua-intro',
    kind: 'SHOW_NOTE',
    payload: { text: 'Asking Coach about the pitch...' },
    delayMs: 800,
  },
  {
    id: 'aqua-open-agent',
    stepId: 'aqua-intro',
    kind: 'OPEN_AQUA_AGENT',
    delayMs: 1200,
  },
  {
    id: 'aqua-wait',
    stepId: 'aqua-intro',
    kind: 'WAIT',
    delayMs: 4000,
  },

  // ============================================================
  // FINALE
  // ============================================================
  {
    id: 'finale-reset-ambient',
    stepId: 'aqua-intro',
    kind: 'SET_AMBIENT_INTENSITY',
    payload: { intensity: 0.5 },
    delayMs: 500,
  },
]
