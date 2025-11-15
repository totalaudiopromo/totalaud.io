import Anthropic from '@anthropic-ai/sdk'
import type { AgentSkill } from '../types'
import {
  CoachDailyPlanInputSchema,
  CoachDailyPlanOutputSchema,
  type CoachDailyPlanInput,
  type CoachDailyPlanOutput,
} from '../types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export const coachDailyPlanSkill: AgentSkill<
  CoachDailyPlanInput,
  CoachDailyPlanOutput
> = {
  id: 'coachDailyPlanSkill',
  name: 'Generate Daily Plan',
  description: 'Create a prioritised daily action plan based on momentum and availability',
  category: 'generation',
  inputSchema: CoachDailyPlanInputSchema,
  outputSchema: CoachDailyPlanOutputSchema,
  estimatedDuration: 5000, // 5 seconds
  costEstimate: {
    tokens: 1000,
  },

  async run(input, context) {
    const currentNodesText = input.currentNodes
      ? input.currentNodes.map((n) => `- ${n.title} (${n.status})`).join('\n')
      : 'No active nodes'

    const prompt = `You are a motivational campaign coach. Create a daily action plan for an artist/marketer with the following context:

Current Momentum Score: ${input.momentum}/100
Available Time Today: ${input.availabilityHours} hours
Active Nodes:
${currentNodesText}

Generate 3-5 prioritised actions for today. Each action should:
- Be specific and achievable within the time available
- Match their current momentum (high momentum = ambitious tasks, low = smaller wins)
- Build on their active nodes

Return a JSON object with this structure:
{
  "actions": [
    {
      "title": "Action title",
      "description": "What to do",
      "estimatedDuration": "30 minutes",
      "priority": "high" | "medium" | "low"
    }
  ],
  "narrative": "Brief strategic overview of today's plan",
  "encouragement": "Motivational message based on their momentum"
}

Use British English spelling. Be encouraging but realistic.`

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
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
    return CoachDailyPlanOutputSchema.parse(parsed)
  },
}
