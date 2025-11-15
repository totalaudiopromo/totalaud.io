/**
 * Zod schemas for agent validation
 */

import { z } from 'zod'

export const agentRoleSchema = z.enum(['create', 'promote', 'analyse', 'refine'])

export const agentPromptSchema = z.object({
  role: agentRoleSchema,
  context: z.string().min(1, 'Context is required'),
  instruction: z.string().min(1, 'Instruction is required'),
  constraints: z.array(z.string()).optional(),
})

export const agentResponseSchema = z.object({
  success: z.boolean(),
  output: z.string(),
  suggestions: z.array(z.string()).optional(),
  error: z.string().optional(),
})

export const agentActionSchema = z.object({
  id: z.string(),
  title: z.string(),
  role: agentRoleSchema,
  prompt: agentPromptSchema,
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  response: agentResponseSchema.optional(),
  createdAt: z.number(),
  completedAt: z.number().optional(),
})
