/**
 * AI Insight Engine - Edge Function
 *
 * Analyzes campaign metrics and generates AI-powered insights
 * Stage 6: Realtime Data Integration
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabaseClient'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { campaignId } = await req.json()

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    // Fetch campaign data
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      console.error('Failed to fetch campaign', campaignError)
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Fetch campaign metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('campaign_metrics')
      .select('*')
      .eq('campaign_id', campaignId)
      .single()

    if (metricsError) {
      console.error('Failed to fetch metrics', metricsError)
      return NextResponse.json({ error: 'Metrics not found' }, { status: 404 })
    }

    // Fetch recent events
    const { data: events, error: eventsError } = await supabase
      .from('campaign_events')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (eventsError) {
      console.error('Failed to fetch events', eventsError)
    }

    // Generate insights using Claude
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
    }

    const anthropic = new Anthropic({
      apiKey,
    })

    const analysisPrompt = `You are an AI music promotion analyst. Analyze the following campaign data and generate 3-5 actionable insights.

Campaign: "${campaign.title}"
Goal: ${metrics.pitches_total} pitches

Current Metrics:
- Pitches sent: ${metrics.pitches_sent}/${metrics.pitches_total} (${Math.round((metrics.pitches_sent / metrics.pitches_total) * 100)}%)
- Opens: ${metrics.opens} (${metrics.open_rate}% open rate)
- Replies: ${metrics.replies} (${metrics.reply_rate}% reply rate)

Recent Activity:
${events ? events.slice(0, 10).map(e => `- ${e.type} to ${e.target} (${e.status})`).join('\n') : 'No events yet'}

Generate 3-5 insights in the following JSON format:
[
  {
    "key": "Short title (e.g., 'Best Send Time')",
    "value": "1-2 sentence insight with actionable recommendation",
    "metric": "Specific metric change (e.g., '+18% open rate')",
    "trend": "up" | "down" | "neutral"
  }
]

Focus on:
1. Engagement patterns (open rate, reply rate trends)
2. Timing and frequency optimization
3. Target contact performance
4. Next action recommendations
5. Comparison to typical music industry benchmarks (20-30% open rate is standard)

Return ONLY valid JSON, no other text.`

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: analysisPrompt,
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    const insights = JSON.parse(content.text)

    // Save insights to database
    const insertPromises = insights.map((insight: any) =>
      supabase.from('campaign_insights').insert({
        campaign_id: campaignId,
        key: insight.key,
        value: insight.value,
        metric: insight.metric,
        trend: insight.trend,
      })
    )

    await Promise.all(insertPromises)

    console.log('Insights generated successfully', { campaignId, count: insights.length })

    return NextResponse.json({
      success: true,
      insights,
      count: insights.length,
    })
  } catch (error) {
    console.error('Failed to generate insights', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
