/**
 * Asset Update API
 * Phase 15.2: Asset Management
 *
 * POST /api/assets/update
 * Request: { assetId, is_public?, title?, description?, tags? }
 * Response: { success: boolean, asset: Asset, duration: number }
 *
 * Purpose:
 * - Updates asset metadata (title, description, tags, is_public)
 * - Verifies user ownership before updating
 * - Returns updated asset with FlowCore-style response
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { createRouteSupabaseClient } from '@aud-web/lib/supabase/server'

const log = logger.scope('AssetUpdateAPI')

// Validation schema
const updateRequestSchema = z.object({
  assetId: z.string().uuid('Valid asset ID required'),
  is_public: z.boolean().optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).nullable().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
})

type UpdateRequest = z.infer<typeof updateRequestSchema>

interface UpdateResponse {
  success: boolean
  duration: number
  message?: string
  asset?: Record<string, unknown>
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Parse and validate request body
    const body = await request.json()
    const { assetId, is_public, title, description, tags } = updateRequestSchema.parse(body)

    // Ensure at least one field is being updated
    if (
      is_public === undefined &&
      title === undefined &&
      description === undefined &&
      tags === undefined
    ) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: 'At least one field must be provided for update',
        },
        { status: 400 }
      )
    }

    const supabase = await createRouteSupabaseClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      log.error('Failed to verify session', sessionError)
      return NextResponse.json({ error: 'Failed to verify authentication' }, { status: 500 })
    }

    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const userId = session.user.id

    // Verify asset exists and user owns it
    const { data: existingAsset, error: fetchError } = await supabase
      .from('artist_assets')
      .select('id, user_id')
      .eq('id', assetId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !existingAsset) {
      log.warn('Asset not found or access denied', { assetId, userId })
      return NextResponse.json(
        {
          error: 'Asset not found',
          details: 'Asset does not exist or you do not have permission to update it',
        },
        { status: 404 }
      )
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (is_public !== undefined) updateData.is_public = is_public
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (tags !== undefined) updateData.tags = tags

    // Perform update
    const { data: updatedAsset, error: updateError } = await supabase
      .from('artist_assets')
      .update(updateData)
      .eq('id', assetId)
      .eq('user_id', userId)
      .select('*')
      .single()

    if (updateError) {
      log.error('Failed to update asset', updateError, { assetId })
      return NextResponse.json(
        {
          error: 'Failed to update asset',
          details: updateError.message,
        },
        { status: 500 }
      )
    }

    const duration = Date.now() - startTime

    log.debug('Asset updated', { assetId, fields: Object.keys(updateData), duration })

    const response: UpdateResponse = {
      success: true,
      duration,
      message: 'Asset updated successfully',
      asset: updatedAsset,
    }

    return NextResponse.json(response)
  } catch (error) {
    const duration = Date.now() - startTime
    log.error('Asset update API error', error, { duration })

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors.map((e) => e.message).join(', '),
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
