/**
 * Memory Nodes API
 * List and query semantic memory nodes
 */

import { NextRequest, NextResponse } from 'next/server'
import { memoryDb, MemoryNodeKindSchema } from '@total-audio/loopos-db'

// =====================================================
// GET /api/memory/nodes?workspaceId=xxx&kind=theme&limit=50
// =====================================================

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const workspaceId = searchParams.get('workspaceId')
    const kind = searchParams.get('kind')
    const limit = parseInt(searchParams.get('limit') || '100', 10)

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })
    }

    let nodes

    if (kind) {
      // Validate kind
      const parsedKind = MemoryNodeKindSchema.parse(kind)
      nodes = await memoryDb.nodes.listByKind(workspaceId, parsedKind, limit)
    } else {
      nodes = await memoryDb.nodes.list(workspaceId, limit)
    }

    return NextResponse.json({
      success: true,
      nodes,
      count: nodes.length,
    })
  } catch (error) {
    console.error('Failed to list memory nodes:', error)
    return NextResponse.json({ error: 'Failed to list nodes' }, { status: 500 })
  }
}
