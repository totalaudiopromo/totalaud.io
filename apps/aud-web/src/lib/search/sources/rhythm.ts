/**
 * Phase 34: Global Search Engine - Rhythm Source
 */

import { calculateFinalScore } from '../scoring'
import type { SearchResult } from './notes'

export async function searchRhythm(query: string, workspaceId: string): Promise<SearchResult[]> {
  const mockRhythm = [
    {
      id: 'rhythm-1',
      title: 'Most active in morning',
      subtitle: 'Energy window insight',
      body: 'You tend to be most productive between 8am and noon',
    },
    {
      id: 'rhythm-2',
      title: '5 day streak',
      subtitle: 'Return pattern',
      body: 'You've been here 5 days in a row. Nice rhythm.',
    },
  ]

  const results: SearchResult[] = mockRhythm
    .map((item) => {
      const score = calculateFinalScore(
        query,
        { title: item.title, subtitle: item.subtitle, body: item.body },
        'rhythm'
      )

      return {
        id: item.id,
        type: 'rhythm' as const,
        title: item.title,
        subtitle: item.subtitle,
        body: item.body,
        score,
      }
    })
    .filter((r) => r.score > 0.3)
    .sort((a, b) => b.score - a.score)

  return results
}
