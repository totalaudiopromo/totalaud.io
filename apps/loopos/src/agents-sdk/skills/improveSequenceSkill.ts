import Anthropic from '@anthropic-ai/sdk'
import type { AgentSkill } from '../types'
import {
  SequenceImprovementInputSchema,
  SequenceImprovementOutputSchema,
  type SequenceImprovementInput,
  type SequenceImprovementOutput,
} from '../types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export const improveSequenceSkill: AgentSkill<
  SequenceImprovementInput,
  SequenceImprovementOutput
> = {
  id: 'improveSequenceSkill',
  name: 'Improve Node Sequence',
  description: 'Optimise node dependencies and remove redundancies',
  category: 'optimisation',
  inputSchema: SequenceImprovementInputSchema,
  outputSchema: SequenceImprovementOutputSchema,
  estimatedDuration: 6000, // 6 seconds
  costEstimate: {
    tokens: 1200,
  },

  async run(input, context) {
    const nodesJson = JSON.stringify(input.nodes, null, 2)

    const prompt = `You are a workflow optimisation expert. Analyse this list of campaign nodes and improve the sequence:

${nodesJson}

Optimise by:
1. Identifying logical dependencies (which nodes must come before others)
2. Removing redundant nodes
3. Ensuring efficient sequencing

Return a JSON object with this structure:
{
  "optimisedNodes": [
    {
      "id": "...",
      "title": "...",
      "dependencies": ["node-id-1", "node-id-2"],
      "changeReason": "Optional explanation if changed"
    }
  ],
  "removedRedundancies": ["node-id-3"],
  "summary": "Brief explanation of improvements made"
}

Use British English spelling.`

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

    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON from Claude response')
    }

    const parsed = JSON.parse(jsonMatch[0])
    return SequenceImprovementOutputSchema.parse(parsed)
  },
}
