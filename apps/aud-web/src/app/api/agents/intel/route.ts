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
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import type { AssetAttachment } from '@/types/asset-attachment'
import { cookies } from 'next/headers'

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

    // Check authentication for write operations (saving results)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    let isAuthenticated = false
    let authenticatedUserId: string | null = null

    if (supabaseUrl && supabaseAnonKey) {
      const cookieStore = await cookies()
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          storageKey: 'supabase-auth-token',
        },
      })

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        isAuthenticated = true
        authenticatedUserId = session.user.id
      }
    }

    let relevantAssets: AssetAttachment[] = []

    // Fetch relevant document assets if requested
    if (includeAssetContext && userId && isAuthenticated) {
      relevantAssets = await fetchRelevantDocumentAssets(userId, supabaseUrl!, supabaseAnonKey!)

      log.info('Relevant assets found', {
        count: relevantAssets.length,
        types: relevantAssets.map((a) => a.kind),
      })
    }

    // Generate enriched research with asset context
    const research = await generateIntelResearch(query, relevantAssets)

    // Save results to database if authenticated
    if (isAuthenticated && authenticatedUserId && sessionId) {
      try {
        const cookieStore = await cookies()
        const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
          auth: {
            storageKey: 'supabase-auth-token',
          },
        })

        await supabase.from('agent_results').insert({
          user_id: authenticatedUserId,
          session_id: sessionId,
          agent_type: 'intel',
          result_data: {
            query,
            research,
            assetsUsed: relevantAssets.length,
            assetIds: relevantAssets.map((a) => a.id),
          },
          created_at: new Date().toISOString(),
        })

        log.info('Intel results saved to database', { sessionId, userId: authenticatedUserId })
      } catch (dbError) {
        log.warn('Failed to save intel results to database', dbError)
        // Don't fail the request if DB write fails
      }
    }

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
        demo: !isAuthenticated,
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
async function fetchRelevantDocumentAssets(
  userId: string,
  supabaseUrl: string,
  supabaseAnonKey: string
): Promise<AssetAttachment[]> {
  try {
    log.debug('Fetching document assets for user', { userId })

    const cookieStore = await cookies()
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storageKey: 'supabase-auth-token',
      },
    })

    // Query artist_assets table for document types
    const { data: assets, error } = await supabase
      .from('artist_assets')
      .select('*')
      .eq('user_id', userId)
      .eq('kind', 'document')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      log.warn('Failed to fetch document assets from database', error)
      return []
    }

    if (!assets || assets.length === 0) {
      return []
    }

    // Map database records to AssetAttachment type
    const mappedAssets: AssetAttachment[] = assets.map((asset) => ({
      id: asset.id,
      kind: asset.kind as 'document',
      title: asset.title || 'Untitled Document',
      url: asset.url,
      size_bytes: asset.size_bytes || undefined,
      created_at: asset.created_at,
    }))

    return mappedAssets
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
