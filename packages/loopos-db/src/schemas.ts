/**
 * LoopOS Zod Validation Schemas
 * Type-safe validation for all LoopOS entities
 */

import { z } from 'zod'

// Enums
export const nodeTypeSchema = z.enum(['creative', 'promotional', 'analysis', 'planning', 'custom'])
export const nodeStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'blocked', 'archived'])
export const exportTypeSchema = z.enum(['promotion', 'analysis', 'planning', 'creative'])
export const exportStatusSchema = z.enum(['pending', 'synced', 'failed'])
export const executionStatusSchema = z.enum(['started', 'completed', 'failed', 'skipped'])

// Node schemas
export const loopOSNodeSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().nullable(),
  node_type: nodeTypeSchema,
  status: nodeStatusSchema,
  depends_on: z.array(z.string().uuid()).default([]),
  sequence_order: z.number().int().nullable(),
  auto_start: z.boolean().default(false),
  position_x: z.number().default(0),
  position_y: z.number().default(0),
  momentum_value: z.number().int().min(0).max(10).default(1),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.any()).default({}),
  created_at: z.string(),
  updated_at: z.string(),
  completed_at: z.string().nullable(),
  due_date: z.string().nullable(),
})

export const loopOSNodeInsertSchema = loopOSNodeSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export const loopOSNodeUpdateSchema = loopOSNodeSchema
  .omit({
    id: true,
    user_id: true,
    created_at: true,
  })
  .partial()

// Note schemas
export const loopOSNoteSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  tags: z.array(z.string()).default([]),
  backlinks: z.array(z.string().uuid()).default([]),
  linked_nodes: z.array(z.string().uuid()).default([]),
  ai_summary: z.string().nullable(),
  ai_themes: z.array(z.string()).default([]),
  metadata: z.record(z.any()).default({}),
  created_at: z.string(),
  updated_at: z.string(),
})

export const loopOSNoteInsertSchema = loopOSNoteSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export const loopOSNoteUpdateSchema = loopOSNoteSchema
  .omit({
    id: true,
    user_id: true,
    created_at: true,
  })
  .partial()

// Momentum schemas
export const loopOSMomentumSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  current_momentum: z.number().int().min(0),
  max_momentum: z.number().int().min(1).default(100),
  current_streak: z.number().int().min(0).default(0),
  longest_streak: z.number().int().min(0).default(0),
  last_action_date: z.string().nullable(),
  last_decay_at: z.string(),
  decay_rate: z.number().min(0).max(10).default(1.0),
  total_nodes_completed: z.number().int().min(0).default(0),
  total_sequences_completed: z.number().int().min(0).default(0),
  created_at: z.string(),
  updated_at: z.string(),
})

export const loopOSMomentumInsertSchema = loopOSMomentumSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export const loopOSMomentumUpdateSchema = loopOSMomentumSchema
  .omit({
    id: true,
    user_id: true,
    created_at: true,
  })
  .partial()

// Export schemas
export const loopOSExportSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  source_type: z.enum(['node', 'note', 'sequence', 'daily_action']),
  source_id: z.string().uuid().nullable(),
  export_type: exportTypeSchema,
  content: z.string().min(1),
  metadata: z.record(z.any()).default({}),
  suggested_date: z.string().nullable(),
  status: exportStatusSchema,
  sync_error: z.string().nullable(),
  synced_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const loopOSExportInsertSchema = loopOSExportSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export const loopOSExportUpdateSchema = loopOSExportSchema
  .omit({
    id: true,
    user_id: true,
    created_at: true,
  })
  .partial()

// Node execution schemas
export const loopOSNodeExecutionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  node_id: z.string().uuid(),
  started_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  duration_seconds: z.number().int().nullable(),
  status: executionStatusSchema,
  notes: z.string().nullable(),
  momentum_gained: z.number().int().default(0),
  metadata: z.record(z.any()).default({}),
  created_at: z.string(),
})

export const loopOSNodeExecutionInsertSchema = loopOSNodeExecutionSchema.omit({
  id: true,
  created_at: true,
})

// Loop template schemas
export const loopOSLoopTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().min(1),
  category: z.string(),
  is_public: z.boolean().default(true),
  created_by: z.string().uuid().nullable(),
  template_data: z.record(z.any()),
  use_count: z.number().int().default(0),
  created_at: z.string(),
  updated_at: z.string(),
})

export const loopOSLoopTemplateInsertSchema = loopOSLoopTemplateSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  use_count: true,
})

export const loopOSLoopTemplateUpdateSchema = loopOSLoopTemplateSchema
  .omit({
    id: true,
    created_at: true,
    use_count: true,
  })
  .partial()
