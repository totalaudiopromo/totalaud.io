import { z } from 'zod'

/**
 * Note category enum - different types of creative notes
 */
export const NoteCategorySchema = z.enum([
  'idea',
  'task',
  'insight',
  'blocker',
  'win',
])
export type NoteCategory = z.infer<typeof NoteCategorySchema>

/**
 * Full note schema - matches database structure
 */
export const NoteSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  category: NoteCategorySchema,
  title: z.string().min(1, 'Title is required'),
  body: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type Note = z.infer<typeof NoteSchema>

/**
 * Schema for creating a new note
 */
export const CreateNoteSchema = z.object({
  category: NoteCategorySchema,
  title: z.string().min(1, 'Title is required'),
  body: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
})

export type CreateNote = z.infer<typeof CreateNoteSchema>

/**
 * Schema for updating a note
 */
export const UpdateNoteSchema = z.object({
  category: NoteCategorySchema.optional(),
  title: z.string().min(1).optional(),
  body: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).optional(),
})

export type UpdateNote = z.infer<typeof UpdateNoteSchema>
