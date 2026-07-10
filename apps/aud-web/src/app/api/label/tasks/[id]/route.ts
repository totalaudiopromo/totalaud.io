import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/requireAuth'
import { labelDb } from '@/lib/label/db'
import { updateTaskSchema } from '@/lib/label/schemas'
import type { ReleaseTaskRow } from '@/lib/label/types'
import { logger } from '@/lib/logger'

const log = logger.scope('LabelTaskRoute')

type Params = { params: Promise<{ id: string }> }

/** PATCH /api/label/tasks/[id] — toggling completed sets/clears completed_at. */
export async function PATCH(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response
  const { id } = await params
  const db = labelDb(auth.supabase)

  const parsed = updateTaskSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.format() },
      { status: 400 }
    )
  }

  const d = parsed.data
  const updates: Record<string, unknown> = {}
  if (d.title !== undefined) updates.title = d.title
  if (d.description !== undefined) updates.description = d.description
  if (d.dueDate !== undefined) updates.due_date = d.dueDate
  if (d.completed !== undefined) {
    updates.completed = d.completed
    updates.completed_at = d.completed ? new Date().toISOString() : null
  }

  const { data, error } = await db.tasks().update(updates).eq('id', id).select().maybeSingle()

  if (error) {
    log.error('Failed to update task', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  return NextResponse.json({ data: data as ReleaseTaskRow })
}

/** DELETE /api/label/tasks/[id] */
export async function DELETE(_request: NextRequest, { params }: Params): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response
  const { id } = await params
  const db = labelDb(auth.supabase)

  const { error, count } = await db.tasks().delete({ count: 'exact' }).eq('id', id)

  if (error) {
    log.error('Failed to delete task', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
  if (!count) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  return NextResponse.json({ data: null })
}
