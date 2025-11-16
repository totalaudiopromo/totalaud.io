/**
 * Memory Snapshots API
 * Create and list artist identity snapshots
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { memoryDb } from '@total-audio/loopos-db'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// =====================================================
// GET /api/memory/snapshots?workspaceId=xxx
// =====================================================

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })
    }

    const snapshots = await memoryDb.snapshots.list(workspaceId)

    return NextResponse.json({
      success: true,
      snapshots,
      count: snapshots.length,
    })
  } catch (error) {
    console.error('Failed to list snapshots:', error)
    return NextResponse.json({ error: 'Failed to list snapshots' }, { status: 500 })
  }
}

// =====================================================
// POST /api/memory/snapshots
// =====================================================

const CreateSnapshotSchema = z.object({
  workspaceId: z.string().uuid(),
  snapshotType: z.enum(['auto', 'manual']).default('manual'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { workspaceId, snapshotType } = CreateSnapshotSchema.parse(body)

    // Get current artist identity
    const identity = await memoryDb.identity.get(workspaceId)

    // Generate AI summary of current state
    const summary = await generateSnapshotSummary(identity)

    // Calculate stats
    const stats = {
      node_count: identity.node_count || 0,
      edge_count: identity.edge_count || 0,
      top_themes: identity.themes?.slice(0, 3).map((t) => t.label) || [],
      dominant_tone: identity.tones?.[0]?.label || 'unknown',
      core_values: identity.values?.slice(0, 3).map((v) => v.label) || [],
    }

    // Create snapshot
    const snapshotId = await memoryDb.snapshots.create(workspaceId, summary, stats, snapshotType)

    return NextResponse.json({
      success: true,
      snapshotId,
      summary,
      stats,
    })
  } catch (error) {
    console.error('Failed to create snapshot:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Failed to create snapshot' }, { status: 500 })
  }
}

// =====================================================
// HELPERS
// =====================================================

async function generateSnapshotSummary(identity: any): Promise<string> {
  const systemPrompt = `You are an AI that generates concise "Artist Identity" snapshots.
Given a collection of themes, tones, values, and visual motifs, write a 2-3 sentence summary describing the artist's current creative identity.

Use British English. Be specific and insightful.`

  const userPrompt = `Generate an artist identity snapshot based on this data:

Themes: ${identity.themes?.map((t: any) => t.label).join(', ') || 'none'}
Tones: ${identity.tones?.map((t: any) => t.label).join(', ') || 'none'}
Values: ${identity.values?.map((v: any) => v.label).join(', ') || 'none'}
Visual Motifs: ${identity.visual_motifs?.map((v: any) => v.label).join(', ') || 'none'}

Write a concise 2-3 sentence artist identity summary.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const textContent = response.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return 'No snapshot summary available.'
    }

    return textContent.text.trim()
  } catch (error) {
    console.error('Failed to generate snapshot summary:', error)
    return 'Artist identity snapshot - AI summary unavailable.'
  }
}
