'use client'

import type { AgentRole } from '@/components/agents/AgentTypes'

export type PersonaId = 'lana_glass'

export interface PersonaAesthetic {
  color: string
  accent: string
}

export type PersonaAgentBias = Partial<Record<AgentRole, number>>

export interface PersonaPreset {
  id: PersonaId
  name: string
  tone: string
  traits: string[]
  aesthetic: PersonaAesthetic
  agentBias: PersonaAgentBias
}

export const PERSONA_PRESETS: Record<PersonaId, PersonaPreset> = {
  lana_glass: {
    id: 'lana_glass',
    name: 'Lana Glass',
    tone: 'late-night neon melancholy with hopeful edges',
    traits: ['introspective', 'etherial', 'urban ghost stories'],
    aesthetic: {
      color: '#A0E4FF',
      accent: '#5FF1CE',
    },
    agentBias: {
      scout: 0.2,
      coach: 0.1,
      insight: 0.15,
      tracker: -0.1,
    },
  },
}

export function getPersonaPreset(id: PersonaId): PersonaPreset | null {
  return PERSONA_PRESETS[id] ?? null
}


