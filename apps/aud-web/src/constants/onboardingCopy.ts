/**
 * Onboarding Microcopy
 * Phase 14.1: FlowCore onboarding tour copy
 *
 * Tone: Lowercase, British English, short sentences, no emojis
 */

export interface OnboardingStep {
  id: string
  title: string
  text: string
  targetSelector?: string // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

export const onboardingCopy: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'welcome to your campaign os.',
    text: 'plan, pitch and track every release in one flow-state workspace. this quick tour shows you the essentials.',
    position: 'center',
  },
  {
    id: 'campaign-title',
    title: 'rename your campaign',
    text: 'click the title above to make it yours.',
    targetSelector: '[data-onboarding="campaign-title"]',
    position: 'bottom',
  },
  {
    id: 'command-palette',
    title: 'open command',
    text: 'press ⌘K to explore actions and agents.',
    targetSelector: '[data-onboarding="command-palette-trigger"]',
    position: 'bottom',
  },
  {
    id: 'canvas',
    title: 'place your first agent',
    text: 'click the canvas to begin your flow.',
    targetSelector: '[data-onboarding="flow-canvas"]',
    position: 'top',
  },
  {
    id: 'insights',
    title: 'track progress',
    text: 'insight panel shows your live results.',
    targetSelector: '[data-onboarding="insight-panel"]',
    position: 'left',
  },
]

export const onboardingActions = {
  skip: 'skip tour',
  next: 'next',
  finish: 'finish tour',
  previous: 'back',
  restart: 'restart onboarding',
} as const
