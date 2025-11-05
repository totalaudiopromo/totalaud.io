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
import { createClient } from '@/lib/supabaseClient'
import { logger } from '@/lib/logger'
import { env } from '@/lib/env'
import Anthropic from '@anthropic-ai/sdk'

const log = logger.scope('FlowHubBriefAPI')

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
})

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

    const supabase = createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      log.warn('Unauthenticated request to flow hub brief')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    log.debug('Generating AI brief', { userId: user.id, period, force_refresh })

    // Fetch summary data
    const { data: summary, error: summaryError } = await supabase
      .from('flow_hub_summary_cache')
      .select('*')
      .eq('user_id', user.id)
      .eq('period_days', period)
      .maybeSingle()

    if (summaryError || !summary) {
      log.error('Failed to fetch summary for AI brief', summaryError)
      return NextResponse.json(
        { error: 'Analytics summary not found. Please refresh analytics first.' },
        { status: 404 }
      )
    }

    // Check if cached AI brief is fresh (< 4 hours old)
    const isBriefFresh =
      !force_refresh &&
      summary.ai_brief &&
      summary.ai_brief_generated_at &&
      new Date(summary.ai_brief_generated_at).getTime() > Date.now() - BRIEF_CACHE_DURATION_MS

    if (isBriefFresh) {
      log.info('Returning cached AI brief', {
        userId: user.id,
        period,
        briefAge: Date.now() - new Date(summary.ai_brief_generated_at).getTime(),
      })

      return NextResponse.json(
        {
          ...summary.ai_brief,
          generated_at: summary.ai_brief_generated_at,
          cached: true,
        },
        { status: 200 }
      )
    }

    // Generate new AI brief
    log.info('Generating new AI brief with Claude', { userId: user.id, period })

    const briefPrompt = buildBriefPrompt(summary, period)

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: briefPrompt,
        },
      ],
    })

    // Extract text content from response
    const briefText = response.content.find((block) => block.type === 'text')?.text || ''

    // Parse AI response into structured brief
    const brief = parseBriefResponse(briefText)

    // Cache the AI brief in database
    const { error: updateError } = await supabase
      .from('flow_hub_summary_cache')
      .update({
        ai_brief: brief,
        ai_brief_generated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('period_days', period)

    if (updateError) {
      log.error('Failed to cache AI brief', updateError)
      // Don't fail the request - return brief anyway
    }

    log.info('AI brief generated successfully', { userId: user.id, period })

    return NextResponse.json(
      {
        ...brief,
        generated_at: new Date().toISOString(),
        cached: false,
      },
      { status: 200 }
    )
  } catch (error) {
    log.error('Unexpected error in flow hub brief API', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Build prompt for Claude to generate AI brief
 */
function buildBriefPrompt(summary: any, period: number): string {
  return `You are an AI analyst for totalaud.io, a music promotion platform. Analyse the following campaign performance data and provide a concise executive brief in British English.

**Performance Summary (Last ${period} Days)**
- Total Campaigns: ${summary.total_campaigns}
- Total EPKs: ${summary.total_epks}
- Total Views: ${summary.total_views}
- Total Downloads: ${summary.total_downloads}
- Total Shares: ${summary.total_shares}
- Agent Runs: ${summary.total_agent_runs}
- Manual Saves: ${summary.total_saves}
- Average CTR: ${summary.avg_ctr}%
- Average Engagement Score: ${summary.avg_engagement_score}

**Top Performing EPKs**
${JSON.stringify(summary.top_epks, null, 2)}

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
