/**
 * Phase 33: Global Command Palette - Command Registry
 *
 * Predefined commands for navigation, creation, linking, and AI actions.
 * British tone: "Add..." / "Open..." / "You could..."
 */

import type { CommandDefinition } from './types'

/**
 * Navigation Commands
 */
export const navigationCommands: CommandDefinition[] = [
  {
    id: 'nav-journal',
    title: 'Open journal',
    subtitle: 'View your creative notes',
    group: 'navigation',
    keywords: ['journal', 'notes', 'writing', 'analogue'],
    action: () => {
      window.location.href = '/analogue'
    },
  },
  {
    id: 'nav-timeline',
    title: 'Open timeline',
    subtitle: 'See your project timeline',
    group: 'navigation',
    keywords: ['timeline', 'nodes', 'milestones', 'loopos'],
    action: () => {
      window.location.href = '/timeline'
    },
  },
  {
    id: 'nav-coach',
    title: 'Open coach',
    subtitle: 'Ask for guidance',
    group: 'navigation',
    keywords: ['coach', 'advice', 'help', 'guidance'],
    action: () => {
      window.location.href = '/coach'
    },
  },
  {
    id: 'nav-designer',
    title: 'Open designer',
    subtitle: 'Create visual scenes',
    group: 'navigation',
    keywords: ['designer', 'visual', 'scenes', 'canvas'],
    action: () => {
      window.location.href = '/designer'
    },
  },
  {
    id: 'nav-rhythm',
    title: 'Open rhythm',
    subtitle: 'View your creative patterns',
    group: 'navigation',
    keywords: ['rhythm', 'patterns', 'energy', 'activity'],
    action: () => {
      window.location.href = '/rhythm'
    },
  },
]

/**
 * Creation Commands
 */
export const creationCommands: CommandDefinition[] = [
  {
    id: 'create-note',
    title: 'Add a note',
    subtitle: 'Quick thought or idea',
    group: 'creation',
    keywords: ['new', 'note', 'create', 'write'],
    action: () => {
      window.location.href = '/analogue?action=new-note'
    },
  },
  {
    id: 'create-card',
    title: 'Add an analogue card',
    subtitle: 'Structured creative card',
    group: 'creation',
    keywords: ['new', 'card', 'create', 'analogue'],
    action: () => {
      window.location.href = '/analogue?action=new-card'
    },
  },
  {
    id: 'create-node',
    title: 'Add timeline node',
    subtitle: 'Milestone, task, or idea',
    group: 'creation',
    keywords: ['new', 'node', 'create', 'timeline', 'milestone'],
    action: () => {
      window.location.href = '/timeline?action=new-node'
    },
  },
  {
    id: 'create-scene',
    title: 'Generate a scene',
    subtitle: 'Visual design idea',
    group: 'creation',
    keywords: ['new', 'scene', 'create', 'designer', 'visual'],
    action: () => {
      window.location.href = '/designer?action=new-scene'
    },
  },
  {
    id: 'ask-coach',
    title: 'Ask coach something',
    subtitle: 'Get guidance or suggestions',
    group: 'creation',
    keywords: ['ask', 'coach', 'help', 'question'],
    action: () => {
      window.location.href = '/coach?action=new-message'
    },
  },
]

/**
 * Linking Commands (Context-Aware)
 */
export const linkingCommands: CommandDefinition[] = [
  {
    id: 'link-add-to-timeline',
    title: 'Add to timeline',
    subtitle: 'Convert this note into a timeline node',
    group: 'linking',
    keywords: ['link', 'timeline', 'convert', 'promote'],
    visible: (ctx) => {
      return ctx.surface === 'analogue' && ctx.selectedItemType === 'note'
    },
    action: () => {
      console.log('[Palette] Add to timeline action')
      // Would trigger AddToTimelineModal
    },
  },
  {
    id: 'link-view-origin',
    title: 'View origin',
    subtitle: 'See where this came from',
    group: 'linking',
    keywords: ['link', 'origin', 'source', 'from'],
    visible: (ctx) => {
      return ctx.surface === 'timeline' && ctx.selectedItemType === 'node'
    },
    action: () => {
      console.log('[Palette] View origin action')
    },
  },
  {
    id: 'link-similar',
    title: 'Find similar items',
    subtitle: 'Use memory graph to find related content',
    group: 'linking',
    keywords: ['similar', 'related', 'memory', 'graph'],
    action: () => {
      console.log('[Palette] Find similar action')
    },
  },
]

/**
 * Memory Graph Commands
 */
export const memoryCommands: CommandDefinition[] = [
  {
    id: 'memory-extract-themes',
    title: 'Extract themes',
    subtitle: 'Identify key concepts from your work',
    group: 'memory',
    keywords: ['themes', 'extract', 'memory', 'concepts'],
    action: () => {
      console.log('[Palette] Extract themes action')
    },
  },
  {
    id: 'memory-trends',
    title: 'See creative trends',
    subtitle: 'Patterns in your work over time',
    group: 'memory',
    keywords: ['trends', 'patterns', 'memory', 'graph'],
    action: () => {
      window.location.href = '/memory'
    },
  },
]

/**
 * AI Commands (Calm British Tone)
 */
export const aiCommands: CommandDefinition[] = [
  {
    id: 'ai-summarise',
    title: 'Summarise this workspace',
    subtitle: 'Get an overview of your recent work',
    group: 'ai',
    keywords: ['summarise', 'summary', 'overview', 'ai'],
    action: () => {
      console.log('[Palette] Summarise workspace action')
    },
  },
  {
    id: 'ai-next-steps',
    title: 'Suggest next steps',
    subtitle: 'You could try these things next',
    group: 'ai',
    keywords: ['next', 'steps', 'suggestions', 'ai'],
    action: () => {
      console.log('[Palette] Suggest next steps action')
    },
  },
]

/**
 * Get all default commands
 */
export function getDefaultCommands(): CommandDefinition[] {
  return [
    ...navigationCommands,
    ...creationCommands,
    ...linkingCommands,
    ...memoryCommands,
    ...aiCommands,
  ]
}

/**
 * Get visible commands based on context
 */
export function getVisibleCommands(
  commands: CommandDefinition[],
  context: { surface: string | null; selectedItemType: string | null; selectedItemId: string | null; workspaceId: string | null }
): CommandDefinition[] {
  return commands.filter((cmd) => {
    if (!cmd.visible) return true
    return cmd.visible(context as any)
  })
}
