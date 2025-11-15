import { NextRequest, NextResponse } from 'next/server'
import {
  getNote,
  updateNote,
  deleteNote,
  UpdateNoteSchema,
} from '@total-audio/loopos-db'

type RouteParams = {
  params: {
    id: string
  }
}

/**
 * GET /api/notes/[id]
 * Get a specific note
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

    const note = await getNote(params.id, userId)

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    return NextResponse.json({ note }, { status: 200 })
  } catch (error) {
    console.error('Error fetching note:', error)
    return NextResponse.json(
      { error: 'Failed to fetch note' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/notes/[id]
 * Update a specific note
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
    const validatedData = UpdateNoteSchema.parse(body)

    // Update note in database
    const note = await updateNote(params.id, userId, validatedData)

    return NextResponse.json({ note }, { status: 200 })
  } catch (error) {
    console.error('Error updating note:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/notes/[id]
 * Delete a specific note
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

    await deleteNote(params.id, userId)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    )
  }
}
