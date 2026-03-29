/**
 * POST /api/finish/process
 *
 * Proxy to finisher /process endpoint.
 * Accepts multipart form data with audio file + mastering settings.
 * Returns job_id for async polling.
 */

import { NextResponse } from 'next/server'
import { withAuth, type AuthenticatedRequest } from '@/lib/api/middleware'
import { processAudio } from '@/lib/finisher-client'
import { logger } from '@/lib/logger'

const log = logger.scope('FinishProcess')

const MAX_FILE_SIZE = 50 * 1024 * 1024

export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const loudness = formData.get('loudness') as string | null
    const tone = formData.get('tone') as string | null
    const energy = formData.get('energy') as string | null
    const platform = formData.get('platform') as string | null
    const genre = formData.get('genre') as string | null

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

    const result = await processAudio(file, {
      loudness: loudness || undefined,
      tone: tone || undefined,
      energy: energy || undefined,
      platform: platform || undefined,
      genre: genre || undefined,
    })

    return NextResponse.json({ success: true, data: result }, { status: 202 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Processing failed'
    log.error('Finish process failed', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
})
