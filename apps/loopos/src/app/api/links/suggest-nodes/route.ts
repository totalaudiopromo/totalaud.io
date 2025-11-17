/**
 * Phase 32: Creative Continuity — Node Suggestion API
 *
 * Suggests timeline nodes from note/card content.
 * AI tone: quiet, British, optional, never forceful.
 * Philosophy: "You could try..." not "You should..."
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ai } from '@/lib/ai'
import { NodeTypeSchema } from '@loopos/db'

// =====================================================
// SCHEMAS
// =====================================================

const SuggestNodesRequestSchema = z.object({
  content: z.string().min(1),
  title: z.string().optional(),
  sourceType: z.enum(['note', 'analogue', 'journal']).optional(),
})

const NodeSuggestionSchema = z.object({
  title: z.string(),
  type: NodeTypeSchema,
  content: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
})

const SuggestNodesResponseSchema = z.object({
  suggestions: z.array(NodeSuggestionSchema).max(3),
})

// =====================================================
// POST /api/links/suggest-nodes
// =====================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const request = SuggestNodesRequestSchema.parse(body)

    // Check if AI is configured
    if (!ai.isConfigured()) {
      return NextResponse.json(
        { error: 'AI not configured', suggestions: [] },
        { status: 200 }
      )
    }

    // Build British, calm prompt
    const prompt = `You are helping an independent artist organise their creative ideas.

They've written this ${request.sourceType || 'note'}:

${request.title ? `Title: ${request.title}\n` : ''}${request.content}

Based on this, suggest 0-3 timeline items they could add to their project timeline. Be gentle and optional — use "You could try..." not "You should...".

Each suggestion should be:
- A clear, actionable timeline item
- One of these types: idea, milestone, task, reference, insight, or decision
- Brief (1-2 sentences)

If the note doesn't clearly suggest any timeline items, return an empty array.

Respond in JSON format:
{
  "suggestions": [
    {
      "title": "Release date decision",
      "type": "decision",
      "content": "You could try setting a rough release window based on your current momentum.",
      "confidence": 0.8
    }
  ]
}

Use British English. Be calm. Be helpful, not pushy.`

    const response = await ai.generateInsight(prompt)

    // Parse AI response
    let parsed
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0])
      } else {
        parsed = JSON.parse(response)
      }
    } catch (parseError) {
      console.warn('[Suggestions] Failed to parse AI response:', parseError)
      return NextResponse.json({ suggestions: [] }, { status: 200 })
    }

    // Validate response
    const validated = SuggestNodesResponseSchema.parse(parsed)

    // Limit to 3 suggestions
    const suggestions = validated.suggestions.slice(0, 3)

    return NextResponse.json({
      success: true,
      suggestions,
    })
  } catch (error) {
    console.error('[Suggestions] Failed to suggest nodes:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }

    // Don't break the UI - return empty suggestions
    return NextResponse.json(
      { error: 'Suggestion failed', suggestions: [] },
      { status: 200 }
    )
  }
}
