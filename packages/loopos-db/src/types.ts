import { z } from 'zod'

// Database schema types
export const NodeSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: z.enum(['create', 'promote', 'analyse', 'refine']),
  title: z.string().min(1),
  description: z.string().optional(),
  friction: z.number().min(0).max(100),
  priority: z.number().min(0).max(100),
  dependencies: z.array(z.string().uuid()).default([]),
  position_x: z.number(),
  position_y: z.number(),
  time_start: z.number().optional(),
  duration: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const JournalEntrySchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  date: z.string(),
  content: z.string(),
  ai_summary: z.string().optional(),
  blockers: z.array(z.string()).default([]),
  themes: z.array(z.string()).default([]),
  momentum: z.number().min(0).max(100).optional(),
  linked_nodes: z.array(z.string().uuid()).default([]),
  tomorrow_actions: z.array(z.string()).default([]),
  created_at: z.string(),
  updated_at: z.string(),
})

export const OrchestrationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  steps: z.array(
    z.object({
      id: z.string(),
      agent_role: z.enum(['create', 'promote', 'analyse', 'refine', 'orchestrate']),
      action: z.string(),
      depends_on: z.array(z.string()).default([]),
      status: z.enum(['pending', 'running', 'complete', 'error']),
      result: z.unknown().optional(),
    })
  ),
  status: z.enum(['draft', 'running', 'complete', 'error']),
  created_at: z.string(),
  updated_at: z.string(),
})

export type DbNode = z.infer<typeof NodeSchema>
export type DbJournalEntry = z.infer<typeof JournalEntrySchema>
export type DbOrchestration = z.infer<typeof OrchestrationSchema>
