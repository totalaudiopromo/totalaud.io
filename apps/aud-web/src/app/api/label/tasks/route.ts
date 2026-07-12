import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/requireAuth'
import { labelDb } from '@/lib/label/db'
import { createTaskSchema } from '@/lib/label/schemas'
import type { ReleaseTaskRow } from '@/lib/label/types'
import { logger } from '@/lib/logger'

const log = logger.scope('LabelTasksRoute')

/** GET /api/label/tasks?labelId=&releaseId=&overdue=true */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response
  const db = labelDb(auth.supabase)

  const labelId = request.nextUrl.searchParams.get('labelId')
  const releaseId = request.nextUrl.searchParams.get('releaseId')
  const overdue = request.nextUrl.searchParams.get('overdue') === 'true'
  if (!labelId) {
    return NextResponse.json({ error: 'labelId is required' }, { status: 400 })
  }

  let query = db
    .tasks()
    .select('*')
    .eq('label_id', labelId)
    .order('due_date', { ascending: true, nullsFirst: false })
    .limit(500)

  if (releaseId) query = query.eq('release_id', releaseId)
  if (overdue) {
    const today = new Date().toISOString().slice(0, 10)
    query = query.eq('completed', false).lt('due_date', today)
  }

  const { data, error } = await query

  if (error) {
    log.error('Failed to load tasks', error)
    return NextResponse.json({ error: 'Failed to load tasks' }, { status: 500 })
  }

  return NextResponse.json({ data: (data ?? []) as ReleaseTaskRow[] })
}

/** POST /api/label/tasks */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response
  const db = labelDb(auth.supabase)

  const parsed = createTaskSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.format() },
      { status: 400 }
    )
  }

  const d = parsed.data
  const { data, error } = await db
    .tasks()
    .insert({
      label_id: d.labelId,
      release_id: d.releaseId,
      title: d.title,
      description: d.description ?? null,
      due_date: d.dueDate ?? null,
    })
    .select()
    .maybeSingle()

  if (error || !data) {
    log.error('Failed to create task', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }

  return NextResponse.json({ data: data as ReleaseTaskRow }, { status: 201 })
}
