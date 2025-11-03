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

    // In real implementation, query Supabase asset_uploads table
    // For demo, return mock asset
    const asset = await fetchAsset(assetId)

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
        asset,
      },
      { status: 200 }
    )
  } catch (error) {
    log.error('Asset fetch failed', error)

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

/**
 * Fetch asset from database
 * In real implementation, query Supabase
 */
async function fetchAsset(assetId: string): Promise<AssetAttachment | null> {
  log.debug('Fetching asset', { assetId })

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  // Mock asset data based on ID
  if (assetId === 'asset-demo-audio-1') {
    return {
      id: assetId,
      title: 'Night Drive - Final Master.mp3',
      url: '/demo-audio.mp3',
      kind: 'audio',
      is_public: true,
      size_bytes: 8450000,
      mime_type: 'audio/mpeg',
      created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    }
  }

  if (assetId === 'asset-demo-doc-1') {
    return {
      id: assetId,
      title: 'Artist Press Kit 2025.pdf',
      url: '/demo-press-kit.pdf',
      kind: 'document',
      is_public: true,
      size_bytes: 2450000,
      mime_type: 'application/pdf',
      created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    }
  }

  if (assetId === 'asset-demo-image-1') {
    return {
      id: assetId,
      title: 'Press Photos 2025.zip',
      url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
      kind: 'archive',
      is_public: true,
      size_bytes: 15600000,
      mime_type: 'application/zip',
      created_at: new Date(Date.now() - 3600000 * 96).toISOString(),
    }
  }

  // Asset not found
  return null
}
