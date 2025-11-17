/**
 * Phase 34: Global Search Engine - Memory Graph Themes Source
 */

import { calculateFinalScore } from '../scoring'
import { extractQueryThemes } from '../semantic'
import type { SearchResult } from './notes'

export async function searchMemory(query: string, workspaceId: string): Promise<SearchResult[]> {
  // Extract themes from query
  const queryThemes = extractQueryThemes(query)

  const mockThemes = [
    {
      id: 'theme-1',
      title: 'Radio Promotion',
      subtitle: 'Memory theme • 12 connections',
      body: 'Common theme across your notes and timeline',
    },
    {
      id: 'theme-2',
      title: 'Release Planning',
      subtitle: 'Memory theme • 8 connections',
      body: 'Strategic planning for releases and campaigns',
    },
    {
      id: 'theme-3',
      title: 'Social Media',
      subtitle: 'Memory theme • 6 connections',
      body: 'Content strategy and platform management',
    },
  ]

  const results: SearchResult[] = mockThemes
    .map((theme) => {
      const score = calculateFinalScore(
        query,
        { title: theme.title, subtitle: theme.subtitle, body: theme.body },
        'theme'
      )

      return {
        id: theme.id,
        type: 'theme' as const,
        title: theme.title,
        subtitle: theme.subtitle,
        body: theme.body,
        score,
      }
    })
    .filter((r) => r.score > 0.3)
    .sort((a, b) => b.score - a.score)

  return results
}
