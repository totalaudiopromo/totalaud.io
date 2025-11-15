import { z } from 'zod'

/**
 * LoopOS Database Types
 *
 * All types use British English spelling and follow LoopOS conventions.
 */

// ========================================
// Node Types
// ========================================

export const NodeStatusSchema = z.enum(['pending', 'active', 'completed', 'archived'])
export type NodeStatus = z.infer<typeof NodeStatusSchema>

export const NodeSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullable(),
  status: NodeStatusSchema.default('pending'),
  position: z.object({ x: z.number(), y: z.number() }).nullable(),
  metadata: z.record(z.unknown()).default({}),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type Node = z.infer<typeof NodeSchema>

export const CreateNodeSchema = NodeSchema.omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true,
})

export type CreateNodeInput = z.infer<typeof CreateNodeSchema>

// ========================================
// Journal Entry Types
// ========================================

export const JournalEntrySchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  content: z.string().min(1, 'Content is required'),
  mood: z.enum(['inspired', 'focused', 'uncertain', 'frustrated', 'accomplished']).nullable(),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).default({}),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type JournalEntry = z.infer<typeof JournalEntrySchema>

export const CreateJournalEntrySchema = JournalEntrySchema.omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true,
})

export type CreateJournalEntryInput = z.infer<typeof CreateJournalEntrySchema>

// ========================================
// Momentum Session Types
// ========================================

export const MomentumSessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  started_at: z.string().datetime(),
  ended_at: z.string().datetime().nullable(),
  flow_score: z.number().min(0).max(100).nullable(),
  actions_completed: z.number().default(0),
  notes: z.string().nullable(),
  metadata: z.record(z.unknown()).default({}),
  created_at: z.string().datetime(),
})

export type MomentumSession = z.infer<typeof MomentumSessionSchema>

export const CreateMomentumSessionSchema = MomentumSessionSchema.omit({
  id: true,
  user_id: true,
  created_at: true,
})

export type CreateMomentumSessionInput = z.infer<typeof CreateMomentumSessionSchema>

// ========================================
// Creative Pack Types
// ========================================

export const CreativePackSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullable(),
  category: z.enum(['radio-promo', 'release-campaign', 'tour-support', 'playlist-push', 'custom']),
  template_nodes: z.array(z.unknown()).default([]),
  is_public: z.boolean().default(false),
  author_id: z.string().uuid().nullable(),
  usage_count: z.number().default(0),
  metadata: z.record(z.unknown()).default({}),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type CreativePack = z.infer<typeof CreativePackSchema>

export const CreateCreativePackSchema = CreativePackSchema.omit({
  id: true,
  usage_count: true,
  created_at: true,
  updated_at: true,
})

export type CreateCreativePackInput = z.infer<typeof CreateCreativePackSchema>

// ========================================
// Playbook Chapter Types
// ========================================

export const PlaybookChapterSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  content: z.string(),
  order_index: z.number().default(0),
  is_completed: z.boolean().default(false),
  metadata: z.record(z.unknown()).default({}),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type PlaybookChapter = z.infer<typeof PlaybookChapterSchema>

export const CreatePlaybookChapterSchema = PlaybookChapterSchema.omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true,
})

export type CreatePlaybookChapterInput = z.infer<typeof CreatePlaybookChapterSchema>

// ========================================
// Moodboard Item Types
// ========================================

export const MoodboardItemSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: z.enum(['image', 'link', 'text', 'colour']),
  content: z.string().min(1, 'Content is required'),
  title: z.string().nullable(),
  position: z.object({ x: z.number(), y: z.number() }).nullable(),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).default({}),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type MoodboardItem = z.infer<typeof MoodboardItemSchema>

export const CreateMoodboardItemSchema = MoodboardItemSchema.omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true,
})

export type CreateMoodboardItemInput = z.infer<typeof CreateMoodboardItemSchema>

// ========================================
// Agent Execution Types
// ========================================

export const AgentExecutionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  skill_id: z.string(),
  input: z.record(z.unknown()),
  output: z.record(z.unknown()).nullable(),
  success: z.boolean(),
  error: z.string().nullable(),
  duration_ms: z.number().nullable(),
  created_at: z.string().datetime(),
})

export type AgentExecution = z.infer<typeof AgentExecutionSchema>

export const CreateAgentExecutionSchema = AgentExecutionSchema.omit({
  id: true,
  user_id: true,
  created_at: true,
})

export type CreateAgentExecutionInput = z.infer<typeof CreateAgentExecutionSchema>

// ========================================
// Note Types
// ========================================

export const NoteSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  node_id: z.string().uuid().nullable(),
  content: z.string().min(1, 'Content is required'),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).default({}),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type Note = z.infer<typeof NoteSchema>

export const CreateNoteSchema = NoteSchema.omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true,
})

export type CreateNoteInput = z.infer<typeof CreateNoteSchema>
