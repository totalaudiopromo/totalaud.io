/**
 * Phase 34: Global Search Engine - Main Engine
 *
 * Orchestrates all search sources and combines results.
 * Powers ⌘K palette, /search page, AI agents, and TAP integration.
 */

import { normaliseQuery } from './normalise'
import { searchNotes } from './sources/notes'
import { searchCards } from './sources/cards'
import { searchTimeline } from './sources/timeline'
import { searchJournal } from './sources/journal'
import { searchCoach } from './sources/coach'
import { searchScenes } from './sources/scenes'
import { searchMemory } from './sources/memory'
import { searchRhythm } from './sources/rhythm'
import { searchWorkspaces } from './sources/workspaces'
import { searchTAP } from './sources/tap'
import type { SearchResult } from './sources/notes'

export interface SearchOptions {
  query: string
  workspaceId: string
  maxPerGroup?: number
  includeActions?: boolean
  includeTAP?: boolean
}

export interface SearchResponse {
  groups: {
    actions?: SearchResult[]
    notes: SearchResult[]
    cards: SearchResult[]
    timeline: SearchResult[]
    journal: SearchResult[]
    coach: SearchResult[]
    scenes: SearchResult[]
    themes: SearchResult[]
    rhythm: SearchResult[]
    workspaces: SearchResult[]
    tap: SearchResult[]
  }
  query: string
  totalResults: number
}

/**
 * Main search engine
 *
 * Searches all sources in parallel and combines results.
 *
 * @param options - Search options
 * @returns Grouped search results
 */
export async function search(options: SearchOptions): Promise<SearchResponse> {
  const { query, workspaceId, maxPerGroup = 5, includeActions = false, includeTAP = false } = options

  // Normalise query
  const normalisedQuery = normaliseQuery(query)

  // If empty query, return empty results
  if (!normalisedQuery.trim()) {
    return {
      groups: {
        notes: [],
        cards: [],
        timeline: [],
        journal: [],
        coach: [],
        scenes: [],
        themes: [],
        rhythm: [],
        workspaces: [],
        tap: [],
      },
      query,
      totalResults: 0,
    }
  }

  // Search all sources in parallel
  const [
    notesResults,
    cardsResults,
    timelineResults,
    journalResults,
    coachResults,
    scenesResults,
    themesResults,
    rhythmResults,
    workspacesResults,
    tapResults,
  ] = await Promise.all([
    searchNotes(normalisedQuery, workspaceId),
    searchCards(normalisedQuery, workspaceId),
    searchTimeline(normalisedQuery, workspaceId),
    searchJournal(normalisedQuery, workspaceId),
    searchCoach(normalisedQuery, workspaceId),
    searchScenes(normalisedQuery, workspaceId),
    searchMemory(normalisedQuery, workspaceId),
    searchRhythm(normalisedQuery, workspaceId),
    searchWorkspaces(normalisedQuery, workspaceId),
    includeTAP ? searchTAP(normalisedQuery, workspaceId) : Promise.resolve([]),
  ])

  // Limit results per group
  const limitResults = (results: SearchResult[]) => results.slice(0, maxPerGroup)

  const groups = {
    notes: limitResults(notesResults),
    cards: limitResults(cardsResults),
    timeline: limitResults(timelineResults),
    journal: limitResults(journalResults),
    coach: limitResults(coachResults),
    scenes: limitResults(scenesResults),
    themes: limitResults(themesResults),
    rhythm: limitResults(rhythmResults),
    workspaces: limitResults(workspacesResults),
    tap: limitResults(tapResults),
  }

  // Calculate total results
  const totalResults = Object.values(groups).reduce((sum, group) => sum + group.length, 0)

  return {
    groups,
    query,
    totalResults,
  }
}

/**
 * Get all results (no grouping, sorted by score)
 *
 * Useful for AI agents that need flat list of best matches.
 *
 * @param options - Search options
 * @returns Flat array of results sorted by score
 */
export async function searchFlat(options: SearchOptions): Promise<SearchResult[]> {
  const response = await search(options)

  // Flatten all groups
  const allResults: SearchResult[] = []

  Object.values(response.groups).forEach((group) => {
    if (group) {
      allResults.push(...group)
    }
  })

  // Sort by score DESC
  allResults.sort((a, b) => b.score - a.score)

  return allResults
}
