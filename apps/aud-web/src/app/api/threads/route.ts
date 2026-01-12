/**
 * Signal Threads API Route
 * Phase 2: CRUD operations for timeline story arcs
 *
 * Endpoints:
 * - GET: List all threads for the authenticated user
 * - POST: Create a new thread
 * - PATCH: Update an existing thread
 * - DELETE: Remove a thread
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { createRouteSupabaseClient } from '@aud-web/lib/supabase/server'
import type { SignalThreadRow } from '@/types/signal-thread'
import { transformThreadRow } from '@/types/signal-thread'

const log = logger.scope('ThreadsAPI')

// ============ Validation Schemas ============

const threadTypeSchema = z.enum(['narrative', 'campaign', 'creative', 'scene', 'performance'])

const createThreadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  threadType: threadTypeSchema,
  colour: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex colour')
    .optional(),
  eventIds: z.array(z.string().uuid()).optional(),
})

const updateThreadSchema = z.object({
  id: z.string().uuid('Invalid thread ID'),
  title: z.string().min(1).max(100).optional(),
  threadType: threadTypeSchema.optional(),
  colour: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  eventIds: z.array(z.string().uuid()).optional(),
  narrativeSummary: z.string().max(2000).nullable().optional(),
  insights: z.array(z.string()).optional(),
})

const deleteThreadSchema = z.object({
  id: z.string().uuid('Invalid thread ID'),
})

// ============ GET: List Threads ============

export async function GET() {
  try {
    const supabase = await createRouteSupabaseClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      log.error('Failed to verify session', sessionError)
      return NextResponse.json(
        { success: false, error: 'Failed to verify authentication' },
        { status: 500 }
      )
    }

    if (!session) {
      log.warn('Unauthenticated request to list threads')
      return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 })
    }

    // Fetch all threads for user
    // Type assertion needed until Supabase types are regenerated to include signal_threads
    const threadsResult = await (supabase as any)
      .from('signal_threads')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    const threads = threadsResult.data as SignalThreadRow[] | null
    const fetchError = threadsResult.error

    if (fetchError) {
      log.error('Failed to fetch threads', fetchError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch threads' },
        { status: 500 }
      )
    }

    log.info('Fetched threads', { userId: session.user.id, count: threads?.length || 0 })

    // Transform to camelCase for frontend
    const transformedThreads = (threads || []).map(transformThreadRow)

    return NextResponse.json({ success: true, data: transformedThreads })
  } catch (error) {
    log.error('Error listing threads', error)
    return NextResponse.json({ success: false, error: 'Failed to list threads' }, { status: 500 })
  }
}

// ============ POST: Create Thread ============

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteSupabaseClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      log.error('Failed to verify session', sessionError)
      return NextResponse.json(
        { success: false, error: 'Failed to verify authentication' },
        { status: 500 }
      )
    }

    if (!session) {
      log.warn('Unauthenticated request to create thread')
      return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 })
    }

    // Parse and validate body
    const body = await request.json()
    const validation = createThreadSchema.safeParse(body)

    if (!validation.success) {
      log.warn('Invalid thread creation request', { errors: validation.error.errors })
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { title, threadType, colour, eventIds } = validation.data

    // Insert thread
    // Type assertion needed until Supabase types are regenerated to include signal_threads
    const insertResult = await (supabase as any)
      .from('signal_threads')
      .insert({
        user_id: session.user.id,
        title,
        thread_type: threadType,
        colour: colour || '#3AA9BE',
        event_ids: eventIds || [],
      })
      .select()
      .single()

    const thread = insertResult.data as SignalThreadRow | null
    const insertError = insertResult.error

    if (insertError) {
      log.error('Failed to create thread', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to create thread' },
        { status: 500 }
      )
    }

    if (!thread) {
      log.error('Thread insert returned no data')
      return NextResponse.json(
        { success: false, error: 'Failed to create thread' },
        { status: 500 }
      )
    }

    // If eventIds provided, update those events to reference this thread
    if (eventIds && eventIds.length > 0) {
      const { error: updateError } = await supabase
        .from('user_timeline_events')
        .update({ thread_id: thread.id } as Record<string, unknown>)
        .in('id', eventIds)
        .eq('user_id', session.user.id)

      if (updateError) {
        log.warn('Failed to link events to thread', { error: updateError })
        // Don't fail the request, thread was created successfully
      }
    }

    log.info('Created thread', { threadId: thread.id, title, type: threadType })

    // Transform to camelCase
    const transformedThread = transformThreadRow(thread)

    return NextResponse.json({ success: true, data: transformedThread }, { status: 201 })
  } catch (error) {
    log.error('Error creating thread', error)
    return NextResponse.json({ success: false, error: 'Failed to create thread' }, { status: 500 })
  }
}

// ============ PATCH: Update Thread ============

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createRouteSupabaseClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      log.error('Failed to verify session', sessionError)
      return NextResponse.json(
        { success: false, error: 'Failed to verify authentication' },
        { status: 500 }
      )
    }

    if (!session) {
      log.warn('Unauthenticated request to update thread')
      return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 })
    }

    // Parse and validate body
    const body = await request.json()
    const validation = updateThreadSchema.safeParse(body)

    if (!validation.success) {
      log.warn('Invalid thread update request', { errors: validation.error.errors })
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { id, title, threadType, colour, eventIds, narrativeSummary, insights } = validation.data

    // Build update object
    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (threadType !== undefined) updateData.thread_type = threadType
    if (colour !== undefined) updateData.colour = colour
    if (eventIds !== undefined) updateData.event_ids = eventIds
    if (narrativeSummary !== undefined) updateData.narrative_summary = narrativeSummary
    if (insights !== undefined) updateData.insights = insights

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 })
    }

    // Update thread
    // Type assertion needed until Supabase types are regenerated to include signal_threads
    const updateResult = await (supabase as any)
      .from('signal_threads')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single()

    const thread = updateResult.data as SignalThreadRow | null
    const updateError = updateResult.error

    if (updateError) {
      log.error('Failed to update thread', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update thread' },
        { status: 500 }
      )
    }

    if (!thread) {
      return NextResponse.json({ success: false, error: 'Thread not found' }, { status: 404 })
    }

    // If eventIds changed, update event references atomically
    // Uses RPC function to prevent race conditions between clear and set operations
    if (eventIds !== undefined) {
      const rpcResult = await (supabase.rpc as any)('update_thread_events', {
        p_thread_id: id,
        p_user_id: session.user.id,
        p_event_ids: eventIds,
      })

      if (rpcResult.error) {
        log.warn('Failed to update thread-event links', { threadId: id, error: rpcResult.error })
        // Don't fail the request - thread update was successful
      }
    }

    log.info('Updated thread', { threadId: id })

    // Transform to camelCase
    const transformedThread = transformThreadRow(thread)

    return NextResponse.json({ success: true, data: transformedThread })
  } catch (error) {
    log.error('Error updating thread', error)
    return NextResponse.json({ success: false, error: 'Failed to update thread' }, { status: 500 })
  }
}

// ============ DELETE: Remove Thread ============

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createRouteSupabaseClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      log.error('Failed to verify session', sessionError)
      return NextResponse.json(
        { success: false, error: 'Failed to verify authentication' },
        { status: 500 }
      )
    }

    if (!session) {
      log.warn('Unauthenticated request to delete thread')
      return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 })
    }

    // Parse body for thread ID
    const body = await request.json()
    const validation = deleteThreadSchema.safeParse(body)

    if (!validation.success) {
      log.warn('Invalid thread delete request', { errors: validation.error.errors })
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { id } = validation.data

    // Delete thread (RLS ensures user can only delete their own)
    // Type assertion needed until Supabase types are regenerated to include signal_threads
    const { error: deleteError } = await (supabase as any)
      .from('signal_threads')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id)

    if (deleteError) {
      log.error('Failed to delete thread', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete thread' },
        { status: 500 }
      )
    }

    log.info('Deleted thread', { threadId: id })

    return NextResponse.json({ success: true, data: { id } })
  } catch (error) {
    log.error('Error deleting thread', error)
    return NextResponse.json({ success: false, error: 'Failed to delete thread' }, { status: 500 })
  }
}
