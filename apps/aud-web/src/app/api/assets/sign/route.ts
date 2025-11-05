/**
 * Asset Sign URL API
 * Phase 15.2-A: Core Infrastructure
 *
 * POST /api/assets/sign
 * Request: { filename, mimeType, byteSize, kind?, campaignId?, title?, tags? }
 * Response: { path, signedUrl, assetId }
 *
 * Purpose:
 * - Generates signed upload URL for Supabase Storage
 * - Creates metadata stub in artist_assets table
 * - Returns canonical path for client upload
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@aud-web/lib/supabaseClient'
import { logger } from '@/lib/logger'
import { z } from 'zod'

export const runtime = 'edge'

const log = logger.scope('AssetSignAPI')

// Validation schema
const signRequestSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
  byteSize: z.number().int().positive('File size must be positive'),
  kind: z
    .enum(['audio', 'image', 'document', 'archive', 'link', 'other'])
    .optional()
    .default('other'),
  campaignId: z.string().uuid().optional(),
  title: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
})

type SignRequest = z.infer<typeof signRequestSchema>

interface SignResponse {
  success: boolean
  path: string
  signedUrl?: string
  assetId: string
  duration: number
}

/**
 * Detect asset kind from MIME type
 */
function detectKind(mimeType: string): string {
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'document' // Treat as document for now
  if (mimeType === 'application/pdf') return 'document'
  if (
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
    return 'document'
  if (mimeType === 'text/plain') return 'document'
  if (mimeType === 'application/zip' || mimeType === 'application/x-zip-compressed')
    return 'archive'
  return 'other'
}

/**
 * Generate canonical storage path
 * Format: assets/{user_id}/{yyyy}/{mm}/{dd}/{uuid}-{slug}.{ext}
 */
function generatePath(userId: string, filename: string): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  // Generate UUID and slug
  const uuid = crypto.randomUUID()
  const ext = filename.split('.').pop() || ''
  const slug = filename
    .replace(/\.[^/.]+$/, '') // Remove extension
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Slug-ify
    .substring(0, 50) // Max 50 chars

  return `${userId}/${year}/${month}/${day}/${uuid}-${slug}.${ext}`
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Parse and validate request body
    const body = await request.json()
    const validated = signRequestSchema.parse(body)
    const { filename, mimeType, byteSize, kind, campaignId, title, tags } = validated

    // Get Supabase client
    const supabase = createClient()

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

    // Detect kind if not provided
    const assetKind = kind || detectKind(mimeType)

    // Generate storage path
    const path = generatePath(user.id, filename)
    const fullPath = `${path}` // Relative to bucket root

    // Create metadata stub in artist_assets
    const { data: asset, error: insertError } = await supabase
      .from('artist_assets')
      .insert({
        user_id: user.id,
        campaign_id: campaignId || null,
        kind: assetKind,
        title: title || filename,
        path: fullPath,
        mime_type: mimeType,
        byte_size: byteSize,
        tags,
      })
      .select('id')
      .single()

    if (insertError || !asset) {
      log.error('Failed to create asset metadata', insertError)
      return NextResponse.json(
        {
          error: 'Failed to create asset metadata',
          details: insertError?.message || 'Unknown error',
        },
        { status: 500 }
      )
    }

    // Generate signed URL for upload (60 second expiry)
    const { data: signedData, error: signError } = await supabase.storage
      .from('assets')
      .createSignedUploadUrl(fullPath)

    if (signError || !signedData) {
      log.error('Failed to generate signed URL', signError)

      // Clean up metadata stub
      await supabase.from('artist_assets').delete().eq('id', asset.id)

      return NextResponse.json(
        {
          error: 'Failed to generate signed URL',
          details: signError?.message || 'Unknown error',
        },
        { status: 500 }
      )
    }

    const duration = Date.now() - startTime

    log.debug('Signed URL generated', {
      assetId: asset.id,
      path: fullPath,
      kind: assetKind,
      size: byteSize,
      duration,
    })

    const response: SignResponse = {
      success: true,
      path: fullPath,
      signedUrl: signedData.signedUrl,
      assetId: asset.id,
      duration,
    }

    return NextResponse.json(response)
  } catch (error) {
    const duration = Date.now() - startTime
    log.error('Asset sign API error', error, { duration })

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
