/**
 * Phase 34: Global Search Engine - Semantic Memory Integration
 *
 * Uses the Memory Graph (Phase 11) to boost search relevance
 * based on thematic connections.
 */

import { normaliseText } from './normalise'

/**
 * Calculate semantic bonus based on Memory Graph connections
 *
 * Bonuses:
 * - Shared themes: +0.1 to +0.25
 * - "related_to" edges: +0.05 to +0.15
 * - "inspires" edges: +0.1
 * - Artist's core themes: +0.2
 *
 * @param query - Search query
 * @param resultId - Result ID to check
 * @param workspaceId - Current workspace
 * @returns Semantic bonus (0.0 - 0.5)
 */
export async function calculateSemanticBonus(
  query: string,
  resultId: string,
  workspaceId: string
): Promise<number> {
  // TODO: In production, query Memory Graph database
  // For now, return 0 (no semantic bonus)

  // Example implementation (when Memory Graph is available):
  /*
  const memoryDb = getMemoryDb()

  // Extract query themes
  const queryThemes = await memoryDb.extractThemes(query)

  // Get result's connected themes
  const resultNode = await memoryDb.getNode(resultId)
  const resultThemes = await memoryDb.getConnectedThemes(resultId)

  let bonus = 0

  // Shared themes
  const sharedThemes = queryThemes.filter(t => resultThemes.includes(t))
  bonus += Math.min(sharedThemes.length * 0.1, 0.25)

  // Related edges
  const relatedEdges = await memoryDb.getEdges(resultId, 'related_to')
  bonus += Math.min(relatedEdges.length * 0.05, 0.15)

  // Inspires edges
  const inspiresEdges = await memoryDb.getEdges(resultId, 'inspires')
  bonus += inspiresEdges.length > 0 ? 0.1 : 0

  // Core themes
  const coreThemes = await memoryDb.getCoreThemes(workspaceId)
  const hasCoreTheme = resultThemes.some(t => coreThemes.includes(t))
  if (hasCoreTheme) bonus += 0.2

  return Math.min(bonus, 0.5)
  */

  return 0
}

/**
 * Extract potential themes from query text
 *
 * Simple keyword-based theme extraction.
 * In production, this would use the Memory Graph.
 *
 * @param query - Search query
 * @returns Array of potential themes
 */
export function extractQueryThemes(query: string): string[] {
  const normalized = normaliseText(query)

  // Common music industry themes
  const themeKeywords: Record<string, string[]> = {
    'Release Planning': ['release', 'launch', 'drop', 'album', 'single', 'ep'],
    'Radio Promotion': ['radio', 'airplay', 'playlist', 'rotation', 'dj'],
    'Social Media': ['social', 'instagram', 'tiktok', 'twitter', 'facebook', 'content'],
    'Press & PR': ['press', 'pr', 'media', 'interview', 'article', 'feature'],
    'Live Shows': ['gig', 'show', 'concert', 'tour', 'performance', 'live'],
    'Marketing': ['marketing', 'promo', 'campaign', 'advertising', 'ads'],
    'Branding': ['brand', 'identity', 'aesthetic', 'visual', 'artwork', 'design'],
    'Fan Engagement': ['fans', 'community', 'audience', 'engagement', 'interaction'],
    'Music Distribution': ['distribution', 'spotify', 'apple music', 'streaming', 'platforms'],
    'Collaboration': ['collab', 'collaboration', 'feature', 'partnership', 'together'],
  }

  const themes: string[] = []

  // Check each theme category
  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    // If any keyword matches, add theme
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      themes.push(theme)
    }
  }

  return themes
}

/**
 * Check if result matches any of the query themes
 *
 * @param queryThemes - Themes extracted from query
 * @param resultText - Result text to check
 * @returns Match score (0.0 - 1.0)
 */
export function matchThemes(queryThemes: string[], resultText: string): number {
  if (queryThemes.length === 0) return 0

  const normalized = normaliseText(resultText)

  let matches = 0

  for (const theme of queryThemes) {
    if (normalized.includes(normaliseText(theme))) {
      matches++
    }
  }

  return matches / queryThemes.length
}
