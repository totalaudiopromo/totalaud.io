import Anthropic from '@anthropic-ai/sdk'
import { env } from '@/lib/env'
import type { Orchestration, OrchestrationStep, AgentRole } from '@/types'

export class AgentOrchestrator {
  private anthropic: Anthropic

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
    })
  }

  async executeOrchestration(
    orchestration: Orchestration,
    context: Record<string, unknown>
  ): Promise<Orchestration> {
    const updatedSteps: OrchestrationStep[] = []

    for (const step of orchestration.steps) {
      // Check if dependencies are met
      const dependenciesComplete = step.dependsOn?.every((depId) => {
        const depStep = updatedSteps.find((s) => s.id === depId)
        return depStep?.status === 'complete'
      })

      if (step.dependsOn && step.dependsOn.length > 0 && !dependenciesComplete) {
        updatedSteps.push({ ...step, status: 'pending' })
        continue
      }

      // Execute step
      try {
        const result = await this.executeStep(step, context, updatedSteps)
        updatedSteps.push({
          ...step,
          status: 'complete',
          result,
        })

        // Add result to context for next steps
        context[`step_${step.id}_result`] = result
      } catch (error) {
        updatedSteps.push({
          ...step,
          status: 'error',
          result: error instanceof Error ? error.message : 'Unknown error',
        })
        break // Stop on error
      }
    }

    const allComplete = updatedSteps.every((s) => s.status === 'complete')
    const hasError = updatedSteps.some((s) => s.status === 'error')

    return {
      ...orchestration,
      steps: updatedSteps,
      status: hasError ? 'error' : allComplete ? 'complete' : 'running',
      updatedAt: new Date(),
    }
  }

  private async executeStep(
    step: OrchestrationStep,
    context: Record<string, unknown>,
    previousSteps: OrchestrationStep[]
  ): Promise<unknown> {
    const prompt = this.buildStepPrompt(step, context, previousSteps)

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1500,
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

    return this.parseStepResult(content.text, step.agentRole)
  }

  private buildStepPrompt(
    step: OrchestrationStep,
    context: Record<string, unknown>,
    previousSteps: OrchestrationStep[]
  ): string {
    const roleDescriptions = {
      create: 'You generate new creative ideas and concepts',
      promote: 'You develop promotional strategies and marketing plans',
      analyse: 'You analyse data, trends, and feedback to provide insights',
      refine: 'You improve and polish existing work',
      orchestrate: 'You coordinate multiple agents and workflows',
    }

    const previousResults =
      previousSteps.length > 0
        ? `\n\nPrevious step results:\n${previousSteps.map((s) => `- ${s.action}: ${JSON.stringify(s.result)}`).join('\n')}`
        : ''

    return `You are a ${step.agentRole} agent. ${roleDescriptions[step.agentRole]}.

Current task: ${step.action}

Context:
${JSON.stringify(context, null, 2)}${previousResults}

Execute this task and provide a structured JSON response with your result.
Be specific, actionable, and focused on the task at hand.`
  }

  private parseStepResult(response: string, role: AgentRole): unknown {
    try {
      // Try to extract JSON
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/\{[\s\S]*\}/)

      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0]
        return JSON.parse(jsonStr)
      }

      // If no JSON, return the text response
      return { type: 'text', content: response }
    } catch {
      return { type: 'text', content: response }
    }
  }

  // Predefined orchestration templates
  static getTemplate(name: string): Omit<Orchestration, 'id' | 'createdAt' | 'updatedAt'> {
    const templates: Record<
      string,
      Omit<Orchestration, 'id' | 'createdAt' | 'updatedAt'>
    > = {
      'release-planner': {
        name: 'Release Planner',
        description: 'Plan a complete music release strategy',
        status: 'draft',
        steps: [
          {
            id: 'step-1',
            agentRole: 'create',
            action: 'Generate release concept and creative direction',
            status: 'pending',
          },
          {
            id: 'step-2',
            agentRole: 'promote',
            action: 'Develop promotional strategy and timeline',
            dependsOn: ['step-1'],
            status: 'pending',
          },
          {
            id: 'step-3',
            agentRole: 'analyse',
            action: 'Analyse target audience and platform opportunities',
            dependsOn: ['step-1'],
            status: 'pending',
          },
          {
            id: 'step-4',
            agentRole: 'refine',
            action: 'Refine strategy based on analysis',
            dependsOn: ['step-2', 'step-3'],
            status: 'pending',
          },
        ],
      },
      'pr-cycle': {
        name: 'PR Cycle Generator',
        description: 'Create a complete PR campaign',
        status: 'draft',
        steps: [
          {
            id: 'step-1',
            agentRole: 'create',
            action: 'Write compelling press release',
            status: 'pending',
          },
          {
            id: 'step-2',
            agentRole: 'promote',
            action: 'Identify media targets and outreach plan',
            dependsOn: ['step-1'],
            status: 'pending',
          },
          {
            id: 'step-3',
            agentRole: 'analyse',
            action: 'Analyse coverage and response metrics',
            dependsOn: ['step-2'],
            status: 'pending',
          },
        ],
      },
      '30-day-growth': {
        name: '30-Day Growth Loop',
        description: 'Sustained growth strategy over 30 days',
        status: 'draft',
        steps: [
          {
            id: 'step-1',
            agentRole: 'analyse',
            action: 'Analyse current audience and growth opportunities',
            status: 'pending',
          },
          {
            id: 'step-2',
            agentRole: 'create',
            action: 'Create content calendar for 30 days',
            dependsOn: ['step-1'],
            status: 'pending',
          },
          {
            id: 'step-3',
            agentRole: 'promote',
            action: 'Design engagement and promotion tactics',
            dependsOn: ['step-2'],
            status: 'pending',
          },
          {
            id: 'step-4',
            agentRole: 'refine',
            action: 'Optimise and adjust based on weekly performance',
            dependsOn: ['step-3'],
            status: 'pending',
          },
        ],
      },
    }

    return templates[name] || templates['release-planner']
  }
}
