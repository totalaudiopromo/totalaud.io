/**
 * Phase 34: Global Search Engine - Timeline Source
 */

import { calculateFinalScore } from '../scoring'
import type { SearchResult } from './notes'

export async function searchTimeline(query: string, workspaceId: string): Promise<SearchResult[]> {
  // Mock timeline nodes
  const mockNodes = [
    {
      id: 'node-1',
      title: 'Single release date',
      subtitle: 'Milestone • March 15th',
      body: 'Official release on all platforms',
      date: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'node-2',
      title: 'Radio promo campaign',
      subtitle: 'Task • In progress',
      body: 'Contact BBC Radio 1, 6 Music, local stations. Send press kit.',
      date: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: 'node-3',
      title: 'Social media rollout',
      subtitle: 'Task • Upcoming',
      body: 'TikTok teasers, Instagram countdown, behind-the-scenes content',
      date: new Date(Date.now() - 259200000).toISOString(),
    },
  ]

  const results: SearchResult[] = mockNodes
    .map((node) => {
      const score = calculateFinalScore(
        query,
        { title: node.title, subtitle: node.subtitle, body: node.body },
        'node',
        node.date
      )

      return {
        id: node.id,
        type: 'node' as const,
        title: node.title,
        subtitle: node.subtitle,
        body: node.body,
        date: node.date,
        score,
      }
    })
    .filter((r) => r.score > 0.3)
    .sort((a, b) => b.score - a.score)

  return results
}
