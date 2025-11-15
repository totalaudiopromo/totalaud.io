import Anthropic from '@anthropic-ai/sdk'
import type { AgentSkill } from '../types'
import {
  NodeGenerationInputSchema,
  NodeGenerationOutputSchema,
  type NodeGenerationInput,
  type NodeGenerationOutput,
} from '../types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export const generateNodesSkill: AgentSkill<
  NodeGenerationInput,
  NodeGenerationOutput
> = {
  id: 'generateNodesSkill',
  name: 'Generate Campaign Nodes',
  description: 'Generate a structured list of campaign nodes from a brief and goals',
  category: 'generation',
  inputSchema: NodeGenerationInputSchema,
  outputSchema: NodeGenerationOutputSchema,
  estimatedDuration: 8000, // 8 seconds
  costEstimate: {
    tokens: 1500,
  },

  async run(input, context) {
    const prompt = `You are a music marketing campaign planner. Generate a structured list of campaign nodes (tasks/actions) based on the following:

Brief: ${input.brief}
Goals: ${input.goals.join(', ')}
Time Horizon: ${input.timeHorizon || 'Not specified'}

Generate 5-8 specific, actionable nodes that would help achieve these goals. Each node should have:
- A clear, concise title
- A brief description of what needs to be done
- Initial status (usually 'pending')

Return a JSON object with this structure:
{
  "nodes": [
    { "title": "...", "description": "...", "status": "pending" }
  ],
  "rationale": "Brief explanation of the strategy"
}

Use British English spelling. Be specific and practical.`

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
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

    // Parse JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON from Claude response')
    }

    const parsed = JSON.parse(jsonMatch[0])
    return NodeGenerationOutputSchema.parse(parsed)
  },
}
