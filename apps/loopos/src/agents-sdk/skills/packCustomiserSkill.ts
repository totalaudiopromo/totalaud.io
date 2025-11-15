import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import type { AgentSkill } from '../types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

const PackCustomiserInputSchema = z.object({
  packName: z.string(),
  packNodes: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    })
  ),
  artistProfile: z.object({
    genre: z.string(),
    audience: z.string(),
    experience: z.enum(['beginner', 'intermediate', 'advanced']),
    budget: z.enum(['low', 'medium', 'high']).optional(),
  }),
})

type PackCustomiserInput = z.infer<typeof PackCustomiserInputSchema>

const PackCustomiserOutputSchema = z.object({
  customisedNodes: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      customisationNote: z.string(),
    })
  ),
  tailoredAdvice: z.string(),
})

type PackCustomiserOutput = z.infer<typeof PackCustomiserOutputSchema>

export const packCustomiserSkill: AgentSkill<
  PackCustomiserInput,
  PackCustomiserOutput
> = {
  id: 'packCustomiserSkill',
  name: 'Customise Creative Pack',
  description: 'Tailor a generic Creative Pack to an artist's specific profile and needs',
  category: 'customisation',
  inputSchema: PackCustomiserInputSchema,
  outputSchema: PackCustomiserOutputSchema,
  estimatedDuration: 7000, // 7 seconds
  costEstimate: {
    tokens: 1400,
  },

  async run(input, context) {
    const nodesJson = JSON.stringify(input.packNodes, null, 2)

    const prompt = `You are a music marketing consultant. Customise this generic campaign pack for a specific artist:

Pack: ${input.packName}
Nodes:
${nodesJson}

Artist Profile:
- Genre: ${input.artistProfile.genre}
- Audience: ${input.artistProfile.audience}
- Experience: ${input.artistProfile.experience}
${input.artistProfile.budget ? `- Budget: ${input.artistProfile.budget}` : ''}

Customise each node to be more relevant to this artist. Make the descriptions specific to their genre, audience, and experience level. If they're a beginner, simplify; if advanced, add nuance.

Return a JSON object with this structure:
{
  "customisedNodes": [
    {
      "title": "Customised title",
      "description": "Tailored description",
      "customisationNote": "Brief note on what was changed and why"
    }
  ],
  "tailoredAdvice": "Overall strategic advice for this specific artist"
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

    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON from Claude response')
    }

    const parsed = JSON.parse(jsonMatch[0])
    return PackCustomiserOutputSchema.parse(parsed)
  },
}
