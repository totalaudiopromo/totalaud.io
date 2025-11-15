import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { env } from '@/lib/env'
import { createPlaybookChapter, type DbPlaybookChapter } from '@loopos/db'

const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
})

/**
 * AI Playbook Chapter Generation API
 * POST /api/playbook/generate
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, category, topic, context } = body

    if (!userId || !category || !topic) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, category, topic' },
        { status: 400 }
      )
    }

    // Generate chapter using Claude
    const prompt = buildChapterGenerationPrompt(category, topic, context)

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

    const content = message.content[0].type === 'text' ? message.content[0].text : ''

    // Create chapter in database
    const newChapter: Omit<DbPlaybookChapter, 'id' | 'created_at' | 'updated_at'> = {
      user_id: userId,
      title: topic,
      category,
      content,
      is_ai_generated: true,
      is_favourite: false,
      tags: extractTags(content),
      related_nodes: [],
      metadata: {
        generated_at: new Date().toISOString(),
        prompt_version: '1.0',
      },
    }

    const createdChapter = await createPlaybookChapter(newChapter)

    return NextResponse.json({
      success: true,
      chapter: createdChapter,
    })
  } catch (error) {
    console.error('Error generating chapter:', error)
    return NextResponse.json(
      { error: 'Failed to generate chapter', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function buildChapterGenerationPrompt(category: string, topic: string, context?: string): string {
  return `You are a music industry expert creating strategic playbook content for independent artists.

Generate a comprehensive strategic guide for the following:

CATEGORY: ${category}
TOPIC: ${topic}
${context ? `ADDITIONAL CONTEXT: ${context}` : ''}

Create a detailed playbook chapter that includes:

1. **Overview** - Brief introduction to the strategy (2-3 paragraphs)

2. **Why This Matters** - Explain the importance and impact (3-4 key points)

3. **Step-by-Step Strategy** - Detailed actionable steps:
   - Clear numbered steps
   - Specific tactics and techniques
   - Realistic timelines
   - Common pitfalls to avoid

4. **Tools & Resources** - Specific tools, platforms, or services to use

5. **Real-World Examples** - Brief case studies or examples of success

6. **Key Metrics to Track** - What to measure and why

7. **Pro Tips** - 3-5 insider tips from industry experience

8. **Next Steps** - Concrete actions to take after reading

IMPORTANT GUIDELINES:
- Write for independent artists with limited budgets
- Be specific and actionable, not vague
- Use British English spelling (favour, optimise, etc.)
- Include realistic timelines and expectations
- Mention free/affordable tools where possible
- Be honest about what works and what doesn't
- Focus on 2024-2025 strategies, not outdated tactics
- Use markdown formatting (headings, lists, bold, italic)
- Aim for 1000-1500 words
- Be encouraging but realistic

Write the complete chapter content now:`
}

function extractTags(content: string): string[] {
  // Extract potential tags from content
  const tags: string[] = []

  // Common music industry terms
  const keywords = [
    'spotify',
    'tiktok',
    'instagram',
    'playlist',
    'release',
    'promotion',
    'marketing',
    'social media',
    'pr',
    'radio',
    'streaming',
    'growth',
    'fanbase',
    'engagement',
  ]

  const lowerContent = content.toLowerCase()

  keywords.forEach((keyword) => {
    if (lowerContent.includes(keyword)) {
      tags.push(keyword)
    }
  })

  // Return up to 5 tags
  return tags.slice(0, 5)
}
