/**
 * Console Integration API (Stub)
 * Future endpoint for syncing LoopOS tasks to Console
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { ConsoleExportPayload } from '@/lib/exportToConsole'

const exportPayloadSchema = z.object({
  type: z.enum(['promotion', 'analysis', 'planning', 'creative']),
  content: z.string().min(1),
  metadata: z.object({
    source: z.literal('loopos'),
    source_id: z.string().uuid(),
    source_type: z.enum(['node', 'note', 'sequence', 'daily_action']),
    title: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
  suggested_date: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    // Parse and validate payload
    const body = await req.json()
    const validation = exportPayloadSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid export payload',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const payload: ConsoleExportPayload = validation.data

    // Store export in loopos_exports table
    const { data: exportRecord, error: insertError } = await supabase
      .from('loopos_exports')
      .insert({
        user_id: user.id,
        source_type: payload.metadata.source_type,
        source_id: payload.metadata.source_id,
        export_type: payload.type,
        content: payload.content,
        metadata: payload.metadata,
        suggested_date: payload.suggested_date || null,
        status: 'pending', // Will be 'synced' when Console integration is live
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to create export:', insertError)
      return NextResponse.json(
        { error: 'Failed to create export' },
        { status: 500 }
      )
    }

    // TODO: When Console integration is ready, POST to Console API here
    // For now, this is a stub that saves locally

    return NextResponse.json(
      {
        success: true,
        export_id: exportRecord.id,
        status: 'pending',
        message: 'Export saved. Console integration coming soon.',
      },
      { status: 202 } // 202 Accepted
    )
  } catch (error) {
    console.error('Console export error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET: List all exports for current user
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { data: exports, error } = await supabase
      .from('loopos_exports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch exports:', error)
      return NextResponse.json(
        { error: 'Failed to fetch exports' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      exports,
      count: exports.length,
    })
  } catch (error) {
    console.error('Console exports list error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
