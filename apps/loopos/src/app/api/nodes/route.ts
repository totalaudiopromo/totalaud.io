import { NextRequest, NextResponse } from 'next/server'
import {
  getNodes,
  createNode,
  CreateNodeSchema,
} from '@total-audio/loopos-db'

/**
 * GET /api/nodes
 * Get all nodes for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Get user ID from auth session
    // For now, using a placeholder - replace with actual auth
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - User ID required' },
        { status: 401 }
      )
    }

    const nodes = await getNodes(userId)

    return NextResponse.json({ nodes }, { status: 200 })
  } catch (error) {
    console.error('Error fetching nodes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch nodes' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/nodes
 * Create a new node
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Get user ID from auth session
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - User ID required' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate request body
    const validatedData = CreateNodeSchema.parse(body)

    // Create node in database
    const node = await createNode(userId, validatedData)

    return NextResponse.json({ node }, { status: 201 })
  } catch (error) {
    console.error('Error creating node:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create node' },
      { status: 500 }
    )
  }
}
