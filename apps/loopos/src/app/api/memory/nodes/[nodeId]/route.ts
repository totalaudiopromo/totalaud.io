/**
 * Single Memory Node API
 * Get node details and graph connections
 */

import { NextRequest, NextResponse } from 'next/server'
import { memoryDb } from '@total-audio/loopos-db'

// =====================================================
// GET /api/memory/nodes/[nodeId]
// =====================================================

export async function GET(
  req: NextRequest,
  { params }: { params: { nodeId: string } }
) {
  try {
    const { nodeId } = params

    // Get node details
    const node = await memoryDb.nodes.get(nodeId)

    if (!node) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 })
    }

    // Get graph (connected nodes)
    const graph = await memoryDb.edges.getNodeGraph(nodeId)

    // Get sources
    const sources = await memoryDb.sources.listForNode(nodeId)

    return NextResponse.json({
      success: true,
      node,
      graph,
      sources,
    })
  } catch (error) {
    console.error('Failed to get memory node:', error)
    return NextResponse.json({ error: 'Failed to get node' }, { status: 500 })
  }
}
