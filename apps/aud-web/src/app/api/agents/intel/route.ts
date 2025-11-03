/**
 * Intel Agent API Route
 * Phase 15.2-C: Agent Integration Layer
 *
 * Purpose:
 * - Enrich artist/contact research with document assets
 * - Auto-use press releases and bios as additional context
 * - Log telemetry events for asset_used_for_intel
 *
 * POST /api/agents/intel
 * Body: {
 *   query: string
 *   includeAssetContext?: boolean
 *   userId?: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import type { AssetAttachment } from '@/types/asset-attachment'

const log = logger.scope('IntelAgentAPI')

const intelRequestSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  includeAssetContext: z.boolean().optional().default(true),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json()
    const { query, includeAssetContext, userId, sessionId } = intelRequestSchema.parse(body)

    log.info('Intel request received', {
      query,
      includeAssetContext,
      userId,
      sessionId,
    })

    let relevantAssets: AssetAttachment[] = []

    // Fetch relevant document assets if requested
    if (includeAssetContext && userId) {
      relevantAssets = await fetchRelevantDocumentAssets(userId)

      log.info('Relevant assets found', {
        count: relevantAssets.length,
        types: relevantAssets.map((a) => a.kind),
      })
    }

    // Generate enriched research with asset context
    const research = await generateIntelResearch(query, relevantAssets)

    // Log telemetry event for asset usage
    if (relevantAssets.length > 0) {
      log.info('Telemetry event: asset_used_for_intel', {
        sessionId,
        assetCount: relevantAssets.length,
        assetIds: relevantAssets.map((a) => a.id),
      })
    }

    return NextResponse.json(
      {
        success: true,
        research,
        assetsUsed: relevantAssets.length,
        assets: relevantAssets,
        metadata: {
          query,
          contextEnhanced: relevantAssets.length > 0,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    log.error('Intel generation failed', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Intel generation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Fetch relevant document assets for intel enrichment
 * Looks for: press releases, bios, one-sheets
 */
async function fetchRelevantDocumentAssets(userId: string): Promise<AssetAttachment[]> {
  try {
    // In real implementation, this would query Supabase asset_uploads table
    // For demo, we'll return mock data
    log.debug('Fetching document assets for user', { userId })

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 200))

    // Mock relevant documents (would be from database in real implementation)
    const mockAssets: AssetAttachment[] = []

    return mockAssets
  } catch (error) {
    log.warn('Failed to fetch document assets', error)
    return []
  }
}

/**
 * Generate intel research with asset context
 * Placeholder - would call Claude/GPT in real implementation
 */
async function generateIntelResearch(query: string, assets: AssetAttachment[]): Promise<string> {
  log.debug('Generating intel research', {
    query,
    assetCount: assets.length,
  })

  // Simulate LLM processing delay
  await new Promise((resolve) => setTimeout(resolve, 600))

  // Build research with asset awareness
  const assetContext =
    assets.length > 0
      ? `\n\nContext from your press materials (${assets.length} document${assets.length === 1 ? '' : 's'}):\n${assets
          .map((a) => `- ${a.title}`)
          .join('\n')}\n`
      : ''

  const research = `
# Intel Research: ${query}

${assetContext}
## Summary
Based on available information${assets.length > 0 ? ' and your press materials' : ''}, here's what I found:

**Artist Profile:**
- Name: ${query}
- Genre: Electronic/Indie (example)
- Location: UK (example)

**Career Highlights:**
- Previous releases on independent labels
- Radio support from local stations
${assets.length > 0 ? '- Additional context from your press kit documents\n' : ''}
**Contact Recommendations:**
- Target: BBC Radio 1 Introducing
- Approach: Personalised pitch with music attached
- Timing: Best to submit Tuesday-Thursday mornings

${assets.length > 0 ? `**Note:** Enhanced research using ${assets.length} document${assets.length === 1 ? '' : 's'} from your press kit.\n` : ''}
---
Intel generated with ${assets.length} supporting document${assets.length === 1 ? '' : 's'}
`.trim()

  return research
}
