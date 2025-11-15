import { z, ZodSchema } from 'zod'

/**
 * Agent SDK Core Types
 *
 * Defines the structure for skills, execution context, and results.
 */

// ========================================
// Agent Context
// ========================================

export interface AgentContext {
  userId: string
  currentNode?: {
    id: string
    title: string
    description?: string
  }
  currentLoop?: {
    id: string
    name: string
  }
  momentum?: number // 0-100 flow score
  environment: 'development' | 'production'
}

// ========================================
// Agent Skill Definition
// ========================================

export interface AgentSkill<TInput = unknown, TOutput = unknown> {
  id: string
  name: string
  description: string
  category: 'generation' | 'analysis' | 'optimisation' | 'customisation'
  inputSchema: ZodSchema<TInput>
  outputSchema: ZodSchema<TOutput>
  run: (input: TInput, context: AgentContext) => Promise<TOutput>
  estimatedDuration?: number // milliseconds
  costEstimate?: {
    tokens?: number
    credits?: number
  }
}

// ========================================
// Execution Result
// ========================================

export interface AgentExecutionResult<TOutput = unknown> {
  success: boolean
  data?: TOutput
  error?: string
  logs: string[]
  duration: number // milliseconds
  metadata: {
    skillId: string
    timestamp: string
    userId: string
    tokensUsed?: number
  }
}

// ========================================
// Skill Registry Types
// ========================================

export interface SkillRegistryEntry {
  skill: AgentSkill
  registeredAt: string
  enabled: boolean
}

export type SkillRegistry = Map<string, SkillRegistryEntry>

// ========================================
// Common Schemas
// ========================================

export const NodeGenerationInputSchema = z.object({
  brief: z.string().min(10, 'Brief must be at least 10 characters'),
  goals: z.array(z.string()).min(1, 'At least one goal required'),
  timeHorizon: z.string().optional(),
})

export type NodeGenerationInput = z.infer<typeof NodeGenerationInputSchema>

export const NodeGenerationOutputSchema = z.object({
  nodes: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      status: z.enum(['pending', 'active', 'completed', 'archived']),
    })
  ),
  rationale: z.string(),
})

export type NodeGenerationOutput = z.infer<typeof NodeGenerationOutputSchema>

// ========================================
// Sequence Improvement
// ========================================

export const SequenceImprovementInputSchema = z.object({
  nodes: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      dependencies: z.array(z.string()).optional(),
    })
  ),
})

export type SequenceImprovementInput = z.infer<typeof SequenceImprovementInputSchema>

export const SequenceImprovementOutputSchema = z.object({
  optimisedNodes: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      dependencies: z.array(z.string()),
      changeReason: z.string().optional(),
    })
  ),
  removedRedundancies: z.array(z.string()),
  summary: z.string(),
})

export type SequenceImprovementOutput = z.infer<typeof SequenceImprovementOutputSchema>

// ========================================
// Coach Daily Plan
// ========================================

export const CoachDailyPlanInputSchema = z.object({
  momentum: z.number().min(0).max(100),
  availabilityHours: z.number().min(0.5).max(24),
  currentNodes: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      status: z.string(),
    })
  ).optional(),
})

export type CoachDailyPlanInput = z.infer<typeof CoachDailyPlanInputSchema>

export const CoachDailyPlanOutputSchema = z.object({
  actions: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      estimatedDuration: z.string(),
      priority: z.enum(['high', 'medium', 'low']),
    })
  ),
  narrative: z.string(),
  encouragement: z.string(),
})

export type CoachDailyPlanOutput = z.infer<typeof CoachDailyPlanOutputSchema>
