import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/requireAuth'
import { labelDb } from '@/lib/label/db'
import { updateLabelSchema } from '@/lib/label/schemas'
import type { LabelRow } from '@/lib/label/types'
import { logger } from '@/lib/logger'

const log = logger.scope('LabelRoute')

type Params = { params: Promise<{ id: string }> }

/** GET /api/label/labels/[id] */
export async function GET(_request: NextRequest, { params }: Params): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response
  const { id } = await params
  const db = labelDb(auth.supabase)

  const { data, error } = await db.labels().select('*').eq('id', id).maybeSingle()

  if (error) {
    log.error('Failed to load label', error)
    return NextResponse.json({ error: 'Failed to load label' }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Label not found' }, { status: 404 })
  }

  return NextResponse.json({ data: data as LabelRow })
}

/** PATCH /api/label/labels/[id] — owner/manager only (enforced by RLS). */
export async function PATCH(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response
  const { id } = await params
  const db = labelDb(auth.supabase)

  const parsed = updateLabelSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.format() },
      { status: 400 }
    )
  }

  const updates: Record<string, unknown> = {}
  if (parsed.data.name !== undefined) updates.name = parsed.data.name
  if (parsed.data.description !== undefined) updates.description = parsed.data.description
  if (parsed.data.website !== undefined) updates.website = parsed.data.website

  const { data, error } = await db.labels().update(updates).eq('id', id).select().maybeSingle()

  if (error) {
    log.error('Failed to update label', error)
    return NextResponse.json({ error: 'Failed to update label' }, { status: 500 })
  }
  if (!data) {
    // RLS blocked the update (not a member with sufficient role) or missing row
    return NextResponse.json({ error: 'Label not found' }, { status: 404 })
  }

  return NextResponse.json({ data: data as LabelRow })
}
