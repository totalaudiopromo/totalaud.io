import { z } from 'zod'

export const SkillSchema = z.object({
  name: z.string(),
  version: z.string(),
  category: z.enum(['research', 'generation', 'analysis', 'communication']),
  description: z.string(),
  input: z.record(z.any()),
  output: z.record(z.any()),
  provider: z.enum(['openai', 'anthropic', 'custom']),
  model: z.string().optional(),
  config: z.record(z.any()).optional(),
  enabled: z.boolean().default(true),
  is_beta: z.boolean().default(false)
})

export type Skill = z.infer<typeof SkillSchema>

export interface SkillExecutionContext {
  userId: string
  sessionId?: string
  input: Record<string, any>
}

export interface SkillExecutionResult {
  output: Record<string, any>
  tokens_used: number
  cost_usd: number
  duration_ms: number
}

