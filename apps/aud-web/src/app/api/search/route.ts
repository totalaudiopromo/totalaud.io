import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { validateRequestBody } from '@/lib/api-validation'
import { logger } from '@/lib/logger'
import { search } from '@/lib/search'
import type { SearchOptions } from '@/lib/search'

const log = logger.scope('SearchAPI')

/**
 * Phase 34: Global Search Engine - Unified API
 *
 * Powers:
 * - ⌘K Palette (Phase 33)
 * - /search page (future)
 * - AI agents (cross-surface context)
 * - TAP integration (preview mode)
 */

const searchSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  workspaceId: z.string().uuid('Invalid workspace ID'),
  maxPerGroup: z.number().int().positive().optional().default(5),
  includeActions: z.boolean().optional().default(false),
  includeTAP: z.boolean().optional().default(false),
})

export async function POST(req: NextRequest) {
  try {
    // Validate request body
    const body = await validateRequestBody(req, searchSchema)

    log.debug('Search request received', {
      query: body.query,
      workspaceId: body.workspaceId,
      maxPerGroup: body.maxPerGroup,
      includeActions: body.includeActions,
      includeTAP: body.includeTAP,
    })

    // Execute search
    const startTime = Date.now()
    const searchOptions: SearchOptions = {
      query: body.query,
      workspaceId: body.workspaceId,
      maxPerGroup: body.maxPerGroup,
      includeActions: body.includeActions,
      includeTAP: body.includeTAP,
    }

    const results = await search(searchOptions)
    const duration = Date.now() - startTime

    log.info('Search completed', {
      query: body.query,
      totalResults: results.totalResults,
      duration: `${duration}ms`,
    })

    return NextResponse.json(results)
  } catch (error) {
    log.error('Search failed', error)

    // Check if validation error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    // Generic error
    return NextResponse.json(
      {
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
