import { z } from 'zod'

/**
 * Node type enum - represents the four phases of the creative loop
 */
export const NodeTypeSchema = z.enum(['create', 'promote', 'analyse', 'refine'])
export type NodeType = z.infer<typeof NodeTypeSchema>

/**
 * Node status enum - lifecycle of a node
 */
export const NodeStatusSchema = z.enum(['upcoming', 'active', 'completed'])
export type NodeStatus = z.infer<typeof NodeStatusSchema>

/**
 * Full node schema - matches database structure
 */
export const NodeSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: NodeTypeSchema,
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullable().optional(),
  friction: z.number().int().min(0).max(10),
  priority: z.number().int().min(0).max(10),
  status: NodeStatusSchema,
  position_x: z.number(),
  position_y: z.number(),
  metadata: z.record(z.unknown()).optional(),
  last_triggered: z.string().datetime().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type Node = z.infer<typeof NodeSchema>

/**
 * Schema for creating a new node (subset of fields)
 */
export const CreateNodeSchema = z.object({
  type: NodeTypeSchema,
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  friction: z.number().int().min(0).max(10).default(5),
  priority: z.number().int().min(0).max(10).default(5),
  status: NodeStatusSchema.default('upcoming'),
  position_x: z.number().default(0),
  position_y: z.number().default(0),
  metadata: z.record(z.unknown()).optional(),
})

export type CreateNode = z.infer<typeof CreateNodeSchema>

/**
 * Schema for updating a node (all fields optional except type safety)
 */
export const UpdateNodeSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  friction: z.number().int().min(0).max(10).optional(),
  priority: z.number().int().min(0).max(10).optional(),
  status: NodeStatusSchema.optional(),
  position_x: z.number().optional(),
  position_y: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
  last_triggered: z.string().datetime().nullable().optional(),
})

export type UpdateNode = z.infer<typeof UpdateNodeSchema>
