import { CoachingMode, CoachingPhase } from '@/stores/usePitchStore'

export const PHASE_INFO: Record<string, { label: string; description: string }> = {
  foundation: {
    label: 'Foundation',
    description: 'Understanding your sound and story',
  },
  refinement: {
    label: 'Refinement',
    description: 'Shaping your message',
  },
  optimisation: {
    label: 'Polish',
    description: 'Final refinement',
  },
}

export const MODE_LABELS: Record<
  CoachingMode,
  { label: string; iconType: 'bolt' | 'target'; description: string }
> = {
  quick: {
    label: 'Quick Tips',
    iconType: 'bolt',
    description: 'Fast, actionable feedback',
  },
  guided: {
    label: 'Deep Dive',
    iconType: 'target',
    description: 'Guided coaching conversation',
  },
}

export const QUICK_ACTIONS: Record<
  CoachingMode,
  Record<CoachingPhase, { label: string; message: string }[]>
> = {
  quick: {
    foundation: [
      { label: 'Improve this section', message: 'Help me improve the section I am working on' },
      { label: 'Check my hook', message: 'Is my hook strong enough?' },
      { label: 'Make it shorter', message: 'Help me make this more concise' },
      { label: 'Add personality', message: 'How can I add more personality to this?' },
    ],
    refinement: [
      { label: 'Make it punchier', message: 'Make this more punchy and impactful' },
      { label: 'Check clarity', message: 'Is my message clear?' },
      { label: 'Improve the hook', message: 'How can I strengthen my hook?' },
      { label: 'Cut the fluff', message: 'What should I remove?' },
    ],
    optimisation: [
      { label: 'Is this ready?', message: 'Is this pitch ready to send?' },
      { label: 'Final polish', message: 'Give me final polish suggestions' },
      { label: 'Check the ask', message: 'Is my ask clear and specific?' },
      { label: 'One last review', message: 'Do a final review of everything' },
    ],
  },
  guided: {
    foundation: [
      { label: 'What makes me unique?', message: 'Help me identify what makes my sound unique' },
      { label: 'My influences', message: 'How should I describe my influences?' },
      { label: 'Target audience', message: 'Who is my ideal listener?' },
      { label: 'My story', message: 'What story should I tell?' },
    ],
    refinement: [
      { label: 'Strengthen the hook', message: 'How can I make my hook more compelling?' },
      { label: 'More vivid language', message: 'Help me use more vivid language' },
      { label: 'What is not working?', message: 'What parts should I cut or change?' },
      { label: 'Does this sound like me?', message: 'Does this feel authentic to my voice?' },
    ],
    optimisation: [
      { label: 'Ready to send?', message: 'Is this pitch ready to send?' },
      { label: 'Check my ask', message: 'Is my ask clear and compelling?' },
      { label: 'Every word counts', message: 'Help me make every word count' },
      { label: 'Match the target', message: 'Does this match my target audience?' },
    ],
  },
}
