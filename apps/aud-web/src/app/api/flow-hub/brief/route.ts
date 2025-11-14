/**
 * Flow Hub AI Brief API
 * Phase 15.9: Unified Campaign Analytics + AI Briefs
 *
 * POST /api/flow-hub/brief
 * Generates AI-powered insights using Claude 3.5 Sonnet
 *
 * Request body:
 * {
 *   period: 7 | 30 | 90,
 *   force_refresh?: boolean  // Optional: bypass cache
 * }
 *
 * Response:
 * {
 *   title: string
 *   summary: string
 *   highlights: string[]
 *   risks: string[]
 *   recommendations: string[]
 *   generated_at: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createRouteSupabaseClient } from '@aud-web/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const log = logger.scope('FlowHubBriefAPI')

// AI Brief cache duration (4 hours)
const BRIEF_CACHE_DURATION_MS = 4 * 60 * 60 * 1000

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { period = 7, force_refresh = false } = body

    // Validate period
    if (![7, 30, 90].includes(period)) {
      log.warn('Invalid period parameter', { period })
      return NextResponse.json({ error: 'period must be 7, 30, or 90' }, { status: 400 })
    }

    const supabase = createRouteSupabaseClient()

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      log.error('Failed to verify session', sessionError)
      return NextResponse.json({ error: 'Failed to verify authentication' }, { status: 500 })
    }

    if (!session) {
      log.warn('Unauthenticated request to flow hub brief')
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const userId = session.user.id

    log.debug('Generating AI brief', { userId, period, force_refresh })

    // Fetch summary data
    const { data: summaryRow, error: summaryError } = await supabase
      .from('flow_hub_summary_cache')
      .select('metrics, generated_at, expires_at')
      .eq('user_id', userId)
      .maybeSingle()

    if (summaryError || !summaryRow) {
      log.error('Failed to fetch summary for AI brief', summaryError)
      return NextResponse.json(
        { error: 'Analytics summary not found. Please refresh analytics first.' },
        { status: 404 }
      )
    }

    const metrics = (summaryRow.metrics as Record<string, unknown>) || {}
    const cachedBrief = metrics.ai_brief as
      | { data: AIBriefResponse; generated_at: string }
      | undefined

    // Check if cached AI brief is fresh (< 4 hours old)
    const isBriefFresh =
      !force_refresh &&
      cachedBrief?.generated_at &&
      new Date(cachedBrief.generated_at).getTime() > Date.now() - BRIEF_CACHE_DURATION_MS

    if (isBriefFresh) {
      log.info('Returning cached AI brief', {
        userId,
        period,
        briefAge: Date.now() - new Date(cachedBrief.generated_at).getTime(),
      })

      return NextResponse.json(
        {
          ...cachedBrief.data,
          generated_at: cachedBrief.generated_at,
          cached: true,
        },
        { status: 200 }
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      log.error('ANTHROPIC_API_KEY not configured')
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    const anthropic = new Anthropic({ apiKey })

    const normalizedSummary = normalizeSummary(metrics)

    // Generate new AI brief
    log.info('Generating new AI brief with Claude Haiku', { userId, period })

    const briefPrompt = buildBriefPrompt(normalizedSummary, period)

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 900,
      temperature: 0.4,
      messages: [
        {
          role: 'user',
          content: briefPrompt,
        },
      ],
    })

    // Extract text content from response
    const briefText = response.content.find((block) => block.type === 'text')?.text?.trim() || ''

    // Parse AI response into structured brief
    const brief = parseBriefResponse(briefText)

    // Cache the AI brief in database
    const updatedMetrics = {
      ...metrics,
      ai_brief: {
        data: brief,
        generated_at: new Date().toISOString(),
      },
    }

    const { error: updateError } = await supabase
      .from('flow_hub_summary_cache')
      .update({ metrics: updatedMetrics })
      .eq('user_id', userId)

    if (updateError) {
      log.error('Failed to cache AI brief', updateError)
      // Don't fail the request - return brief anyway
    }

    const generatedAt = new Date().toISOString()

    log.info('AI brief generated successfully', { userId, period })

    return NextResponse.json(
      {
        ...brief,
        generated_at: generatedAt,
        cached: false,
      },
      { status: 200 }
    )
  } catch (error) {
    log.error('Unexpected error in flow hub brief API', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Build prompt for Claude to generate AI brief
 */
function buildBriefPrompt(summary: NormalisedSummary, period: number): string {
  return `You are an AI analyst for totalaud.io, a music promotion platform. Analyse the following campaign performance data and provide a concise executive brief in British English.

**Performance Summary (Last ${period} Days)**
- Total Campaigns: ${summary.totalCampaigns}
- Total EPKs: ${summary.totalEpks}
- Total Views: ${summary.totalViews}
- Total Downloads: ${summary.totalDownloads}
- Total Shares: ${summary.totalShares}
- Agent Runs: ${summary.totalAgentRuns}
- Manual Saves: ${summary.totalSaves}
- Average CTR: ${summary.avgCtr}%
- Average Engagement Score: ${summary.avgEngagementScore}

**Top Performing EPKs**
${JSON.stringify(summary.topEpks, null, 2)}

**Instructions:**
1. Provide a **title** (max 60 characters) - a punchy one-liner about the period's performance
2. Write a **summary** (2-3 sentences) - overall performance narrative
3. List **3-5 highlights** - specific wins, growth metrics, or standout moments
4. List **2-3 risks** - areas of concern, declining metrics, or bottlenecks
5. List **3-5 recommendations** - actionable next steps to improve performance

**Output Format (JSON only, no markdown):**
{
  "title": "Strong growth week with standout EPK performance",
  "summary": "Your campaigns saw a 24% increase in views this week, driven by two high-performing EPKs. Engagement remains steady, though download rates could be optimised.",
  "highlights": [
    "EPK #1 generated 450 views (40% of total traffic)",
    "Agent automation saved an estimated 12 hours of manual work",
    "Share rate increased by 15% compared to last period"
  ],
  "risks": [
    "Download conversion rate dropped to 8% (target: 12%)",
    "Only 2 of 5 EPKs received significant traffic"
  ],
  "recommendations": [
    "Add clear CTAs to underperforming EPKs to boost downloads",
    "Consider A/B testing hero images on low-traffic EPKs",
    "Schedule agent runs during peak traffic hours (10am-2pm)",
    "Review targeting strategy for EPKs with low view counts"
  ]
}

Respond with ONLY the JSON object, no markdown code blocks or additional text.`
}

/**
 * Parse Claude's response into structured brief
 */
function parseBriefResponse(text: string): {
  title: string
  summary: string
  highlights: string[]
  risks: string[]
  recommendations: string[]
} {
  try {
    // Remove markdown code blocks if present
    const cleanedText = text
      .replace(/```json\n/g, '')
      .replace(/```\n/g, '')
      .replace(/```/g, '')
      .trim()

    const parsed = JSON.parse(cleanedText)

    return {
      title: parsed.title || 'Performance Brief',
      summary: parsed.summary || 'No summary available',
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
      risks: Array.isArray(parsed.risks) ? parsed.risks : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
    }
  } catch (error) {
    log.error('Failed to parse AI brief response', { text, error })

    // Fallback to basic brief
    return {
      title: 'AI Brief Unavailable',
      summary: 'Unable to generate AI brief at this time. Please try again later.',
      highlights: [],
      risks: [],
      recommendations: ['Retry brief generation', 'Check analytics summary data'],
    }
  }
}

interface NormalisedSummary {
  totalCampaigns: number
  totalEpks: number
  totalViews: number
  totalDownloads: number
  totalShares: number
  totalAgentRuns: number
  totalSaves: number
  avgCtr: number
  avgEngagementScore: number
  topEpks: Array<Record<string, unknown>>
}

interface AIBriefResponse {
  title: string
  summary: string
  highlights: string[]
  risks: string[]
  recommendations: string[]
}

function normalizeSummary(metrics: Record<string, unknown>): NormalisedSummary {
  const totals = (metrics.totals as Record<string, unknown>) || {}
  const totalsNumber = (key: string, fallback = 0) =>
    Number((totals[key] as number | undefined) ?? fallback)

  const topEpks = (metrics.top_epks as Array<Record<string, unknown>>) || []

  return {
    totalCampaigns: totalsNumber('campaigns'),
    totalEpks: totalsNumber('epks'),
    totalViews: totalsNumber('epk_views'),
    totalDownloads: totalsNumber('epk_downloads'),
    totalShares: totalsNumber('epk_shares'),
    totalAgentRuns: totalsNumber('agent_runs'),
    totalSaves: totalsNumber('manual_saves'),
    avgCtr: Number((metrics.avg_ctr as number | undefined) ?? 0),
    avgEngagementScore: Number((metrics.avg_engagement_score as number | undefined) ?? 0),
    topEpks,
  }
}
