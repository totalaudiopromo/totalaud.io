import { NextRequest, NextResponse } from 'next/server'
import {
  getMomentum,
  updateMomentum,
  UpdateMomentumSchema,
} from '@total-audio/loopos-db'

/**
 * GET /api/momentum
 * Get momentum for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - User ID required' },
        { status: 401 }
      )
    }

    const momentum = await getMomentum(userId)

    return NextResponse.json({ momentum }, { status: 200 })
  } catch (error) {
    console.error('Error fetching momentum:', error)
    return NextResponse.json(
      { error: 'Failed to fetch momentum' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/momentum
 * Update momentum for the authenticated user
 */
export async function PATCH(request: NextRequest) {
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
    const validatedData = UpdateMomentumSchema.parse(body)

    // Update momentum in database
    const momentum = await updateMomentum(userId, validatedData)

    return NextResponse.json({ momentum }, { status: 200 })
  } catch (error) {
    console.error('Error updating momentum:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update momentum' },
      { status: 500 }
    )
  }
}
