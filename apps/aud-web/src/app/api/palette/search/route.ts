/**
 * Phase 33: Global Command Palette - Unified Search API
 *
 * Aggregates search results from all surfaces:
 * - Notes
 * - Analogue Cards
 * - Timeline Nodes
 * - Coach Messages
 * - Designer Scenes
 * - Memory Graph Nodes
 * - Rhythm Summaries
 * - Workspaces
 * - Available Commands
 *
 * Scoring: recency, fuzzy match, semantic proximity, British spelling
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// =====================================================
// SCHEMAS
// =====================================================

const SearchRequestSchema = z.object({
  query: z.string().min(1),
  workspaceId: z.string().uuid().optional(),
  limit: z.number().min(1).max(50).optional().default(20),
})

const SearchResultSchema = z.object({
  id: z.string(),
  type: z.enum(['note', 'card', 'node', 'message', 'scene', 'theme', 'rhythm', 'workspace', 'action']),
  title: z.string(),
  subtitle: z.string().optional(),
  content: z.string().optional(),
  group: z.string(),
  score: z.number(),
  created_at: z.string().optional(),
})

// =====================================================
// POST /api/palette/search
// =====================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const request = SearchRequestSchema.parse(body)

    // TODO: In production, query all surfaces from database
    // For now, return mock results to demonstrate grouping

    const mockResults = [
      // Notes
      {
        id: 'note-1',
        type: 'note' as const,
        title: 'Release planning ideas',
        subtitle: 'Journal entry',
        content: 'Thinking about release timeline and radio strategy...',
        group: 'Notes',
        score: 0.9,
        created_at: new Date().toISOString(),
      },
      {
        id: 'note-2',
        type: 'note' as const,
        title: 'Radio contact list',
        subtitle: 'Journal entry',
        content: 'BBC Radio 1, 6 Music, local stations...',
        group: 'Notes',
        score: 0.85,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },

      // Timeline
      {
        id: 'node-1',
        type: 'node' as const,
        title: 'Single release date',
        subtitle: 'Milestone',
        group: 'Timeline',
        score: 0.95,
        created_at: new Date().toISOString(),
      },
      {
        id: 'node-2',
        type: 'node' as const,
        title: 'Radio promo campaign',
        subtitle: 'Task',
        group: 'Timeline',
        score: 0.88,
        created_at: new Date(Date.now() - 172800000).toISOString(),
      },

      // Coach
      {
        id: 'message-1',
        type: 'message' as const,
        title: 'Release strategy discussion',
        subtitle: 'Coach conversation',
        content: 'You could try focusing on local radio first...',
        group: 'Coach',
        score: 0.82,
        created_at: new Date(Date.now() - 259200000).toISOString(),
      },

      // Themes
      {
        id: 'theme-1',
        type: 'theme' as const,
        title: 'Radio Promotion',
        subtitle: 'Memory graph theme',
        group: 'Themes',
        score: 0.78,
      },
      {
        id: 'theme-2',
        type: 'theme' as const,
        title: 'Release Planning',
        subtitle: 'Memory graph theme',
        group: 'Themes',
        score: 0.75,
      },

      // Rhythm
      {
        id: 'rhythm-1',
        type: 'rhythm' as const,
        title: 'Your most active time is morning',
        subtitle: 'Energy window insight',
        group: 'Rhythm',
        score: 0.7,
      },
    ]

    // Filter by query (simple contains for demo)
    const filtered = mockResults
      .filter((result) => {
        const searchText = `${result.title} ${result.subtitle || ''} ${result.content || ''}`.toLowerCase()
        return searchText.includes(request.query.toLowerCase())
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, request.limit)

    return NextResponse.json({
      success: true,
      results: filtered,
      total: filtered.length,
    })
  } catch (error) {
    console.error('[Palette Search] Failed to search:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
