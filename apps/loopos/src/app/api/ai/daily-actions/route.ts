import { NextRequest, NextResponse } from 'next/server'
import { generateDailyActions } from '@/lib/generateDailyActions'
import type { Node, Momentum } from '@total-audio/loopos-db'

/**
 * POST /api/ai/daily-actions
 * Generate AI-powered daily actions based on loop state
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
    const { nodes, momentum } = body as {
      nodes: Node[]
      momentum: Momentum | null
    }

    if (!nodes || !Array.isArray(nodes)) {
      return NextResponse.json(
        { error: 'Invalid request - nodes array required' },
        { status: 400 }
      )
    }

    // Generate daily actions using AI
    const actions = await generateDailyActions(nodes, momentum)

    return NextResponse.json({ actions }, { status: 200 })
  } catch (error) {
    console.error('Error generating daily actions:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate daily actions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
