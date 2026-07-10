import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/requireAuth'
import { labelDb } from '@/lib/label/db'
import { updateContactSchema } from '@/lib/label/schemas'
import type { ContactRow } from '@/lib/label/types'
import { logger } from '@/lib/logger'

const log = logger.scope('LabelContactRoute')

type Params = { params: Promise<{ id: string }> }

/** PATCH /api/label/contacts/[id] */
export async function PATCH(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response
  const { id } = await params
  const db = labelDb(auth.supabase)

  const parsed = updateContactSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.format() },
      { status: 400 }
    )
  }

  const d = parsed.data
  const updates: Record<string, unknown> = {}
  if (d.name !== undefined) updates.name = d.name
  if (d.outlet !== undefined) updates.outlet = d.outlet
  if (d.type !== undefined) updates.type = d.type
  if (d.email !== undefined) updates.email = d.email
  if (d.tags !== undefined) updates.tags = d.tags
  if (d.notes !== undefined) updates.notes = d.notes
  if (d.lastContacted !== undefined) updates.last_contacted = d.lastContacted

  const { data, error } = await db.contacts().update(updates).eq('id', id).select().maybeSingle()

  if (error) {
    log.error('Failed to update contact', error)
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
  }

  return NextResponse.json({ data: data as ContactRow })
}

/** DELETE /api/label/contacts/[id] */
export async function DELETE(_request: NextRequest, { params }: Params): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response
  const { id } = await params
  const db = labelDb(auth.supabase)

  const { error, count } = await db.contacts().delete({ count: 'exact' }).eq('id', id)

  if (error) {
    log.error('Failed to delete contact', error)
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 })
  }
  if (!count) {
    return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
  }

  return NextResponse.json({ data: null })
}
