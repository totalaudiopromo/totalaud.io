/**
 * Phase 34: Global Search Engine - Fuzzy Text Scoring
 *
 * Fast, simple scoring system for text matching.
 * Not a full fuzzy engine, but good enough for most searches.
 */

import { normaliseText } from './normalise'

/**
 * Calculate fuzzy match score between query and target
 *
 * Scoring:
 * - Exact match: 1.0
 * - Starts with: 0.9
 * - Contains: 0.7
 * - Partial fuzzy (distance 1-2): 0.4-0.6
 * - No match: 0.0
 *
 * @param query - Search query
 * @param target - Text to match against
 * @returns Score between 0.0 and 1.0
 */
export function fuzzyMatch(query: string, target: string): number {
  if (!query || !target) return 0

  const normQuery = normaliseText(query)
  const normTarget = normaliseText(target)

  // Exact match
  if (normQuery === normTarget) return 1.0

  // Starts with
  if (normTarget.startsWith(normQuery)) return 0.9

  // Contains
  if (normTarget.includes(normQuery)) return 0.7

  // Partial fuzzy matching (character-by-character)
  const fuzzyScore = partialFuzzyMatch(normQuery, normTarget)
  if (fuzzyScore >= 0.5) {
    return fuzzyScore * 0.6 // Scale to 0.4-0.6 range
  }

  return 0
}

/**
 * Partial fuzzy matching using character-by-character comparison
 *
 * @param query - Normalised query
 * @param target - Normalised target
 * @returns Match ratio (0.0-1.0)
 */
function partialFuzzyMatch(query: string, target: string): number {
  let queryIndex = 0
  let targetIndex = 0
  let matches = 0

  while (queryIndex < query.length && targetIndex < target.length) {
    if (query[queryIndex] === target[targetIndex]) {
      matches++
      queryIndex++
    }
    targetIndex++
  }

  return matches / query.length
}

/**
 * Calculate multi-field score for a search result
 *
 * Weights:
 * - Title: 1.0
 * - Subtitle: 0.7
 * - Body: 0.5
 * - Keywords: 0.8
 *
 * @param query - Search query
 * @param result - Result to score
 * @returns Combined score
 */
export function scoreResult(
  query: string,
  result: {
    title: string
    subtitle?: string
    body?: string
    keywords?: string[]
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

  // Body match (weight: 0.5)
  if (result.body) {
    score += fuzzyMatch(query, result.body) * 0.5
  }

  // Keywords match (weight: 0.8)
  if (result.keywords && result.keywords.length > 0) {
    const keywordScore = Math.max(...result.keywords.map((kw) => fuzzyMatch(query, kw)))
    score += keywordScore * 0.8
  }

  return score
}

/**
 * Apply recency bonus to score
 *
 * Bonuses:
 * - Last 48 hours: +0.15
 * - Last 7 days: +0.1
 * - Last 30 days: +0.05
 * - Older: +0.0
 *
 * @param baseScore - Base score before recency
 * @param dateString - ISO date string
 * @returns Score with recency bonus
 */
export function applyRecencyBonus(baseScore: number, dateString?: string): number {
  if (!dateString) return baseScore

  const now = Date.now()
  const date = new Date(dateString).getTime()
  const ageMs = now - date

  const HOUR_MS = 1000 * 60 * 60
  const DAY_MS = HOUR_MS * 24

  let bonus = 0

  if (ageMs < 48 * HOUR_MS) {
    // Last 48 hours
    bonus = 0.15
  } else if (ageMs < 7 * DAY_MS) {
    // Last 7 days
    bonus = 0.1
  } else if (ageMs < 30 * DAY_MS) {
    // Last 30 days
    bonus = 0.05
  }

  return baseScore + bonus
}

/**
 * Apply type weighting to score
 *
 * Weights:
 * - Actions: 1.2
 * - Timeline: 1.1
 * - Notes: 1.05
 * - Scenes: 1.05
 * - Coach: 1.0
 * - Memory themes: 0.9
 * - Rhythm: 0.9
 * - Workspaces: 0.7
 * - TAP preview: 0.6
 *
 * @param baseScore - Base score before type weighting
 * @param type - Result type
 * @returns Score with type weighting
 */
export function applyTypeWeighting(
  baseScore: number,
  type:
    | 'action'
    | 'node'
    | 'note'
    | 'scene'
    | 'coach'
    | 'theme'
    | 'rhythm'
    | 'workspace'
    | 'tap'
    | 'card'
    | 'journal'
): number {
  const typeWeights: Record<string, number> = {
    action: 1.2,
    node: 1.1,
    note: 1.05,
    scene: 1.05,
    coach: 1.0,
    theme: 0.9,
    rhythm: 0.9,
    workspace: 0.7,
    tap: 0.6,
    card: 1.05,
    journal: 1.05,
  }

  const weight = typeWeights[type] || 1.0
  return baseScore * weight
}

/**
 * Calculate final score with all factors
 *
 * @param query - Search query
 * @param result - Result to score
 * @param type - Result type
 * @param dateString - Optional date for recency bonus
 * @param semanticBonus - Optional semantic memory bonus
 * @returns Final score
 */
export function calculateFinalScore(
  query: string,
  result: {
    title: string
    subtitle?: string
    body?: string
    keywords?: string[]
  },
  type: string,
  dateString?: string,
  semanticBonus = 0
): number {
  // Base text score
  let score = scoreResult(query, result)

  // Apply recency bonus
  score = applyRecencyBonus(score, dateString)

  // Apply type weighting
  score = applyTypeWeighting(score, type as any)

  // Add semantic bonus
  score += semanticBonus

  return score
}
