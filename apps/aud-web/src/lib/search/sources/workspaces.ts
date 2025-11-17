/**
 * Phase 34: Global Search Engine - Workspaces Source
 */

import { calculateFinalScore } from '../scoring'
import type { SearchResult } from './notes'

export async function searchWorkspaces(query: string, workspaceId: string): Promise<SearchResult[]> {
  const mockWorkspaces = [
    {
      id: 'workspace-1',
      title: 'EP Release Campaign',
      subtitle: 'Workspace • Active',
      body: 'Main project workspace for upcoming EP release',
      date: new Date(Date.now() - 2592000000).toISOString(),
    },
  ]

  const results: SearchResult[] = mockWorkspaces
    .map((ws) => {
      const score = calculateFinalScore(
        query,
        { title: ws.title, subtitle: ws.subtitle, body: ws.body },
        'workspace',
        ws.date
      )

      return {
        id: ws.id,
        type: 'workspace' as const,
        title: ws.title,
        subtitle: ws.subtitle,
        body: ws.body,
        date: ws.date,
        score,
      }
    })
    .filter((r) => r.score > 0.3)
    .sort((a, b) => b.score - a.score)

  return results
}
