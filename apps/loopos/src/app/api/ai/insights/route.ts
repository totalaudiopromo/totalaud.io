import { NextRequest, NextResponse } from 'next/server'
import { generateLoopInsights } from '@/insights/LoopInsightsEngine'
import type { Node, Note, Momentum } from '@total-audio/loopos-db'

/**
 * POST /api/ai/insights
 * Generate AI-powered loop insights
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - User ID required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { nodes, notes, momentum } = body as {
      nodes: Node[]
      notes: Note[]
      momentum: Momentum | null
    }

    if (!nodes || !Array.isArray(nodes)) {
      return NextResponse.json(
        { error: 'Invalid request - nodes array required' },
        { status: 400 }
      )
    }

    if (!notes || !Array.isArray(notes)) {
      return NextResponse.json(
        { error: 'Invalid request - notes array required' },
        { status: 400 }
      )
    }

    // Generate insights using AI
    const insights = await generateLoopInsights(nodes, notes, momentum)

    return NextResponse.json({ insights }, { status: 200 })
  } catch (error) {
    console.error('Error generating insights:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate insights',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
