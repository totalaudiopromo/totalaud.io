import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { env } from '@/lib/env'

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json()

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const anthropic = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
    })

    const prompt = `You are analysing a daily creative journal entry for LoopOS, a cinematic creative operating system for artists.

Journal entry:
"""
${content}
"""

Analyse this entry and provide:
1. A 2-3 sentence summary of the day
2. List of blockers (challenges/obstacles mentioned)
3. Emerging themes (recurring topics or patterns)
4. Tomorrow's 5 Actions (specific next steps, each <10 words)

Format as JSON:
{
  "summary": "<string>",
  "blockers": ["<string>", ...],
  "themes": ["<string>", ...],
  "tomorrowActions": ["<string>", "<string>", "<string>", "<string>", "<string>"]
}

Be encouraging, specific, and actionable. This is a creative tool for artists.`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const responseContent = response.content[0]
    if (responseContent.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    // Extract JSON from response
    const jsonMatch =
      responseContent.text.match(/```json\n([\s\S]*?)\n```/) ||
      responseContent.text.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const jsonStr = jsonMatch[1] || jsonMatch[0]
    const insights = JSON.parse(jsonStr)

    return NextResponse.json(insights)
  } catch (error) {
    console.error('Failed to generate journal insights:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}
