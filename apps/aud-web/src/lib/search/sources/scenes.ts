/**
 * Phase 34: Global Search Engine - Designer Scenes Source
 */

import { calculateFinalScore } from '../scoring'
import type { SearchResult } from './notes'

export async function searchScenes(query: string, workspaceId: string): Promise<SearchResult[]> {
  const mockScenes = [
    {
      id: 'scene-1',
      title: 'Dark lo-fi aesthetic',
      subtitle: 'Visual scene • Designer',
      body: 'Late night studio vibes, warm analog tones, minimalist design',
      date: new Date(Date.now() - 432000000).toISOString(),
    },
  ]

  const results: SearchResult[] = mockScenes
    .map((scene) => {
      const score = calculateFinalScore(
        query,
        { title: scene.title, subtitle: scene.subtitle, body: scene.body },
        'scene',
        scene.date
      )

      return {
        id: scene.id,
        type: 'scene' as const,
        title: scene.title,
        subtitle: scene.subtitle,
        body: scene.body,
        date: scene.date,
        score,
      }
    })
    .filter((r) => r.score > 0.3)
    .sort((a, b) => b.score - a.score)

  return results
}
