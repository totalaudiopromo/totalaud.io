/**
 * Phase 33: Global Command Palette - Search Utilities
 *
 * Fuzzy matching, British spelling normalisation, and result scoring.
 */

import type { SearchResult, CommandDefinition } from './types'

/**
 * British to American spelling mappings for search normalisation
 */
const BRITISH_TO_AMERICAN: Record<string, string> = {
  colour: 'color',
  behaviour: 'behavior',
  centre: 'center',
  optimise: 'optimize',
  analyse: 'analyze',
  organise: 'organize',
  visualise: 'visualize',
  recognise: 'recognize',
  licence: 'license',
  practise: 'practice',
  favour: 'favor',
  honour: 'honor',
  labour: 'labor',
  neighbour: 'neighbor',
}

/**
 * Normalise text for search (British + American spellings)
 */
export function normaliseForSearch(text: string): string {
  let normalized = text.toLowerCase().trim()

  // Replace British spellings with American equivalents for better matching
  Object.entries(BRITISH_TO_AMERICAN).forEach(([british, american]) => {
    const regex = new RegExp(british, 'gi')
    normalized = normalized.replace(regex, american)
  })

  return normalized
}

/**
 * Calculate fuzzy match score (0-1)
 */
export function fuzzyMatch(query: string, target: string): number {
  const normalizedQuery = normaliseForSearch(query)
  const normalizedTarget = normaliseForSearch(target)

  // Exact match = 1.0
  if (normalizedTarget === normalizedQuery) return 1.0

  // Starts with = 0.9
  if (normalizedTarget.startsWith(normalizedQuery)) return 0.9

  // Contains = 0.7
  if (normalizedTarget.includes(normalizedQuery)) return 0.7

  // Fuzzy character matching
  let queryIndex = 0
  let targetIndex = 0
  let matches = 0

  while (queryIndex < normalizedQuery.length && targetIndex < normalizedTarget.length) {
    if (normalizedQuery[queryIndex] === normalizedTarget[targetIndex]) {
      matches++
      queryIndex++
    }
    targetIndex++
  }

  // Partial fuzzy match
  const fuzzyScore = matches / normalizedQuery.length
  return fuzzyScore >= 0.5 ? fuzzyScore * 0.6 : 0
}

/**
 * Score a search result based on multiple factors
 */
export function scoreResult(
  query: string,
  result: {
    title: string
    subtitle?: string
    content?: string
    keywords?: string[]
    type: string
    created_at?: string
  }
): number {
  if (!query.trim()) return 1.0

  let score = 0

  // Title match (weight: 1.0)
  score += fuzzyMatch(query, result.title) * 1.0

  // Subtitle match (weight: 0.7)
  if (result.subtitle) {
    score += fuzzyMatch(query, result.subtitle) * 0.7
  }

  // Content match (weight: 0.5)
  if (result.content) {
    score += fuzzyMatch(query, result.content) * 0.5
  }

  // Keywords match (weight: 0.8)
  if (result.keywords) {
    const keywordScore = Math.max(
      ...result.keywords.map((kw) => fuzzyMatch(query, kw))
    )
    score += keywordScore * 0.8
  }

  // Type weighting (prefer certain types)
  const typeWeights: Record<string, number> = {
    action: 1.2,
    note: 1.1,
    node: 1.1,
    theme: 1.0,
    card: 1.0,
    message: 0.9,
    scene: 0.9,
    rhythm: 0.8,
    workspace: 0.8,
  }
  score *= typeWeights[result.type] || 1.0

  // Recency bonus (if created_at available)
  if (result.created_at) {
    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(result.created_at).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceCreation <= 7) {
      score *= 1.2 // Recent items get 20% boost
    } else if (daysSinceCreation <= 30) {
      score *= 1.1 // Month-old items get 10% boost
    }
  }

  return score
}

/**
 * Filter and sort commands by query
 */
export function filterCommands(
  commands: CommandDefinition[],
  query: string
): SearchResult[] {
  if (!query.trim()) {
    // No query - return all commands as-is
    return commands.map((cmd) => ({
      id: cmd.id,
      type: 'action' as const,
      title: cmd.title,
      subtitle: cmd.subtitle,
      group: cmd.group,
      score: 1.0,
      icon: cmd.icon,
      action: cmd.action,
    }))
  }

  // Score and filter commands
  const scored = commands
    .map((cmd) => ({
      command: cmd,
      score: scoreResult(query, {
        title: cmd.title,
        subtitle: cmd.subtitle,
        keywords: cmd.keywords,
        type: 'action',
      }),
    }))
    .filter(({ score }) => score > 0.3) // Threshold for relevance
    .sort((a, b) => b.score - a.score)

  return scored.map(({ command, score }) => ({
    id: command.id,
    type: 'action' as const,
    title: command.title,
    subtitle: command.subtitle,
    group: command.group,
    score,
    icon: command.icon,
    action: command.action,
  }))
}

/**
 * Group search results by type
 */
export function groupResults(results: SearchResult[]): Array<{
  label: string
  results: SearchResult[]
}> {
  const groups: Record<string, SearchResult[]> = {}

  // Group by result group field
  results.forEach((result) => {
    const groupKey = result.group
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(result)
  })

  // Convert to array and sort groups
  const groupOrder = [
    'Actions',
    'Notes',
    'Timeline',
    'Coach',
    'Scenes',
    'Themes',
    'Rhythm',
    'Workspaces',
  ]

  return Object.entries(groups)
    .map(([label, results]) => ({
      label: capitalizeGroup(label),
      results: results.sort((a, b) => b.score - a.score),
    }))
    .sort((a, b) => {
      const aIndex = groupOrder.indexOf(a.label)
      const bIndex = groupOrder.indexOf(b.label)
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1
      return aIndex - bIndex
    })
}

function capitalizeGroup(group: string): string {
  // Map internal group names to display names
  const groupLabels: Record<string, string> = {
    navigation: 'Navigation',
    creation: 'Actions',
    linking: 'Linking',
    memory: 'Memory',
    ai: 'AI',
    workspace: 'Workspaces',
    settings: 'Settings',
  }

  return groupLabels[group] || group.charAt(0).toUpperCase() + group.slice(1)
}
