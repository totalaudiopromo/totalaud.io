/**
 * Phase 34: Global Search Engine - Analogue Cards Source
 */

import { calculateFinalScore } from '../scoring'
import type { SearchResult } from './notes'

export async function searchCards(query: string, workspaceId: string): Promise<SearchResult[]> {
  // Mock results
  const mockCards = [
    {
      id: 'card-1',
      title: 'EP concept notes',
      subtitle: 'Creative direction',
      body: 'Dark, lo-fi, introspective. Late night studio vibes.',
      date: new Date(Date.now() - 432000000).toISOString(),
    },
    {
      id: 'card-2',
      title: 'Press kit outline',
      subtitle: 'PR materials',
      body: 'Bio, photos, press release, key quotes, links',
      date: new Date(Date.now() - 864000000).toISOString(),
    },
  ]

  const results: SearchResult[] = mockCards
    .map((card) => {
      const score = calculateFinalScore(
        query,
        { title: card.title, subtitle: card.subtitle, body: card.body },
        'card',
        card.date
      )

      return {
        id: card.id,
        type: 'card' as const,
        title: card.title,
        subtitle: card.subtitle,
        body: card.body,
        date: card.date,
        score,
      }
    })
    .filter((r) => r.score > 0.3)
    .sort((a, b) => b.score - a.score)

  return results
}
