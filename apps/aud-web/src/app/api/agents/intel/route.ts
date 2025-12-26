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
import { createRouteSupabaseClient } from '@aud-web/lib/supabase/server'

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

    if (userId && userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const resolvedUserId = session.user.id
    let relevantAssets: AssetAttachment[] = []

    // Fetch relevant document assets if requested
    if (includeAssetContext) {
      try {
        log.debug('Fetching document assets for user', { userId: resolvedUserId })

        // Type assertion needed due to @supabase/auth-helpers-nextjs 0.10.0
        // not fully supporting the new Database type format with __InternalSupabase.
        // TODO: Migrate to @supabase/ssr to resolve this properly.

        const { data: assets, error } = await (supabase as any)
          .from('artist_assets')
          .select('*')
          .eq('user_id', resolvedUserId)
          .eq('kind', 'document')
          .order('created_at', { ascending: false })
          .limit(10)

        if (error) {
          log.warn('Failed to fetch document assets from database', { error })
        } else if (assets && assets.length > 0) {
          // Define type for the raw database asset record
          type RawAsset = {
            id: string
            kind: string
            title: string | null
            url: string | null
            is_public: boolean | null
            byte_size: number | null
            mime_type: string | null
            created_at: string | null
          }
          // Map database records to AssetAttachment type
          relevantAssets = (assets as RawAsset[])
            .filter((asset: RawAsset) => typeof asset.url === 'string' && asset.url.length > 0)
            .map((asset: RawAsset) => ({
              id: String(asset.id),
              kind: (asset.kind as AssetAttachment['kind']) ?? 'document',
              title: asset.title ?? 'Untitled Document',
              url: String(asset.url),
              is_public: Boolean(asset.is_public),
              byte_size: asset.byte_size ?? undefined,
              mime_type: asset.mime_type ?? undefined,
              created_at: asset.created_at ?? undefined,
            }))
        }
      } catch (fetchError) {
        log.warn('Failed to fetch document assets', { error: fetchError })
      }

      log.info('Relevant assets found', {
        count: relevantAssets.length,
        types: relevantAssets.map((a) => a.kind),
      })
    }

    // Generate enriched research with asset context
    const research = await generateIntelResearch(query, relevantAssets)

    // Save results to database if authenticated
    if (session && sessionId) {
      try {
        await (supabase as any).from('agent_results').insert({
          user_id: resolvedUserId,
          session_id: sessionId,
          agent_type: 'intel',
          result_data: {
            query,
            research,
            assetsUsed: relevantAssets.length,
            assetIds: relevantAssets.map((a) => a.id),
          },
        })

        log.info('Intel results saved to database', { sessionId, userId: resolvedUserId })
      } catch (dbError) {
        log.warn('Failed to save intel results to database', { error: dbError })
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
