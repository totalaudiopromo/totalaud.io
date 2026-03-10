import Anthropic from '@anthropic-ai/sdk'
import { env } from './env'

// Initialize Anthropic client (optional - only if API key is configured)
const anthropic = env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }) : null

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface CoachContext {
  workspaceName: string
  nodes?: any[]
  journal?: any[]
  packs?: any[]
}

export const ai = {
  isConfigured(): boolean {
    return !!anthropic
  },

  async chat(messages: Message[], context?: CoachContext): Promise<string> {
    if (!anthropic) {
      throw new Error('Anthropic API key not configured')
    }

    // Build system prompt with context
    let systemPrompt = `You are a creative campaign coach for music promotion. You help artists and labels plan, execute, and optimise their promotional campaigns.

You provide strategic advice, tactical recommendations, and creative insights. You're encouraging but honest, practical but visionary.

Your responses are:
- Concise but comprehensive
- Actionable with specific next steps
- Encouraging but realistic
- British English spelling throughout`

    if (context) {
      systemPrompt += `\n\nCurrent workspace: ${context.workspaceName}`

      if (context.nodes && context.nodes.length > 0) {
        systemPrompt += `\n\nCampaign nodes: ${context.nodes.length} nodes including ${context.nodes.map((n) => n.title).join(', ')}`
      }

      if (context.journal && context.journal.length > 0) {
        systemPrompt += `\n\nRecent journal entries: ${context.journal.length} reflections`
      }

      if (context.packs && context.packs.length > 0) {
        systemPrompt += `\n\nActive packs: ${context.packs.map((p) => p.name).join(', ')}`
      }
    }

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      })

      const content = response.content[0]
      if (content.type === 'text') {
        return content.text
      }

      throw new Error('Unexpected response format')
    } catch (error) {
      console.error('AI chat error:', error)
      throw error
    }
  },

  async generateInsight(prompt: string, context?: CoachContext): Promise<string> {
    return this.chat([{ role: 'user', content: prompt }], context)
  },

  async analyseTimeline(nodes: any[]): Promise<{
    summary: string
    gaps: string[]
    suggestions: string[]
  }> {
    if (!anthropic) {
      throw new Error('Anthropic API key not configured')
    }

    const prompt = `Analyse this campaign timeline and provide:
1. A brief summary
2. Key gaps or missing elements
3. Strategic suggestions

Timeline nodes:
${nodes.map((n) => `- ${n.type}: ${n.title} - ${n.content}`).join('\n')}

Respond in JSON format:
{
  "summary": "...",
  "gaps": ["...", "..."],
  "suggestions": ["...", "..."]
}`

    const response = await this.chat([{ role: 'user', content: prompt }])

    try {
      return JSON.parse(response)
    } catch {
      return {
        summary: response,
        gaps: [],
        suggestions: [],
      }
    }
  },
}
