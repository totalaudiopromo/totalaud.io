import { z } from 'zod'

/**
 * Full momentum schema - matches database structure
 */
export const MomentumSchema = z.object({
  user_id: z.string().uuid(),
  momentum: z.number().int().min(0).max(100),
  streak: z.number().int().min(0),
  last_gain: z.string().datetime().nullable().optional(),
  last_reset: z.string().datetime().nullable().optional(),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type Momentum = z.infer<typeof MomentumSchema>

/**
 * Schema for updating momentum
 */
export const UpdateMomentumSchema = z.object({
  momentum: z.number().int().min(0).max(100).optional(),
  streak: z.number().int().min(0).optional(),
  last_gain: z.string().datetime().nullable().optional(),
  last_reset: z.string().datetime().nullable().optional(),
  metadata: z.record(z.unknown()).optional(),
})

export type UpdateMomentum = z.infer<typeof UpdateMomentumSchema>
