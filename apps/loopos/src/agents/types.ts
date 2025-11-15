import { z } from 'zod'

/**
 * Agent types matching the four loop phases
 */
export type AgentType = 'create' | 'promote' | 'analyse' | 'refine'

/**
 * Base agent input schema
 */
export const AgentInputSchema = z.object({
  agentType: z.enum(['create', 'promote', 'analyse', 'refine']),
  context: z.string().min(1, 'Context is required'),
  additionalData: z.record(z.unknown()).optional(),
})

export type AgentInput = z.infer<typeof AgentInputSchema>

/**
 * Agent action schema
 */
export const AgentActionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  estimatedTime: z.string().optional(),
  category: z.string().optional(),
})

export type AgentAction = z.infer<typeof AgentActionSchema>

/**
 * Agent insight schema
 */
export const AgentInsightSchema = z.object({
  type: z.enum(['observation', 'recommendation', 'warning', 'success']),
  message: z.string(),
  data: z.record(z.unknown()).optional(),
})

export type AgentInsight = z.infer<typeof AgentInsightSchema>

/**
 * Agent output schema
 */
export const AgentOutputSchema = z.object({
  actions: z.array(AgentActionSchema),
  insights: z.array(AgentInsightSchema),
  recommendations: z.array(z.string()),
  metadata: z.record(z.unknown()).optional(),
})

export type AgentOutput = z.infer<typeof AgentOutputSchema>
