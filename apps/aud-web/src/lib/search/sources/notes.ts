/**
 * Phase 34: Global Search Engine - Notes Source
 *
 * Searches journal notes and analogue notes.
 */

import { calculateFinalScore } from '../scoring'

export interface SearchResult {
  id: string
  type: 'note' | 'card' | 'node' | 'journal' | 'coach' | 'scene' | 'theme' | 'rhythm' | 'workspace' | 'tap' | 'action'
  title: string
  subtitle?: string
  body?: string
  date?: string
  context?: Record<string, any>
  score: number
}

/**
 * Search notes in workspace
 *
 * TODO: In production, query loopos_notes or loopos_journal_entries
 *
 * @param query - Search query
 * @param workspaceId - Workspace ID
 * @returns Array of note search results
 */
export async function searchNotes(query: string, workspaceId: string): Promise<SearchResult[]> {
  // Mock results for demonstration
  const mockNotes = [
    {
      id: 'note-1',
      title: 'Release planning ideas',
      subtitle: 'Journal entry from yesterday',
      body: 'Thinking about release timeline and radio strategy. Need to plan the campaign.',
      date: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'note-2',
      title: 'Radio contact list',
      subtitle: 'BBC contacts',
      body: 'BBC Radio 1, 6 Music, local stations...',
      date: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: 'note-3',
      title: 'Social media content plan',
      subtitle: 'TikTok and Instagram ideas',
      body: 'Behind the scenes content, snippet previews, release countdown',
      date: new Date(Date.now() - 259200000).toISOString(),
    },
  ]

  // Score and filter
  const results: SearchResult[] = mockNotes
    .map((note) => {
      const score = calculateFinalScore(
        query,
        {
          title: note.title,
          subtitle: note.subtitle,
          body: note.body,
        },
        'note',
        note.date
      )

      return {
        id: note.id,
        type: 'note' as const,
        title: note.title,
        subtitle: note.subtitle,
        body: note.body,
        date: note.date,
        score,
      }
    })
    .filter((r) => r.score > 0.3) // Threshold
    .sort((a, b) => b.score - a.score)

  return results
}
