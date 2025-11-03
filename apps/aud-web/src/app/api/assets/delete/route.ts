/**
 * Asset Delete API
 * Phase 15.2-A: Core Infrastructure
 *
 * POST /api/assets/delete
 * Request: { assetId }
 * Response: { success: boolean, duration: number }
 *
 * Purpose:
 * - Soft deletes asset record (sets deleted_at)
 * - Removes file from Supabase Storage
 * - Returns success/error with FlowCore-style messages
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@aud-web/lib/supabaseClient'
import { logger } from '@/lib/logger'
import { z } from 'zod'

export const runtime = 'edge'

const log = logger.scope('AssetDeleteAPI')

// Validation schema
const deleteRequestSchema = z.object({
  assetId: z.string().uuid('Valid asset ID required'),
})

type DeleteRequest = z.infer<typeof deleteRequestSchema>

interface DeleteResponse {
  success: boolean
  duration: number
  message?: string
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Parse and validate request body
    const body = await request.json()
    const { assetId } = deleteRequestSchema.parse(body)

    // Get Supabase client
    const supabase = getSupabaseClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Authentication required' },
        { status: 401 }
      )
    }

    // Fetch asset to get path and verify ownership
    const { data: asset, error: fetchError } = await supabase
      .from('artist_assets')
      .select('*')
      .eq('id', assetId)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (fetchError || !asset) {
      log.warn('Asset not found or already deleted', { assetId, userId: user.id })
      return NextResponse.json(
        {
          error: 'Asset not found',
          details: 'Asset does not exist or has already been deleted',
        },
        { status: 404 }
      )
    }

    // Soft delete: set deleted_at timestamp
    const { error: updateError } = await supabase
      .from('artist_assets')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', assetId)
      .eq('user_id', user.id)

    if (updateError) {
      log.error('Failed to soft delete asset', updateError, { assetId })
      return NextResponse.json(
        {
          error: 'Failed to delete asset',
          details: updateError.message,
        },
        { status: 500 }
      )
    }

    // Delete from storage if path exists
    if (asset.path) {
      const { error: storageError } = await supabase.storage.from('assets').remove([asset.path])

      if (storageError) {
        // Log error but don't fail the request (soft delete already succeeded)
        log.warn('Failed to delete storage object', storageError, {
          assetId,
          path: asset.path,
        })
      } else {
        log.debug('Storage object deleted', { path: asset.path })
      }
    }

    const duration = Date.now() - startTime

    log.debug('Asset deleted', { assetId, path: asset.path, duration })

    const response: DeleteResponse = {
      success: true,
      duration,
      message: 'Asset deleted successfully',
    }

    return NextResponse.json(response)
  } catch (error) {
    const duration = Date.now() - startTime
    log.error('Asset delete API error', error, { duration })

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
