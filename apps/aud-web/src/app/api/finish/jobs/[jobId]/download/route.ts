/**
 * GET /api/finish/jobs/[jobId]/download
 *
 * Proxy to finisher /jobs/{jobId}/download endpoint.
 * Streams the processed audio file back to the client.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteSupabaseClient } from '@/lib/supabase/server'
import { downloadJob } from '@/lib/finisher-client'
import { logger } from '@/lib/logger'

const log = logger.scope('FinishDownload')

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    // Auth check
    const supabase = await createRouteSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { jobId } = await params
    const response = await downloadJob(jobId)

    // Stream the audio file through
    const contentType = response.headers.get('content-type') || 'audio/wav'
    const contentDisposition =
      response.headers.get('content-disposition') || `attachment; filename="mastered_${jobId}.wav"`

    return new NextResponse(response.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Download failed'
    log.error('Job download failed', error)

    if (message.includes('not found') || message.includes('404')) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (message.includes('410') || message.includes('expired')) {
      return NextResponse.json({ error: 'Output file expired' }, { status: 410 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
