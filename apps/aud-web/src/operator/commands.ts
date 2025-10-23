/**
 * Command Registry
 *
 * Defines all operator commands available in the Command Palette
 * Each command maps to a workspace action or UI operation
 *
 * Operator Command Palette - Flow Architect
 */

import type { WorkspaceTab, WorkflowType } from '@aud-web/stores/workspaceStore'
import { Search, FileText, Send, BarChart3, Lightbulb, Layout } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type CommandScope = WorkspaceTab | 'global'
export type CommandCategory = 'workflow' | 'navigation' | 'data'

export interface Command {
  id: string
  label: string
  description: string
  aliases: string[]
  scope: CommandScope
  category: CommandCategory
  icon: LucideIcon
  workflowType?: WorkflowType // Maps to workspaceStore.runAction()
  requiresCampaign?: boolean
  action?: 'switchTab' // For navigation commands
  params?: Record<string, any>
}

/**
 * Command Registry
 *
 * Organized by category:
 * - Workflow commands (execute actions)
 * - Navigation commands (switch tabs)
 * - Data commands (future: export, import, etc.)
 */
export const commands: Command[] = [
  // ========================================
  // Workflow Commands (Do Tab)
  // ========================================
  {
    id: 'find_curators',
    label: 'Find Curators',
    description: 'Search for relevant playlist curators and radio contacts',
    aliases: ['find', 'research', 'curators', 'contacts', 'discover'],
    scope: 'do',
    category: 'workflow',
    icon: Search,
    workflowType: 'find_curators',
    requiresCampaign: true,
  },
  {
    id: 'generate_pitch',
    label: 'Generate Pitch',
    description: 'Create personalized pitch email for your campaign',
    aliases: ['pitch', 'write', 'generate', 'email', 'compose'],
    scope: 'do',
    category: 'workflow',
    icon: FileText,
    workflowType: 'generate_pitch',
    requiresCampaign: true,
  },
  {
    id: 'send_outreach',
    label: 'Send Outreach',
    description: 'Send pitch emails to selected targets',
    aliases: ['send', 'outreach', 'email', 'dispatch', 'deliver'],
    scope: 'do',
    category: 'workflow',
    icon: Send,
    workflowType: 'send_outreach',
    requiresCampaign: true,
  },

  // ========================================
  // Navigation Commands (Global)
  // ========================================
  {
    id: 'nav_plan',
    label: 'Go to Plan',
    description: 'Switch to Plan tab (releases and campaigns)',
    aliases: ['plan', 'releases', 'campaigns', 'setup'],
    scope: 'global',
    category: 'navigation',
    icon: Layout,
    action: 'switchTab',
    params: { tab: 'plan' },
  },
  {
    id: 'nav_do',
    label: 'Go to Do',
    description: 'Switch to Do tab (workflow execution)',
    aliases: ['do', 'execute', 'run', 'workflows'],
    scope: 'global',
    category: 'navigation',
    icon: Layout,
    action: 'switchTab',
    params: { tab: 'do' },
  },
  {
    id: 'nav_track',
    label: 'Go to Track',
    description: 'Switch to Track tab (campaign metrics)',
    aliases: ['track', 'metrics', 'analytics', 'results'],
    scope: 'global',
    category: 'navigation',
    icon: BarChart3,
    action: 'switchTab',
    params: { tab: 'track' },
  },
  {
    id: 'nav_learn',
    label: 'Go to Learn',
    description: 'Switch to Learn tab (insights and recommendations)',
    aliases: ['learn', 'insights', 'recommendations', 'tips'],
    scope: 'global',
    category: 'navigation',
    icon: Lightbulb,
    action: 'switchTab',
    params: { tab: 'learn' },
  },
]

/**
 * Get commands filtered by scope
 */
export function getCommandsByScope(scope: CommandScope): Command[] {
  return commands.filter((cmd) => cmd.scope === scope || cmd.scope === 'global')
}

/**
 * Get commands filtered by category
 */
export function getCommandsByCategory(category: CommandCategory): Command[] {
  return commands.filter((cmd) => cmd.category === category)
}

/**
 * Search commands by query (fuzzy match on label, description, and aliases)
 */
export function searchCommands(query: string, scope?: CommandScope): Command[] {
  const lowerQuery = query.toLowerCase().trim()

  if (!lowerQuery) {
    return scope ? getCommandsByScope(scope) : commands
  }

  return commands.filter((cmd) => {
    // Filter by scope if provided
    if (scope && cmd.scope !== scope && cmd.scope !== 'global') {
      return false
    }

    // Match against label, description, and aliases
    const searchableText = [
      cmd.label,
      cmd.description,
      ...cmd.aliases,
    ].join(' ').toLowerCase()

    return searchableText.includes(lowerQuery)
  })
}

/**
 * Get command by ID
 */
export function getCommandById(id: string): Command | undefined {
  return commands.find((cmd) => cmd.id === id)
}
