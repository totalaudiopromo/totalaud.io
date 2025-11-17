/**
 * Phase 34: Global Search Engine - Journal Entries Source
 */

import { calculateFinalScore } from '../scoring'
import type { SearchResult } from './notes'

export async function searchJournal(query: string, workspaceId: string): Promise<SearchResult[]> {
  // Mock journal entries (similar to notes but from formal journal)
  const mockEntries = [
    {
      id: 'journal-1',
      title: 'Morning reflection on campaign',
      subtitle: 'Journal • Yesterday',
      body: 'Feeling good about the radio strategy. Need to follow up with BBC contacts.',
      date: new Date(Date.now() - 86400000).toISOString(),
    },
  ]

  const results: SearchResult[] = mockEntries
    .map((entry) => {
      const score = calculateFinalScore(
        query,
        { title: entry.title, subtitle: entry.subtitle, body: entry.body },
        'journal',
        entry.date
      )

      return {
        id: entry.id,
        type: 'journal' as const,
        title: entry.title,
        subtitle: entry.subtitle,
        body: entry.body,
        date: entry.date,
        score,
      }
    })
    .filter((r) => r.score > 0.3)
    .sort((a, b) => b.score - a.score)

  return results
}
