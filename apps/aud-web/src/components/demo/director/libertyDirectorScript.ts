/**
 * Liberty Director Script for /demo/liberty
 * Campaign-focused demo showcasing indie artist + Liberty Music PR workflow
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
  | 'TRIGGER_TAP_EXPORT' // New action for TAP preview

export interface DirectorAction {
  id: string
  stepId: DemoStepId
  kind: DirectorActionKind
  delayMs?: number
  durationMs?: number
  payload?: any
}

/**
 * Liberty campaign demo script
 * 80-90 second walkthrough showing indie artist + Liberty Music PR integration
 */
export const LIBERTY_DIRECTOR_SCRIPT: DirectorAction[] = [
  // ============================================================
  // ANALOGUE OS - Liberty EP Release Notes
  // ============================================================
  {
    id: 'liberty-analogue-intro',
    stepId: 'analogue-intro',
    kind: 'SET_OS',
    payload: { osSlug: 'analogue' },
    delayMs: 500,
  },
  {
    id: 'liberty-analogue-note',
    stepId: 'analogue-intro',
    kind: 'SHOW_NOTE',
    payload: { text: 'Imagine preparing an EP launch with Liberty Music PR...' },
    delayMs: 800,
  },
  {
    id: 'liberty-analogue-highlight',
    stepId: 'analogue-intro',
    kind: 'HIGHLIGHT_ANALOGUE_CARD',
    payload: { title: 'Liberty EP — release notes' },
    delayMs: 1200,
    durationMs: 2000,
  },
  {
    id: 'liberty-analogue-wait',
    stepId: 'analogue-intro',
    kind: 'WAIT',
    delayMs: 2500,
  },

  // ============================================================
  // ASCII OS - UK Launch Planning
  // ============================================================
  {
    id: 'liberty-ascii-intro',
    stepId: 'ascii-intro',
    kind: 'SET_OS',
    payload: { osSlug: 'ascii' },
    delayMs: 800,
  },
  {
    id: 'liberty-ascii-note',
    stepId: 'ascii-intro',
    kind: 'SHOW_NOTE',
    payload: { text: 'Planning UK launch strategy...' },
    delayMs: 600,
  },
  {
    id: 'liberty-ascii-type',
    stepId: 'ascii-intro',
    kind: 'TYPE_ASCII',
    payload: {
      text: 'agent run coach "Plan UK launch for Liberty Music PR audience"',
    },
    delayMs: 1000,
    durationMs: 2000,
  },
  {
    id: 'liberty-ascii-run',
    stepId: 'ascii-intro',
    kind: 'RUN_ASCII_COMMAND',
    delayMs: 500,
  },
  {
    id: 'liberty-ascii-wait',
    stepId: 'ascii-intro',
    kind: 'WAIT',
    delayMs: 2000,
  },

  // ============================================================
  // XP OS - Campaign Agents
  // ============================================================
  {
    id: 'liberty-xp-intro',
    stepId: 'xp-intro',
    kind: 'SET_OS',
    payload: { osSlug: 'xp' },
    delayMs: 800,
  },
  {
    id: 'liberty-xp-note',
    stepId: 'xp-intro',
    kind: 'SHOW_NOTE',
    payload: { text: 'Liberty campaign agents running...' },
    delayMs: 1000,
  },
  {
    id: 'liberty-xp-focus',
    stepId: 'xp-intro',
    kind: 'FOCUS_XP_AGENT_RUN',
    delayMs: 1500,
  },
  {
    id: 'liberty-xp-wait',
    stepId: 'xp-intro',
    kind: 'WAIT',
    delayMs: 3000,
  },

  // ============================================================
  // LOOPOS - Campaign Timeline
  // ============================================================
  {
    id: 'liberty-loopos-intro',
    stepId: 'loopos-intro',
    kind: 'SET_OS',
    payload: { osSlug: 'loopos' },
    delayMs: 800,
  },
  {
    id: 'liberty-loopos-note',
    stepId: 'loopos-intro',
    kind: 'SHOW_NOTE',
    payload: { text: 'The campaign timeline with key radio & press targets...' },
    delayMs: 600,
  },
  {
    id: 'liberty-loopos-pan',
    stepId: 'loopos-intro',
    kind: 'PAN_CAMERA',
    payload: { target: 'timeline' },
    delayMs: 1000,
    durationMs: 1500,
  },
  {
    id: 'liberty-loopos-play',
    stepId: 'loopos-intro',
    kind: 'PLAY_LOOPOS',
    delayMs: 800,
    durationMs: 3000,
  },
  {
    id: 'liberty-loopos-stop',
    stepId: 'loopos-intro',
    kind: 'STOP_LOOPOS',
    delayMs: 1500,
  },
  {
    id: 'liberty-loopos-wait',
    stepId: 'loopos-intro',
    kind: 'WAIT',
    delayMs: 1000,
  },

  // ============================================================
  // AQUA OS - Liberty Strategy
  // ============================================================
  {
    id: 'liberty-aqua-intro',
    stepId: 'aqua-intro',
    kind: 'SET_OS',
    payload: { osSlug: 'aqua' },
    delayMs: 800,
  },
  {
    id: 'liberty-aqua-ambient',
    stepId: 'aqua-intro',
    kind: 'SET_AMBIENT_INTENSITY',
    payload: { intensity: 0.7 },
    delayMs: 400,
  },
  {
    id: 'liberty-aqua-note',
    stepId: 'aqua-intro',
    kind: 'SHOW_NOTE',
    payload: { text: 'Getting strategic guidance for Liberty Music PR pitch...' },
    delayMs: 800,
  },
  {
    id: 'liberty-aqua-agent',
    stepId: 'aqua-intro',
    kind: 'OPEN_AQUA_AGENT',
    delayMs: 1200,
  },
  {
    id: 'liberty-aqua-wait',
    stepId: 'aqua-intro',
    kind: 'WAIT',
    delayMs: 4000,
  },

  // ============================================================
  // TAP EXPORT PREVIEW
  // ============================================================
  {
    id: 'liberty-tap-export-note',
    stepId: 'aqua-intro',
    kind: 'SHOW_NOTE',
    payload: { text: 'Exporting campaign to Total Audio Promo (Preview Mode)...' },
    delayMs: 800,
  },
  {
    id: 'liberty-tap-export',
    stepId: 'aqua-intro',
    kind: 'TRIGGER_TAP_EXPORT',
    payload: {
      campaignName: 'Liberty EP Launch',
      artist: 'Demo Artist',
      targetAudience: 'UK Indie / Student Radio',
    },
    delayMs: 1000,
    durationMs: 2000,
  },
  {
    id: 'liberty-tap-export-wait',
    stepId: 'aqua-intro',
    kind: 'WAIT',
    delayMs: 2500,
  },

  // ============================================================
  // END CARD
  // ============================================================
  {
    id: 'liberty-end-note',
    stepId: 'aqua-intro',
    kind: 'SHOW_NOTE',
    payload: {
      text: 'Creative story here in totalaud.io • Execution and reporting in Total Audio Promo',
    },
    delayMs: 1000,
  },
  {
    id: 'liberty-ambient-reset',
    stepId: 'aqua-intro',
    kind: 'SET_AMBIENT_INTENSITY',
    payload: { intensity: 0.5 },
    delayMs: 3000,
  },
]
