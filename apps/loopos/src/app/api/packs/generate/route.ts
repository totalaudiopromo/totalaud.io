import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { env } from '@/lib/env'
import { createCreativePack, type DbCreativePack } from '@loopos/db'

const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
})

/**
 * AI Pack Generation API
 * POST /api/packs/generate
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, goal, packType, additionalContext } = body

    if (!userId || !goal || !packType) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, goal, packType' },
        { status: 400 }
      )
    }

    // Generate pack using Claude
    const prompt = buildPackGenerationPrompt(goal, packType, additionalContext)

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Parse JSON response
    const packData = parsePackResponse(responseText)

    // Create pack in database
    const newPack: Omit<DbCreativePack, 'id' | 'created_at' | 'updated_at'> = {
      user_id: userId,
      name: packData.name,
      pack_type: packType,
      description: packData.description,
      is_template: false,
      is_public: false,
      nodes: packData.nodes,
      sequences: packData.sequences,
      notes: packData.notes,
      micro_actions: packData.micro_actions,
      insights: packData.insights,
      ai_prompts: packData.ai_prompts,
      metadata: packData.metadata,
    }

    const createdPack = await createCreativePack(newPack)

    return NextResponse.json({
      success: true,
      pack: createdPack,
    })
  } catch (error) {
    console.error('Error generating pack:', error)
    return NextResponse.json(
      { error: 'Failed to generate pack', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function buildPackGenerationPrompt(goal: string, packType: string, additionalContext?: string): string {
  return `You are a creative workflow expert helping independent music artists plan their creative projects.

Generate a detailed Creative Pack for the following:

GOAL: ${goal}
PACK TYPE: ${packType}
${additionalContext ? `ADDITIONAL CONTEXT: ${additionalContext}` : ''}

Create a comprehensive pack that includes:

1. **Nodes** - 4-8 specific tasks with:
   - type: create | promote | analyse | refine
   - title: Clear, actionable task name
   - description: Specific details about what to do
   - friction: 0-100 (how hard/unpleasant the task feels)
   - priority: 0-100 (how important it is)
   - time_start: seconds from start (0 for day 1)
   - duration: seconds the task takes

2. **Sequences** - Logical groupings of nodes:
   - name: Sequence name
   - steps: Array of node titles in order

3. **Notes** - 3-5 key implementation tips

4. **Micro-actions** - 5-10 quick wins (< 15 minutes each)

5. **Insights** - 3-5 strategic insights or industry knowledge

6. **AI Prompts** - 2-4 useful prompt templates for this workflow

7. **Metadata** - Include:
   - estimated_duration_days: Total timeline in days
   - difficulty: beginner | intermediate | advanced
   - requires_budget: boolean

IMPORTANT:
- Be specific and actionable
- Use British English spelling (favour, colour, etc.)
- Base friction on psychological resistance, not just time
- Prioritise based on impact, not urgency
- Times should be realistic for independent artists
- Include both creative and promotional tasks where relevant

Return ONLY valid JSON in this exact format:
{
  "name": "Pack Name",
  "description": "Pack description",
  "nodes": [...],
  "sequences": [...],
  "notes": [...],
  "micro_actions": [...],
  "insights": [...],
  "ai_prompts": {...},
  "metadata": {...}
}
`
}

function parsePackResponse(response: string): any {
  try {
    // Find JSON in response (might be wrapped in markdown code blocks)
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const parsed = JSON.parse(jsonMatch[0])

    // Validate required fields
    if (!parsed.name || !parsed.nodes || !Array.isArray(parsed.nodes)) {
      throw new Error('Invalid pack structure')
    }

    return {
      name: parsed.name,
      description: parsed.description || '',
      nodes: parsed.nodes || [],
      sequences: parsed.sequences || [],
      notes: parsed.notes || [],
      micro_actions: parsed.micro_actions || [],
      insights: parsed.insights || [],
      ai_prompts: parsed.ai_prompts || {},
      metadata: parsed.metadata || {},
    }
  } catch (error) {
    console.error('Error parsing pack response:', error)
    throw new Error('Failed to parse AI response')
  }
}
