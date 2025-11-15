import { NextRequest, NextResponse } from 'next/server'
import { AutoLooper } from '@/agents/AutoLooper'
import { getNodes } from '@total-audio/loopos-db'

export async function POST(req: NextRequest) {
  try {
    // In production, get user ID from auth session
    const userId = 'temp-user-id' // TODO: Replace with real auth

    // Get user's nodes
    const nodes = await getNodes(userId)

    // Run auto-loop analysis
    const autoLooper = new AutoLooper()
    const analysis = await autoLooper.analyseLoops(
      nodes.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        description: n.description,
        friction: n.friction,
        priority: n.priority,
        dependencies: n.dependencies,
        position: { x: n.position_x, y: n.position_y },
        timeStart: n.time_start,
        duration: n.duration,
        createdAt: new Date(n.created_at),
        updatedAt: new Date(n.updated_at),
      })),
      userId
    )

    return NextResponse.json({ success: true, analysis })
  } catch (error) {
    console.error('Auto-loop analysis failed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to run auto-loop analysis' },
      { status: 500 }
    )
  }
}
