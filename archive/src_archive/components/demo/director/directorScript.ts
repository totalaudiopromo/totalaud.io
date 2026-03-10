'use client'

import type { DemoStepId } from '@/components/demo/DemoScript'

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
  stepId: DemoStepId
  kind: DirectorActionKind
  delayMs?: number
  durationMs?: number
  // Payload is intentionally loose; execution helpers will narrow as needed.
  payload?: unknown
}

export const DIRECTOR_SCRIPT: DirectorAction[] = [
  {
    id: 'analogue-intro-note',
    stepId: 'analogue_ideas',
    kind: 'SHOW_NOTE',
    delayMs: 400,
    payload:
      'This is LANA GLASS’s notebook for the “Midnight Signals” EP – ideas, visuals, and campaign hooks.',
  },
  {
    id: 'analogue-highlight-main-card',
    stepId: 'analogue_ideas',
    kind: 'HIGHLIGHT_ANALOGUE_CARD',
    delayMs: 900,
    payload: {
      title: 'midnight signals — concept',
    },
  },
  {
    id: 'analogue-idea-fork',
    stepId: 'analogue_send_to_daw',
    kind: 'WAIT',
    delayMs: 900,
  },
  {
    id: 'ascii-switch',
    stepId: 'ascii_agent_run',
    kind: 'SET_OS',
    delayMs: 900,
  },
  {
    id: 'ascii-note',
    stepId: 'ascii_agent_run',
    kind: 'SHOW_NOTE',
    delayMs: 600,
    payload: 'In ASCII OS we talk to agents directly – no UI chrome, just commands and logs.',
  },
  {
    id: 'ascii-type-command',
    stepId: 'ascii_agent_run',
    kind: 'TYPE_ASCII',
    delayMs: 900,
    payload: 'agent run coach "Suggest an announcement plan for the ‘Midnight Signals’ EP."',
  },
  {
    id: 'ascii-run-command',
    stepId: 'ascii_agent_run',
    kind: 'RUN_ASCII_COMMAND',
    delayMs: 600,
  },
  {
    id: 'wait-for-agent',
    stepId: 'ascii_agent_run',
    kind: 'WAIT',
    delayMs: 3200,
  },
  {
    id: 'xp-switch',
    stepId: 'xp_monitor',
    kind: 'SET_OS',
    delayMs: 400,
  },
  {
    id: 'xp-note',
    stepId: 'xp_monitor',
    kind: 'SHOW_NOTE',
    delayMs: 800,
    payload:
      'XP OS acts as the control centre – agent runs appear in the monitor and clipboard for review.',
  },
  {
    id: 'xp-focus-last-run',
    stepId: 'xp_monitor',
    kind: 'FOCUS_XP_AGENT_RUN',
    delayMs: 1200,
  },
  {
    id: 'loopos-switch',
    stepId: 'loopos_build',
    kind: 'SET_OS',
    delayMs: 800,
  },
  {
    id: 'loopos-note',
    stepId: 'loopos_build',
    kind: 'SHOW_NOTE',
    delayMs: 800,
    payload:
      'LoopOS turns the rollout into a loop – creative, promo, and analysis clips keeping momentum moving.',
  },
  {
    id: 'loopos-pan-timeline',
    stepId: 'loopos_build',
    kind: 'PAN_CAMERA',
    delayMs: 600,
    durationMs: 2600,
    payload: {
      target: 'timeline',
    },
  },
  {
    id: 'loopos-play',
    stepId: 'loopos_build',
    kind: 'PLAY_LOOPOS',
    delayMs: 400,
    durationMs: 2600,
  },
  {
    id: 'loopos-stop',
    stepId: 'loopos_build',
    kind: 'STOP_LOOPOS',
    delayMs: 200,
  },
  {
    id: 'aqua-switch',
    stepId: 'aqua_pitch',
    kind: 'SET_OS',
    delayMs: 800,
  },
  {
    id: 'aqua-note',
    stepId: 'aqua_pitch',
    kind: 'SHOW_NOTE',
    delayMs: 700,
    payload:
      'In Aqua OS we turn the loop into a story – a pitch that actually lands with press, playlists, and partners.',
  },
  {
    id: 'aqua-open-coach',
    stepId: 'aqua_pitch',
    kind: 'OPEN_AQUA_AGENT',
    delayMs: 900,
  },
  {
    id: 'aqua-final-note',
    stepId: 'end',
    kind: 'SHOW_NOTE',
    delayMs: 1400,
    payload:
      'Ideas → agents → loops → pitches. That’s the totalaud.io constellation in one quick run.',
  },
]
