'use client'

import type { OSSlug } from '@/components/os/navigation'
import type { DemoStepId } from '@/components/demo/DemoScript'

export type NarrativeBeatId =
  | 'lana_intro'
  | 'idea_fork'
  | 'agent_insight'
  | 'loop_momentum'
  | 'pitch_choice'
  | 'epilogue'

export interface NarrativeChoice {
  id: string
  label: string
  nextBeatId: NarrativeBeatId
  tag?: 'short_pitch' | 'long_story' | 'campaign_focus' | 'creative_focus'
}

export interface NarrativeBeat {
  id: NarrativeBeatId
  title: string
  body: string
  os: OSSlug
  stepId: DemoStepId
  choices?: NarrativeChoice[]

  // Optional hints for OS surfaces
  highlightCardTitle?: string
  preferAgentRole?: 'scout' | 'coach' | 'insight'
  emphasiseMomentum?: boolean
}

export const NARRATIVE_BEATS: NarrativeBeat[] = [
  {
    id: 'lana_intro',
    os: 'analogue' as OSSlug,
    stepId: 'analogue_ideas',
    title: 'Lana’s notebook: “Midnight Signals”',
    body: 'We drop into Lana Glass’s notebook while “Midnight Signals” is still half-ideas and sketches – the place where loose notes turn into a real release.',
    highlightCardTitle: 'midnight signals — concept',
  },
  {
    id: 'idea_fork',
    os: 'analogue' as OSSlug,
    stepId: 'analogue_send_to_daw',
    title: 'What do we follow first?',
    body: 'From all these cards, do we zoom in on the creative spark itself or the shape of the campaign that carries it?',
    choices: [
      {
        id: 'idea_fork_creative',
        label: 'Focus on the creative spark',
        nextBeatId: 'agent_insight',
        tag: 'creative_focus',
      },
      {
        id: 'idea_fork_campaign',
        label: 'Focus on the campaign path',
        nextBeatId: 'agent_insight',
        tag: 'campaign_focus',
      },
    ],
  },
  {
    id: 'agent_insight',
    os: 'ascii' as OSSlug,
    stepId: 'ascii_agent_run',
    title: 'Ask an agent to crystallise the plan',
    body: 'We hand the EP to a coach agent and ask it to turn Lana’s mess of ideas into a simple plan we can actually run.',
    preferAgentRole: 'coach',
  },
  {
    id: 'loop_momentum',
    os: 'loopos' as OSSlug,
    stepId: 'loopos_build',
    title: 'Keep the release loop moving',
    body: 'Here the rollout turns into a loop – creative, promo, and analysis blocks that keep “Midnight Signals” from stalling.',
    emphasiseMomentum: true,
  },
  {
    id: 'pitch_choice',
    os: 'aqua' as OSSlug,
    stepId: 'aqua_pitch',
    title: 'Choose how we talk about Lana',
    body: 'All of this lands in how we talk about Lana – either a quick, press-friendly pitch or a slightly longer story with more colour.',
    choices: [
      {
        id: 'pitch_short',
        label: 'Short, punchy pitch',
        nextBeatId: 'epilogue',
        tag: 'short_pitch',
      },
      {
        id: 'pitch_long',
        label: 'Long, narrative story',
        nextBeatId: 'epilogue',
        tag: 'long_story',
      },
    ],
  },
  {
    id: 'epilogue',
    os: 'aqua' as OSSlug,
    stepId: 'end',
    title: 'Wrap the constellation',
    body: 'Notebook to agents to loops to pitch – a full run of how “Midnight Signals” moves from half-finished idea to something you can send.',
  },
]

export function getNarrativeBeatById(id: NarrativeBeatId): NarrativeBeat | undefined {
  return NARRATIVE_BEATS.find((beat) => beat.id === id)
}

export function getNarrativeBeatByStepId(stepId: DemoStepId): NarrativeBeat | undefined {
  return NARRATIVE_BEATS.find((beat) => beat.stepId === stepId)
}


