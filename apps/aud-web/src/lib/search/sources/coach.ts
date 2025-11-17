/**
 * Phase 34: Global Search Engine - Coach Messages Source
 */

import { calculateFinalScore } from '../scoring'
import type { SearchResult } from './notes'

export async function searchCoach(query: string, workspaceId: string): Promise<SearchResult[]> {
  const mockMessages = [
    {
      id: 'coach-1',
      title: 'Release strategy discussion',
      subtitle: 'Coach conversation • 3 days ago',
      body: 'You could try focusing on local radio first before national. Build momentum gradually.',
      date: new Date(Date.now() - 259200000).toISOString(),
    },
    {
      id: 'coach-2',
      title: 'Social media timing advice',
      subtitle: 'Coach conversation • 1 week ago',
      body: 'Start teasing 2 weeks before release. Use behind-the-scenes content to build anticipation.',
      date: new Date(Date.now() - 604800000).toISOString(),
    },
  ]

  const results: SearchResult[] = mockMessages
    .map((msg) => {
      const score = calculateFinalScore(
        query,
        { title: msg.title, subtitle: msg.subtitle, body: msg.body },
        'coach',
        msg.date
      )

      return {
        id: msg.id,
        type: 'coach' as const,
        title: msg.title,
        subtitle: msg.subtitle,
        body: msg.body,
        date: msg.date,
        score,
      }
    })
    .filter((r) => r.score > 0.3)
    .sort((a, b) => b.score - a.score)

  return results
}
