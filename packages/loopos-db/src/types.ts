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

// Phase 5 Schemas
export const CreativePackSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1),
  pack_type: z.enum([
    'release',
    'promo',
    'audience-growth',
    'creative-sprint',
    'social-accelerator',
    'press-pr',
    'tiktok-momentum',
  ]),
  description: z.string().optional(),
  is_template: z.boolean().default(false),
  is_public: z.boolean().default(false),
  nodes: z.array(z.unknown()).default([]),
  sequences: z.array(z.unknown()).default([]),
  notes: z.array(z.unknown()).default([]),
  micro_actions: z.array(z.unknown()).default([]),
  insights: z.array(z.unknown()).default([]),
  ai_prompts: z.record(z.unknown()).default({}),
  metadata: z.record(z.unknown()).default({}),
  created_at: z.string(),
  updated_at: z.string(),
})

export const PlaybookChapterSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1),
  category: z.enum([
    'release-strategy',
    'promo-strategy',
    'growth-strategy',
    'pr-strategy',
    'social-strategy',
    'audience-strategy',
    'creative-process',
    'custom',
  ]),
  content: z.string(),
  is_ai_generated: z.boolean().default(false),
  is_favourite: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  related_nodes: z.array(z.string().uuid()).default([]),
  metadata: z.record(z.unknown()).default({}),
  created_at: z.string(),
  updated_at: z.string(),
})

export const MoodboardSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  colour_palette: z.array(z.unknown()).default([]),
  tags: z.array(z.string()).default([]),
  ai_summary: z.string().optional(),
  is_archived: z.boolean().default(false),
  created_at: z.string(),
  updated_at: z.string(),
})

export const MoodboardItemSchema = z.object({
  id: z.string().uuid(),
  moodboard_id: z.string().uuid(),
  user_id: z.string().uuid(),
  item_type: z.enum(['image', 'colour', 'text', 'link']),
  image_url: z.string().optional(),
  storage_path: z.string().optional(),
  colour_hex: z.string().optional(),
  text_content: z.string().optional(),
  external_url: z.string().optional(),
  tags: z.array(z.string()).default([]),
  position: z.record(z.unknown()).default({}),
  metadata: z.record(z.unknown()).default({}),
  created_at: z.string(),
})

export const FlowSessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  started_at: z.string(),
  ended_at: z.string().optional(),
  duration_seconds: z.number().optional(),
  engagement_score: z.number().min(0).max(100).optional(),
  deep_work_detected: z.boolean().default(false),
  interruptions: z.number().default(0),
  nodes_worked_on: z.array(z.string().uuid()).default([]),
  peak_flow_time: z.string().optional(),
  metadata: z.record(z.unknown()).default({}),
  created_at: z.string(),
})

export const AutoChainSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  chain_type: z.enum(['predicted-sequence', 'dependency-chain', 'campaign-timeline', 'custom']),
  nodes: z.array(z.string().uuid()).default([]),
  auto_generated: z.boolean().default(false),
  confidence_score: z.number().min(0).max(100).optional(),
  metadata: z.record(z.unknown()).default({}),
  created_at: z.string(),
  updated_at: z.string(),
})

export type DbNode = z.infer<typeof NodeSchema>
export type DbJournalEntry = z.infer<typeof JournalEntrySchema>
export type DbOrchestration = z.infer<typeof OrchestrationSchema>
export type DbCreativePack = z.infer<typeof CreativePackSchema>
export type DbPlaybookChapter = z.infer<typeof PlaybookChapterSchema>
export type DbMoodboard = z.infer<typeof MoodboardSchema>
export type DbMoodboardItem = z.infer<typeof MoodboardItemSchema>
export type DbFlowSession = z.infer<typeof FlowSessionSchema>
export type DbAutoChain = z.infer<typeof AutoChainSchema>
