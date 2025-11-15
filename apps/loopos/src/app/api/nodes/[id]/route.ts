import { NextRequest, NextResponse } from 'next/server'
import {
  getNode,
  updateNode,
  deleteNode,
  UpdateNodeSchema,
} from '@total-audio/loopos-db'

type RouteParams = {
  params: {
    id: string
  }
}

/**
 * GET /api/nodes/[id]
 * Get a specific node
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - User ID required' },
        { status: 401 }
      )
    }

    const node = await getNode(params.id, userId)

    if (!node) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 })
    }

    return NextResponse.json({ node }, { status: 200 })
  } catch (error) {
    console.error('Error fetching node:', error)
    return NextResponse.json(
      { error: 'Failed to fetch node' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/nodes/[id]
 * Update a specific node
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - User ID required' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate request body
    const validatedData = UpdateNodeSchema.parse(body)

    // Update node in database
    const node = await updateNode(params.id, userId, validatedData)

    return NextResponse.json({ node }, { status: 200 })
  } catch (error) {
    console.error('Error updating node:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update node' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/nodes/[id]
 * Delete a specific node
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - User ID required' },
        { status: 401 }
      )
    }

    await deleteNode(params.id, userId)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting node:', error)
    return NextResponse.json(
      { error: 'Failed to delete node' },
      { status: 500 }
    )
  }
}
