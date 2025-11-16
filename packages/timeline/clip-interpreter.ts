/**
 * Clip Interpretation Engine
 * Converts timeline clips into agent instructions
 */

import { z } from 'zod'
import type { TimelineClip } from '@totalaud/os-state/campaign'

export type BehaviourType =
  | 'research'
  | 'planning'
  | 'followup'
  | 'analysis'
  | 'story'
  | 'custom'

export type ExecutionMode = 'auto' | 'manual' | 'assist'

// Extended clip metadata schema
export const ClipBehaviourSchema = z.object({
  behaviourType: z.enum(['research', 'planning', 'followup', 'analysis', 'story', 'custom']),
  assignedAgent: z.enum(['scout', 'coach', 'tracker', 'insight']).optional(),
  executionMode: z.enum(['auto', 'manual', 'assist']).default('manual'),
  payload: z.record(z.unknown()).optional(),
})

export type ClipBehaviour = z.infer<typeof ClipBehaviourSchema>

export interface InterpretedClip {
  clip: TimelineClip
  behaviour: ClipBehaviour
  instructions: AgentInstructions
  isValid: boolean
  validationErrors?: string[]
}

export interface AgentInstructions {
  action: string
  parameters: Record<string, unknown>
  expectedOutput?: string
  dependencies?: string[] // Clip IDs this depends on
  priority?: 'low' | 'medium' | 'high'
}

export class ClipInterpreter {
  /**
   * Interpret a clip and extract agent instructions
   */
  interpret(clip: TimelineClip): InterpretedClip {
    try {
      // Parse metadata
      const behaviour = ClipBehaviourSchema.parse(clip.metadata || {})

      // Generate instructions based on behaviour type
      const instructions = this.generateInstructions(clip, behaviour)

      // Validate
      const validationErrors = this.validate(clip, behaviour)

      return {
        clip,
        behaviour,
        instructions,
        isValid: validationErrors.length === 0,
        validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
      }
    } catch (error) {
      // Invalid metadata - return fallback
      return {
        clip,
        behaviour: {
          behaviourType: 'custom',
          executionMode: 'manual',
        },
        instructions: {
          action: 'manual_execution',
          parameters: {},
        },
        isValid: false,
        validationErrors: [
          error instanceof Error ? error.message : 'Invalid clip metadata',
        ],
      }
    }
  }

  /**
   * Generate instructions from clip and behaviour
   */
  private generateInstructions(
    clip: TimelineClip,
    behaviour: ClipBehaviour
  ): AgentInstructions {
    const baseInstructions: AgentInstructions = {
      action: this.mapBehaviourToAction(behaviour.behaviourType),
      parameters: {
        clipName: clip.name,
        duration: clip.duration,
        ...(behaviour.payload || {}),
      },
      priority: this.calculatePriority(clip, behaviour),
    }

    // Add behaviour-specific parameters
    switch (behaviour.behaviourType) {
      case 'research':
        return {
          ...baseInstructions,
          parameters: {
            ...baseInstructions.parameters,
            searchQuery: clip.name,
            targetCount: 20,
          },
          expectedOutput: 'List of research findings',
        }

      case 'planning':
        return {
          ...baseInstructions,
          parameters: {
            ...baseInstructions.parameters,
            breakdownLevel: 'detailed',
          },
          expectedOutput: 'Sequence of sub-clips',
        }

      case 'followup':
        return {
          ...baseInstructions,
          parameters: {
            ...baseInstructions.parameters,
            delayDays: 7,
            followupType: 'gentle',
          },
          expectedOutput: 'Follow-up status update',
        }

      case 'analysis':
        return {
          ...baseInstructions,
          parameters: {
            ...baseInstructions.parameters,
            metrics: ['engagement', 'completion', 'bottlenecks'],
          },
          expectedOutput: 'Analysis report + sentiment cards',
        }

      case 'story':
        return {
          ...baseInstructions,
          parameters: {
            ...baseInstructions.parameters,
            cardType: 'auto-detect',
          },
          expectedOutput: 'Analogue story card',
        }

      case 'custom':
      default:
        return baseInstructions
    }
  }

  /**
   * Map behaviour type to agent action
   */
  private mapBehaviourToAction(behaviourType: BehaviourType): string {
    const actionMap: Record<BehaviourType, string> = {
      research: 'execute_research',
      planning: 'create_plan',
      followup: 'schedule_followup',
      analysis: 'analyze_performance',
      story: 'create_story_card',
      custom: 'execute_custom',
    }

    return actionMap[behaviourType]
  }

  /**
   * Calculate priority based on clip properties
   */
  private calculatePriority(
    clip: TimelineClip,
    behaviour: ClipBehaviour
  ): 'low' | 'medium' | 'high' {
    // High priority for auto execution
    if (behaviour.executionMode === 'auto') return 'high'

    // Medium priority for assist mode
    if (behaviour.executionMode === 'assist') return 'medium'

    // High priority for analysis and followup
    if (['analysis', 'followup'].includes(behaviour.behaviourType)) {
      return 'high'
    }

    // Default to medium
    return 'medium'
  }

  /**
   * Validate clip and behaviour
   */
  private validate(clip: TimelineClip, behaviour: ClipBehaviour): string[] {
    const errors: string[] = []

    // Check if assigned agent matches behaviour type
    if (behaviour.assignedAgent) {
      const validAgents: Record<BehaviourType, string[]> = {
        research: ['scout'],
        planning: ['coach'],
        followup: ['tracker'],
        analysis: ['insight'],
        story: ['insight'],
        custom: ['scout', 'coach', 'tracker', 'insight'],
      }

      const valid = validAgents[behaviour.behaviourType]
      if (!valid.includes(behaviour.assignedAgent)) {
        errors.push(
          `Agent '${behaviour.assignedAgent}' cannot execute behaviour '${behaviour.behaviourType}'`
        )
      }
    }

    // Check duration constraints
    if (clip.duration < 1) {
      errors.push('Clip duration must be at least 1 second')
    }

    // Check for required payload fields
    if (behaviour.behaviourType === 'custom' && !behaviour.payload) {
      errors.push('Custom behaviour requires payload')
    }

    return errors
  }

  /**
   * Batch interpret multiple clips
   */
  interpretBatch(clips: TimelineClip[]): InterpretedClip[] {
    return clips.map((clip) => this.interpret(clip))
  }

  /**
   * Get clips ready for execution
   */
  getExecutableClips(clips: TimelineClip[]): InterpretedClip[] {
    return this.interpretBatch(clips).filter((interpreted) => interpreted.isValid)
  }
}

// Global interpreter instance
export const clipInterpreter = new ClipInterpreter()
