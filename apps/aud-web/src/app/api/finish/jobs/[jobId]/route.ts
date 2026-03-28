/**
 * GET /api/finish/jobs/[jobId]
 *
 * Proxy to sadact-finisher /jobs/{jobId} endpoint.
 * Returns job status, metrics, and download URL when complete.
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import { getJobStatus } from '@/lib/finisher-client'
import { logger } from '@/lib/logger'

const log = logger.scope('FinishJob')

export const GET = withAuth(
  async (request: NextRequest, context?: { params: Promise<{ jobId: string }> }) => {
    try {
      const { jobId } = await context!.params
      const status = await getJobStatus(jobId)

      // Rewrite download URL to go through our proxy
      if (status.download_url) {
        status.download_url = `/api/finish/jobs/${jobId}/download`
      }

      return NextResponse.json({ success: true, data: status })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get job status'
      log.error('Job status failed', error)

      if (message.includes('not found') || message.includes('404')) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 })
      }

      return NextResponse.json({ error: message }, { status: 500 })
    }
  }
)
