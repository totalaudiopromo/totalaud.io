/**
 * Phase 34: Global Search Engine - TAP Preview Source
 *
 * Preview mode only - no real API integration yet.
 * Returns stubbed results to demonstrate TAP integration.
 */

import { calculateFinalScore } from '../scoring'
import type { SearchResult } from './notes'

export async function searchTAP(query: string, workspaceId: string): Promise<SearchResult[]> {
  // TAP preview mode - stubbed results
  const mockTAP = [
    {
      id: 'tap-1',
      title: 'TAP: Campaign template',
      subtitle: 'Total Audio Platform • Preview',
      body: 'Pre-built campaign template from TAP library',
    },
  ]

  const results: SearchResult[] = mockTAP
    .map((item) => {
      const score = calculateFinalScore(
        query,
        { title: item.title, subtitle: item.subtitle, body: item.body },
        'tap'
      )

      return {
        id: item.id,
        type: 'tap' as const,
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
