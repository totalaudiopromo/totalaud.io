import { supabase } from '@total-audio/core-supabase'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@total-audio/core-logger'

const log = logger.scope('FlowsDetailAPI')

// Validate UUID param
const paramsSchema = z.object({
  id: z.string().uuid('Flow ID must be a valid UUID'),
})

// GET /api/flows/[id] - Get a specific flow session
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const { id } = paramsSchema.parse(resolvedParams)

    log.debug('Fetching flow details', { flowId: id })

    const { data, error } = await supabase
      .from('agent_sessions')
      .select('*, agent_session_steps(*)')
      .eq('id', id)
      .single()

    if (error) throw error

    log.info('Flow details fetched', { flowId: id, stepCount: data.agent_session_steps?.length || 0 })

    return NextResponse.json({ flow: data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      log.warn('Invalid flow ID format', { error: error.errors })
      return NextResponse.json(
        { error: 'Invalid flow ID format', details: error.errors },
        { status: 400 }
      )
    }
    log.error('Failed to fetch flow', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Schema for flow updates
const flowUpdateSchema = z.object({
  status: z.enum(['pending', 'running', 'complete', 'error']).optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  metadata: z.record(z.unknown()).optional(),
})

// PATCH /api/flows/[id] - Update flow session
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json()
    const updates = flowUpdateSchema.parse(body)
    const resolvedParams = await params
    const { id } = paramsSchema.parse(resolvedParams)

    log.info('Updating flow', { flowId: id, updates })

    const { data, error } = await supabase
      .from('agent_sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    log.info('Flow updated successfully', { flowId: id })

    return NextResponse.json({ flow: data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      log.warn('Invalid flow update data', { error: error.errors })
      return NextResponse.json(
        { error: 'Invalid update data', details: error.errors },
        { status: 400 }
      )
    }
    log.error('Failed to update flow', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE /api/flows/[id] - Delete a flow session
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const { id } = paramsSchema.parse(resolvedParams)

    log.info('Deleting flow', { flowId: id })

    const { error } = await supabase.from('agent_sessions').delete().eq('id', id)

    if (error) throw error

    log.info('Flow deleted successfully', { flowId: id })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      log.warn('Invalid flow ID format for delete', { error: error.errors })
      return NextResponse.json(
        { error: 'Invalid flow ID format', details: error.errors },
        { status: 400 }
      )
    }
    log.error('Failed to delete flow', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
