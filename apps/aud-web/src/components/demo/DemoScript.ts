'use client'

import type { OSSlug } from '@/components/os/navigation'

export type DemoStepId =
  | 'analogue_ideas'
  | 'analogue_send_to_daw'
  | 'ascii_agent_run'
  | 'xp_monitor'
  | 'loopos_build'
  | 'loopos_ai'
  | 'aqua_pitch'
  | 'end'

export interface DemoStep {
  id: DemoStepId
  title: string
  description: string
  os: OSSlug | 'loopos'
  helpText?: string
  ctaLabel?: string
  autoAdvance?: boolean
}

export const DEMO_STEPS: DemoStep[] = [
  {
    id: 'analogue_ideas',
    os: 'analogue',
    title: 'Ideas in LANA’s notebook',
    description: 'This is Lana’s notebook for the “Midnight Signals” EP.',
    helpText:
      'Click through the cards, star the most important ones, and imagine which idea becomes the lead single.',
  },
  {
    id: 'analogue_send_to_daw',
    os: 'analogue',
    title: 'Mark one idea for the workflow',
    description:
      'From here we decide what actually moves downstream – what makes it out of the notebook and into the timeline.',
    helpText:
      'Pick one idea you like and mark it to send into the workflow later with the DAW / LoopOS bridges.',
  },
  {
    id: 'ascii_agent_run',
    os: 'ascii',
    title: 'Ask an agent to shape the campaign',
    description: 'Now we bring in a coach agent to help shape the release.',
    helpText:
      'Try: agent run coach "Suggest an announcement plan for the ‘Midnight Signals’ EP." Then watch XP for the run.',
  },
  {
    id: 'xp_monitor',
    os: 'xp',
    title: 'Watch agents work in XP',
    description:
      'XP OS is the retro desktop where you can watch runs come and go in the Agent Monitor and clipboard.',
    helpText:
      'Open the clipboard and process windows, then click into a completed run to see the raw input and output.',
  },
  {
    id: 'loopos_build',
    os: 'loopos',
    title: 'LANA’s release loop',
    description: 'Here we turn ideas into a looping workflow.',
    helpText:
      'Scroll across the loop, click clips, and see how creative, promo, and analysis lanes keep the release moving.',
  },
  {
    id: 'loopos_ai',
    os: 'loopos',
    title: 'Ask LoopOS for next clips',
    description:
      'From here you can ask the AI layer to suggest the next clips so the “Midnight Signals” rollout never stalls.',
    helpText:
      'Use “Generate AI suggestions” in the inspector, review what it suggests, and accept one into the loop.',
  },
  {
    id: 'aqua_pitch',
    os: 'aqua',
    title: 'Turn the loop into a pitch',
    description: 'Then we turn the loop into something you can actually send.',
    helpText:
      'Review the artist, release, and pitch fields already filled for LANA. Use “Ask Coach about this pitch” if you like.',
  },
  {
    id: 'end',
    os: 'aqua',
    title: 'You’ve seen the constellation',
    description:
      'Ideas in Analogue, agents in ASCII, monitoring in XP, loops in LoopOS, and stories in Aqua – all wired together.',
    helpText: 'Hit Exit to drop back into the OS launcher whenever you’re ready.',
    ctaLabel: 'Exit demo',
  },
]

export const DEMO_ACTIVE_STEPS = DEMO_STEPS.filter((step) => step.id !== 'end')


