/**
 * Memory Extraction API
 * Triggers semantic memory extraction from different content types
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  extractFromJournal,
  extractFromCoach,
  extractFromTimeline,
  extractFromDesigner,
  extractFromPack,
  extractFromMoodboard,
  extractFromUsage,
} from '@/lib/memory/extraction'

// =====================================================
// SCHEMAS
// =====================================================

const ExtractJournalSchema = z.object({
  sourceType: z.literal('journal'),
  workspaceId: z.string().uuid(),
  entryId: z.string().uuid(),
  content: z.string(),
})

const ExtractCoachSchema = z.object({
  sourceType: z.literal('coach'),
  workspaceId: z.string().uuid(),
  conversationId: z.string().uuid(),
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ),
})

const ExtractTimelineSchema = z.object({
  sourceType: z.literal('timeline'),
  workspaceId: z.string().uuid(),
  milestoneId: z.string().uuid(),
  title: z.string(),
  description: z.string().optional(),
})

const ExtractDesignerSchema = z.object({
  sourceType: z.literal('designer'),
  workspaceId: z.string().uuid(),
  sceneId: z.string().uuid(),
  prompt: z.string(),
  nodes: z.array(
    z.object({
      type: z.string(),
      data: z.object({
        label: z.string().optional(),
        content: z.string().optional(),
      }),
    })
  ),
})

const ExtractPackSchema = z.object({
  sourceType: z.literal('pack'),
  workspaceId: z.string().uuid(),
  packId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

const ExtractMoodboardSchema = z.object({
  sourceType: z.literal('moodboard'),
  workspaceId: z.string().uuid(),
  moodboardId: z.string().uuid(),
  title: z.string(),
  images: z.array(
    z.object({
      caption: z.string().optional(),
      tags: z.array(z.string()).optional(),
    })
  ),
})

const ExtractUsageSchema = z.object({
  sourceType: z.literal('usage'),
  workspaceId: z.string().uuid(),
  summary: z.object({
    topFeatures: z.array(z.string()),
    activityPattern: z.string(),
    focusAreas: z.array(z.string()),
  }),
})

const ExtractRequestSchema = z.discriminatedUnion('sourceType', [
  ExtractJournalSchema,
  ExtractCoachSchema,
  ExtractTimelineSchema,
  ExtractDesignerSchema,
  ExtractPackSchema,
  ExtractMoodboardSchema,
  ExtractUsageSchema,
])

// =====================================================
// POST /api/memory/extract
// =====================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const request = ExtractRequestSchema.parse(body)

    let result

    switch (request.sourceType) {
      case 'journal':
        result = await extractFromJournal(request.workspaceId, request.entryId, request.content)
        break

      case 'coach':
        result = await extractFromCoach(
          request.workspaceId,
          request.conversationId,
          request.messages
        )
        break

      case 'timeline':
        result = await extractFromTimeline(
          request.workspaceId,
          request.milestoneId,
          request.title,
          request.description
        )
        break

      case 'designer':
        result = await extractFromDesigner(
          request.workspaceId,
          request.sceneId,
          request.prompt,
          request.nodes
        )
        break

      case 'pack':
        result = await extractFromPack(
          request.workspaceId,
          request.packId,
          request.name,
          request.description,
          request.tags
        )
        break

      case 'moodboard':
        result = await extractFromMoodboard(
          request.workspaceId,
          request.moodboardId,
          request.title,
          request.images
        )
        break

      case 'usage':
        result = await extractFromUsage(request.workspaceId, request.summary)
        break
    }

    return NextResponse.json({
      success: true,
      extracted: {
        nodeCount: result.nodes.length,
        edgeCount: result.edges.length,
      },
    })
  } catch (error) {
    console.error('Memory extraction failed:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Extraction failed' }, { status: 500 })
  }
}
