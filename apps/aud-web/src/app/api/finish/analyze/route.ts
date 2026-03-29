/**
 * POST /api/finish/analyze
 *
 * Proxy to finisher /analyze endpoint.
 * Accepts multipart form data with audio file + optional platform.
 * Returns analysis metrics + suggestions.
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAuth, type AuthenticatedRequest } from '@/lib/api/middleware'
import { analyzeAudio } from '@/lib/finisher-client'
import { logger } from '@/lib/logger'

const log = logger.scope('FinishAnalyze')

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB
const ALLOWED_TYPES = new Set([
  'audio/wav',
  'audio/x-wav',
  'audio/aiff',
  'audio/x-aiff',
  'audio/flac',
  'audio/x-flac',
  'audio/mpeg',
])

export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const platform = formData.get('platform') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 422 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)} MB. Max: 50 MB` },
        { status: 413 }
      )
    }

    if (file.size === 0) {
      return NextResponse.json({ error: 'Empty file' }, { status: 422 })
    }

    // Type check (browser may report different MIME types)
    if (file.type && !ALLOWED_TYPES.has(file.type)) {
      // Fall back to extension check
      const ext = file.name?.split('.').pop()?.toLowerCase()
      if (!ext || !['wav', 'aiff', 'aif', 'flac', 'mp3'].includes(ext)) {
        return NextResponse.json(
          { error: `Unsupported format. Allowed: WAV, AIFF, FLAC, MP3` },
          { status: 422 }
        )
      }
    }

    const result = await analyzeAudio(file, platform || undefined)

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Analysis failed'
    log.error('Finish analyze failed', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
})
