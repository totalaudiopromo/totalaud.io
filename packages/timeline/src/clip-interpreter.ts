/**
 * Clip Interpretation Engine - Phase 9
 * Converts timeline clips into well-typed agent instructions
 */

import { z } from 'zod'
import type {
  TimelineClip,
  ClipBehaviourType,
  AgentType,
  ExecutionMode,
  ClipExecutionContext,
} from './types'

/**
 * Clip Interpretation Error
 */
export class ClipInterpretationError extends Error {
  constructor(
    message: string,
    public clipId: string,
    public reason: string
  ) {
    super(message)
    this.name = 'ClipInterpretationError'
  }
}

/**
 * Research Behaviour Payload
 */
export const ResearchPayloadSchema = z.object({
  query: z.string(),
  targetType: z.enum(['contacts', 'playlists', 'opportunities', 'general']),
  sources: z.array(z.string()).optional(),
  maxResults: z.number().optional(),
})

export type ResearchPayload = z.infer<typeof ResearchPayloadSchema>

/**
 * Planning Behaviour Payload
 */
export const PlanningPayloadSchema = z.object({
  goal: z.string(),
  context: z.string().optional(),
  constraints: z.array(z.string()).optional(),
  generateSequence: z.boolean().default(true),
})

export type PlanningPayload = z.infer<typeof PlanningPayloadSchema>

/**
 * Follow-up Behaviour Payload
 */
export const FollowupPayloadSchema = z.object({
  contactId: z.string().optional(),
  contactEmail: z.string().email().optional(),
  previousMessageId: z.string().optional(),
  customMessage: z.string().optional(),
  includeAssets: z.boolean().default(false),
})

export type FollowupPayload = z.infer<typeof FollowupPayloadSchema>

/**
 * Analysis Behaviour Payload
 */
export const AnalysisPayloadSchema = z.object({
  analysisType: z.enum(['bottleneck', 'performance', 'sentiment', 'workflow']),
  timeRange: z
    .object({
      start: z.string().datetime(),
      end: z.string().datetime(),
    })
    .optional(),
  includeRecommendations: z.boolean().default(true),
})

export type AnalysisPayload = z.infer<typeof AnalysisPayloadSchema>

/**
 * Story Behaviour Payload
 */
export const StoryPayloadSchema = z.object({
  sentiment: z.enum(['excited', 'worried', 'blocked', 'breakthrough', 'reflective']),
  linkedClipIds: z.array(z.string().uuid()).optional(),
  freeformText: z.string().optional(),
})

export type StoryPayload = z.infer<typeof StoryPayloadSchema>

/**
 * Custom Behaviour Payload
 */
export const CustomPayloadSchema = z.record(z.unknown())

export type CustomPayload = z.infer<typeof CustomPayloadSchema>

/**
 * Interpreted Clip Instruction
 */
export interface InterpretedClipInstruction<T = unknown> {
  clip: TimelineClip
  agentType: AgentType
  behaviourType: ClipBehaviourType
  executionMode: ExecutionMode
  payload: T
  isValid: boolean
  errors: string[]
}

/**
 * Clip Interpreter Class
 */
export class ClipInterpreter {
  /**
   * Interpret a timeline clip into an agent instruction
   */
  static interpret(clip: TimelineClip): InterpretedClipInstruction {
    const errors: string[] = []

    // Validate basic clip structure
    if (!clip.id) {
      errors.push('Clip missing ID')
    }

    if (!clip.agentType) {
      errors.push('Clip missing agent type')
    }

    if (!clip.behaviourType) {
      errors.push('Clip missing behaviour type')
    }

    // Validate and normalise payload based on behaviour type
    let payload: unknown = clip.payload || {}
    let payloadValid = true

    try {
      payload = this.validatePayload(clip.behaviourType, clip.payload)
    } catch (error) {
      payloadValid = false
      errors.push(
        `Invalid payload for behaviour type "${clip.behaviourType}": ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }

    // Check agent/behaviour compatibility
    const compatibilityErrors = this.checkCompatibility(clip.agentType, clip.behaviourType)
    errors.push(...compatibilityErrors)

    return {
      clip,
      agentType: clip.agentType,
      behaviourType: clip.behaviourType,
      executionMode: clip.executionMode,
      payload,
      isValid: errors.length === 0 && payloadValid,
      errors,
    }
  }

  /**
   * Validate payload based on behaviour type
   */
  private static validatePayload(behaviourType: ClipBehaviourType, payload: unknown): unknown {
    switch (behaviourType) {
      case 'research':
        return ResearchPayloadSchema.parse(payload)
      case 'planning':
        return PlanningPayloadSchema.parse(payload)
      case 'followup':
        return FollowupPayloadSchema.parse(payload)
      case 'analysis':
        return AnalysisPayloadSchema.parse(payload)
      case 'story':
        return StoryPayloadSchema.parse(payload)
      case 'custom':
        return CustomPayloadSchema.parse(payload)
      default:
        throw new Error(`Unknown behaviour type: ${behaviourType}`)
    }
  }

  /**
   * Check compatibility between agent type and behaviour type
   */
  private static checkCompatibility(
    agentType: AgentType,
    behaviourType: ClipBehaviourType
  ): string[] {
    const compatibilityMap: Record<AgentType, ClipBehaviourType[]> = {
      scout: ['research', 'custom'],
      coach: ['planning', 'followup', 'custom'],
      tracker: ['followup', 'custom'],
      insight: ['analysis', 'story', 'custom'],
    }

    const validBehaviours = compatibilityMap[agentType]

    if (!validBehaviours.includes(behaviourType)) {
      return [
        `Agent type "${agentType}" is not compatible with behaviour type "${behaviourType}". Valid behaviours: ${validBehaviours.join(', ')}`,
      ]
    }

    return []
  }

  /**
   * Create execution context from clip and additional data
   */
  static createExecutionContext(
    clip: TimelineClip,
    options: {
      trackId: string
      campaignId: string
      userId: string
      osTheme: 'ascii' | 'xp' | 'aqua' | 'daw' | 'analogue'
      playheadPosition: number
      metadata?: Record<string, unknown>
    }
  ): ClipExecutionContext {
    return {
      clip,
      track: {
        id: options.trackId,
        campaignId: options.campaignId,
        name: '', // Will be populated by track lookup
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      campaignId: options.campaignId,
      userId: options.userId,
      osTheme: options.osTheme,
      playheadPosition: options.playheadPosition,
      metadata: options.metadata || {},
    }
  }

  /**
   * Batch interpret multiple clips
   */
  static interpretMany(clips: TimelineClip[]): InterpretedClipInstruction[] {
    return clips.map((clip) => this.interpret(clip))
  }

  /**
   * Filter clips by execution mode
   */
  static filterByExecutionMode(
    clips: TimelineClip[],
    mode: ExecutionMode
  ): InterpretedClipInstruction[] {
    return clips.filter((clip) => clip.executionMode === mode).map((clip) => this.interpret(clip))
  }

  /**
   * Get clips ready for execution at playhead position
   */
  static getClipsAtPlayhead(
    clips: TimelineClip[],
    playheadPosition: number
  ): InterpretedClipInstruction[] {
    return clips
      .filter((clip) => {
        const clipStart = clip.startTime
        const clipEnd = clip.startTime + clip.duration
        return playheadPosition >= clipStart && playheadPosition <= clipEnd
      })
      .map((clip) => this.interpret(clip))
  }
}
