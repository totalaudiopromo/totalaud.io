/**
 * Coach Agent Behaviour - Phase 9
 * Planning, task breakdown, and strategic suggestions
 */

import type { AgentBehaviour } from '../runtime/agent-runner'
import type { AgentRuntimeContext } from '../runtime/agent-context'
import type { AgentBehaviourResult, TimelineClip } from '@total-audio/timeline'
import type { PlanningPayload, FollowupPayload } from '@total-audio/timeline/clip-interpreter'
import { complete } from '@total-audio/core-ai-provider'
import { getAgentLogger } from '../runtime/agent-logger'

const logger = getAgentLogger()

/**
 * Coach Agent Implementation
 */
export class CoachBehaviour implements AgentBehaviour {
  readonly type = 'coach' as const

  getDescription(): string {
    return 'Coach Agent - Strategic planning, task breakdown, and follow-up sequences'
  }

  canExecute(context: AgentRuntimeContext): boolean {
    const behaviourType = context.clip.clip.behaviourType
    return behaviourType === 'planning' || behaviourType === 'followup' || behaviourType === 'custom'
  }

  async execute(context: AgentRuntimeContext): Promise<AgentBehaviourResult> {
    const clip = context.clip.clip
    const clipId = clip.id

    logger.info('coach', clipId, 'Starting Coach agent execution')

    try {
      if (clip.behaviourType === 'planning') {
        return await this.executePlanning(context)
      } else if (clip.behaviourType === 'followup') {
        return await this.executeFollowup(context)
      } else {
        return await this.executeCustom(context)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('coach', clipId, `Coach execution failed: ${errorMessage}`)

      return {
        success: false,
        clipId,
        agentType: 'coach',
        behaviourType: clip.behaviourType,
        message: `Coach execution failed: ${errorMessage}`,
        errors: [errorMessage],
      }
    }
  }

  /**
   * Execute planning behaviour
   */
  private async executePlanning(context: AgentRuntimeContext): Promise<AgentBehaviourResult> {
    const clip = context.clip.clip
    const clipId = clip.id
    const payload = clip.payload as PlanningPayload

    if (!payload || !payload.goal) {
      return {
        success: false,
        clipId,
        agentType: 'coach',
        behaviourType: 'planning',
        message: 'Planning payload missing or invalid - goal is required',
        errors: ['Missing goal in planning payload'],
      }
    }

    logger.info('coach', clipId, `Planning for goal: ${payload.goal}`)

    // Use AI to break down the goal into actionable steps
    const prompt = `You are Coach, a strategic planning agent for music promotion campaigns.

Task: Break down this goal into actionable steps:
"${payload.goal}"

Context:
- Campaign: ${context.campaign.name}
- Campaign Goal: ${context.campaign.goal}
- OS Theme: ${context.osTheme}
${payload.context ? `- Additional Context: ${payload.context}` : ''}
${payload.constraints ? `- Constraints: ${payload.constraints.join(', ')}` : ''}

Create a timeline sequence (3-5 steps) that can be executed as timeline clips.

Response format: JSON array of steps
[
  {
    "step": 1,
    "title": "Step title",
    "description": "What to do",
    "agentType": "scout|coach|tracker|insight",
    "behaviourType": "research|planning|followup|analysis|story",
    "duration": 5-10 (in beats),
    "payload": {}
  },
  ...
]

Keep it practical and executable.`

    const completion = await complete(
      'anthropic',
      [
        {
          role: 'system',
          content:
            'You are Coach, a strategic planning expert for music campaigns. Respond only with valid JSON array.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        temperature: 0.5,
        max_tokens: 800,
      }
    )

    let steps: unknown[]

    try {
      steps = JSON.parse(completion.content)
      if (!Array.isArray(steps)) {
        throw new Error('Response is not an array')
      }
    } catch {
      steps = [
        {
          step: 1,
          title: 'Execute goal',
          description: payload.goal,
          agentType: 'coach',
          behaviourType: 'custom',
          duration: 8,
          payload: {},
        },
      ]
    }

    // Generate timeline clips from steps
    const generatedClips: TimelineClip[] = []
    let currentTime = clip.startTime + clip.duration

    if (payload.generateSequence) {
      for (const stepData of steps) {
        const step = stepData as {
          title: string
          description: string
          agentType: string
          behaviourType: string
          duration: number
          payload: Record<string, unknown>
        }

        generatedClips.push({
          id: `${clipId}-step-${generatedClips.length}`,
          campaignId: context.campaign.id,
          trackId: context.clip.track.id,
          agentType: (step.agentType || 'coach') as 'scout' | 'coach' | 'tracker' | 'insight',
          behaviourType: (step.behaviourType || 'custom') as
            | 'research'
            | 'planning'
            | 'followup'
            | 'analysis'
            | 'story'
            | 'custom',
          executionMode: 'assist',
          status: 'pending',
          title: step.title,
          description: step.description,
          startTime: currentTime,
          duration: step.duration || 8,
          colour: '#FF9800',
          payload: step.payload || {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })

        currentTime += step.duration || 8
      }
    }

    return {
      success: true,
      clipId,
      agentType: 'coach',
      behaviourType: 'planning',
      message: `Plan created: ${steps.length} steps generated`,
      output: {
        goal: payload.goal,
        steps,
        sequenceGenerated: payload.generateSequence,
      },
      generatedClips: payload.generateSequence ? generatedClips : undefined,
      metadata: {
        model: completion.model,
        timestamp: new Date().toISOString(),
      },
    }
  }

  /**
   * Execute follow-up behaviour
   */
  private async executeFollowup(context: AgentRuntimeContext): Promise<AgentBehaviourResult> {
    const clip = context.clip.clip
    const clipId = clip.id
    const payload = clip.payload as FollowupPayload

    logger.info('coach', clipId, 'Creating follow-up communication')

    return {
      success: true,
      clipId,
      agentType: 'coach',
      behaviourType: 'followup',
      message: `Follow-up prepared for ${payload.contactEmail || 'contact'}`,
      output: {
        contactEmail: payload.contactEmail,
        customMessage: payload.customMessage,
        includeAssets: payload.includeAssets,
      },
    }
  }

  /**
   * Execute custom behaviour
   */
  private async executeCustom(context: AgentRuntimeContext): Promise<AgentBehaviourResult> {
    const clip = context.clip.clip
    const clipId = clip.id

    logger.info('coach', clipId, 'Executing custom Coach behaviour')

    return {
      success: true,
      clipId,
      agentType: 'coach',
      behaviourType: 'custom',
      message: 'Custom Coach behaviour executed',
      output: clip.payload || {},
    }
  }
}

/**
 * Create Coach behaviour instance
 */
export function createCoachBehaviour(): CoachBehaviour {
  return new CoachBehaviour()
}
