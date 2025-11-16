/**
 * Demo Script - Lana Glass Artist Demo
 * Defines the narrative steps for /demo/artist
 */

export type DemoStepId =
  | 'analogue-intro'
  | 'ascii-intro'
  | 'xp-intro'
  | 'loopos-intro'
  | 'aqua-intro'

export interface DemoStep {
  id: DemoStepId
  title: string
  description: string
  osSlug: 'analogue' | 'ascii' | 'xp' | 'loopos' | 'aqua'
}

export const DEMO_STEPS: DemoStep[] = [
  {
    id: 'analogue-intro',
    title: 'Creative Notebook',
    description: "Lana's handwritten concepts and midnight signals",
    osSlug: 'analogue',
  },
  {
    id: 'ascii-intro',
    title: 'Command Agent',
    description: 'Running an AI agent to plan the EP announcement',
    osSlug: 'ascii',
  },
  {
    id: 'xp-intro',
    title: 'Agent Monitor',
    description: 'Viewing agent results and recommendations',
    osSlug: 'xp',
  },
  {
    id: 'loopos-intro',
    title: 'Creative Timeline',
    description: 'The production workflow and collaboration lanes',
    osSlug: 'loopos',
  },
  {
    id: 'aqua-intro',
    title: 'Coach Agent',
    description: 'Getting strategic guidance on the pitch',
    osSlug: 'aqua',
  },
]
