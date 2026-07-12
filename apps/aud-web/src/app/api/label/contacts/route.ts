import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/requireAuth'
import { labelDb } from '@/lib/label/db'
import { createContactSchema } from '@/lib/label/schemas'
import type { ContactRow } from '@/lib/label/types'
import { logger } from '@/lib/logger'

const log = logger.scope('LabelContactsRoute')

/** GET /api/label/contacts?labelId=&type=&q= */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response
  const db = labelDb(auth.supabase)

  const labelId = request.nextUrl.searchParams.get('labelId')
  const type = request.nextUrl.searchParams.get('type')
  const q = request.nextUrl.searchParams.get('q')
  if (!labelId) {
    return NextResponse.json({ error: 'labelId is required' }, { status: 400 })
  }

  let query = db
    .contacts()
    .select('*')
    .eq('label_id', labelId)
    .order('name', { ascending: true })
    .limit(500)

  if (type) query = query.eq('type', type)
  if (q) query = query.or(`name.ilike.%${q}%,outlet.ilike.%${q}%`)

  const { data, error } = await query

  if (error) {
    log.error('Failed to load contacts', error)
    return NextResponse.json({ error: 'Failed to load contacts' }, { status: 500 })
  }

  return NextResponse.json({ data: (data ?? []) as ContactRow[] })
}

/** POST /api/label/contacts */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response
  const db = labelDb(auth.supabase)

  const parsed = createContactSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.format() },
      { status: 400 }
    )
  }

  const d = parsed.data
  const { data, error } = await db
    .contacts()
    .insert({
      label_id: d.labelId,
      name: d.name,
      outlet: d.outlet ?? null,
      type: d.type ?? null,
      email: d.email ?? null,
      tags: d.tags ?? [],
      notes: d.notes ?? null,
      last_contacted: d.lastContacted ?? null,
    })
    .select()
    .maybeSingle()

  if (error || !data) {
    log.error('Failed to create contact', error)
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
  }

  return NextResponse.json({ data: data as ContactRow }, { status: 201 })
}
