/**
 * Get Asset API Route
 * Phase 15.2-D: Full Agent UI Integration
 *
 * Purpose:
 * - Fetch single asset by ID for AssetViewModal
 *
 * GET /api/assets/get?id={assetId}
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import type { AssetAttachment } from '@/types/asset-attachment'
import { createRouteSupabaseClient } from '@aud-web/lib/supabase/server'

const log = logger.scope('GetAssetAPI')

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const assetId = searchParams.get('id')

    if (!assetId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Asset ID is required',
        },
        { status: 400 }
      )
    }

    log.info('Asset fetch requested', { assetId })

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

    const { data: asset, error } = await supabase
      .from('artist_assets')
      .select('*')
      .eq('id', assetId)
      .maybeSingle()

    if (error) {
      log.error('Failed to fetch asset', { error, assetId })
      return NextResponse.json(
        { error: 'Asset fetch failed', details: error.message },
        { status: 500 }
      )
    }

    if (!asset) {
      return NextResponse.json(
        {
          success: false,
          error: 'Asset not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        asset: mapAsset(asset),
      },
      { status: 200 }
    )
  } catch (error) {
    log.error('Asset fetch failed', { error })

    return NextResponse.json(
      {
        success: false,
        error: 'Asset fetch failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

function mapAsset(asset: any): AssetAttachment {
  return {
    id: asset.id,
    title: asset.title ?? asset.path ?? 'untitled asset',
    url: asset.url,
    kind: asset.kind,
    is_public: asset.is_public,
    byte_size: asset.byte_size ?? undefined,
    mime_type: asset.mime_type ?? undefined,
    created_at: asset.created_at,
  }
}
