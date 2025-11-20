'use client'

import type { AgentOriginOS, AgentRole } from '../AgentTypes'

export type AgentTeamId =
  | 'creative_team'
  | 'promo_team'
  | 'analysis_team'
  | 'loopos_team'

export interface AgentTeamWhenConditions {
  os?: AgentOriginOS[]
  loopMomentumMin?: number
}

export interface AgentTeamPreset {
  id: AgentTeamId
  label: string
  description: string
  sequence: AgentRole[]
  when?: AgentTeamWhenConditions
}

export const AGENT_TEAM_PRESETS: Record<AgentTeamId, AgentTeamPreset> = {
  creative_team: {
    id: 'creative_team',
    label: 'Creative Team',
    description: 'Scout → Coach → Insight sequence for shaping ideas into workable pitches.',
    sequence: ['scout', 'coach', 'insight'],
    when: {
      os: ['analogue', 'ascii', 'aqua'],
    },
  },
  promo_team: {
    id: 'promo_team',
    label: 'Promo Team',
    description: 'Scout → Insight → Tracker focusing on campaigns, channels, and follow-up.',
    sequence: ['scout', 'insight', 'tracker'],
    when: {
      os: ['aqua', 'xp', 'ascii'],
    },
  },
  analysis_team: {
    id: 'analysis_team',
    label: 'Analysis Team',
    description: 'Insight-led loop that zooms out, critiques, and logs next moves.',
    sequence: ['insight', 'coach', 'tracker'],
    when: {
      os: ['xp', 'ascii'],
    },
  },
  loopos_team: {
    id: 'loopos_team',
    label: 'LoopOS Team',
    description: 'Scout → Insight → Coach tuned for live loops and momentum.',
    sequence: ['scout', 'insight', 'coach'],
    when: {
      os: ['loopos'],
      loopMomentumMin: 0.2,
    },
  },
}

export function getAgentTeamPreset(teamId: AgentTeamId): AgentTeamPreset | null {
  return AGENT_TEAM_PRESETS[teamId] ?? null
}


