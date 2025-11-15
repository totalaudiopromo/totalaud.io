import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import type { AgentSkill } from '../types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

const InsightExplainerInputSchema = z.object({
  flowScore: z.number().min(0).max(100),
  activeNodes: z.number(),
  completedNodes: z.number(),
  sessionDuration: z.number(), // minutes
  momentum: z.enum(['low', 'medium', 'high']),
})

type InsightExplainerInput = z.infer<typeof InsightExplainerInputSchema>

const InsightExplainerOutputSchema = z.object({
  summary: z.string(),
  insights: z.array(z.string()),
  recommendations: z.array(z.string()),
  tone: z.enum(['encouraging', 'motivating', 'cautious', 'celebrating']),
})

type InsightExplainerOutput = z.infer<typeof InsightExplainerOutputSchema>

export const insightExplainerSkill: AgentSkill<
  InsightExplainerInput,
  InsightExplainerOutput
> = {
  id: 'insightExplainerSkill',
  name: 'Explain Flow Insights',
  description: 'Transform raw Flow Meter data into human-readable insights and recommendations',
  category: 'analysis',
  inputSchema: InsightExplainerInputSchema,
  outputSchema: InsightExplainerOutputSchema,
  estimatedDuration: 4000, // 4 seconds
  costEstimate: {
    tokens: 800,
  },

  async run(input, context) {
    const prompt = `You are an analytics interpreter for a campaign management tool. Explain these Flow Meter metrics in plain, encouraging language:

Flow Score: ${input.flowScore}/100
Active Nodes: ${input.activeNodes}
Completed Nodes: ${input.completedNodes}
Session Duration: ${input.sessionDuration} minutes
Momentum: ${input.momentum}

Provide:
1. A summary of what these numbers mean
2. 2-3 specific insights about their progress
3. 2-3 actionable recommendations to improve

Return a JSON object with this structure:
{
  "summary": "One-sentence overview",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "tone": "encouraging" | "motivating" | "cautious" | "celebrating"
}

Use British English spelling. Be constructive and specific.`

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1200,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON from Claude response')
    }

    const parsed = JSON.parse(jsonMatch[0])
    return InsightExplainerOutputSchema.parse(parsed)
  },
}
