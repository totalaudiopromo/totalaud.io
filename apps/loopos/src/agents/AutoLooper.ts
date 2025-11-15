import Anthropic from '@anthropic-ai/sdk'
import { env } from '@/lib/env'
import type { LoopNode } from '@/types'

export interface AutoLoopAnalysis {
  momentum: number
  trend: 'increasing' | 'stable' | 'decreasing'
  suggestedNodes: Array<{
    type: 'create' | 'promote' | 'analyse' | 'refine'
    title: string
    description: string
    suggestedPriority: number
    suggestedFriction: number
  }>
  suggestedDependencies: Array<{
    nodeId: string
    shouldLinkTo: string[]
  }>
  suggestedActions: string[]
  loopImprovements: string[]
  microActions: string[]
  emergingThemes: string[]
}

export class AutoLooper {
  private anthropic: Anthropic

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
    })
  }

  async analyseLoops(nodes: LoopNode[], userId: string): Promise<AutoLoopAnalysis> {
    const prompt = this.buildAnalysisPrompt(nodes)

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    return this.parseAnalysis(content.text, nodes)
  }

  private buildAnalysisPrompt(nodes: LoopNode[]): string {
    const nodesSummary = nodes
      .map(
        (n) =>
          `- ${n.type.toUpperCase()}: "${n.title}" (priority: ${n.priority}%, friction: ${n.friction}%)`
      )
      .join('\n')

    return `You are the Auto-Looper intelligence for LoopOS, a cinematic creative operating system for artists.

Current nodes in the system:
${nodesSummary}

Analyse this creative loop and provide:
1. Overall momentum (0-100) based on node progression
2. Momentum trend (increasing/stable/decreasing)
3. Suggested new nodes to add (2-4 nodes that would advance the creative work)
4. Suggested dependencies between existing nodes
5. Suggested actions the user should take (3-5 specific actions)
6. Loop improvements (2-3 ways to optimise the flow)
7. Micro-actions (5-10 tiny next steps, each <10 words)
8. Emerging themes from the nodes

Format your response as JSON with this structure:
{
  "momentum": <number>,
  "trend": "<increasing|stable|decreasing>",
  "suggestedNodes": [...],
  "suggestedDependencies": [...],
  "suggestedActions": [...],
  "loopImprovements": [...],
  "microActions": [...],
  "emergingThemes": [...]
}

Be specific, actionable, and inspiring. This is a creative tool for artists.`
  }

  private parseAnalysis(response: string, nodes: LoopNode[]): AutoLoopAnalysis {
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const jsonStr = jsonMatch[1] || jsonMatch[0]
      const parsed = JSON.parse(jsonStr)

      return {
        momentum: parsed.momentum || 50,
        trend: parsed.trend || 'stable',
        suggestedNodes: parsed.suggestedNodes || [],
        suggestedDependencies: parsed.suggestedDependencies || [],
        suggestedActions: parsed.suggestedActions || [],
        loopImprovements: parsed.loopImprovements || [],
        microActions: parsed.microActions || [],
        emergingThemes: parsed.emergingThemes || [],
      }
    } catch (error) {
      console.error('Failed to parse AutoLooper response:', error)

      // Return safe fallback
      return {
        momentum: 50,
        trend: 'stable',
        suggestedNodes: [],
        suggestedDependencies: [],
        suggestedActions: ['Review your current nodes', 'Add more detail to descriptions'],
        loopImprovements: ['Break large tasks into smaller ones'],
        microActions: [],
        emergingThemes: [],
      }
    }
  }
}
