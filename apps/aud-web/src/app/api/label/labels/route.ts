import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/requireAuth'
import { labelDb } from '@/lib/label/db'
import { createLabelSchema } from '@/lib/label/schemas'
import type { LabelMemberRow, LabelRow, LabelWithRole } from '@/lib/label/types'
import { logger } from '@/lib/logger'

const log = logger.scope('LabelsRoute')

/** GET /api/label/labels — labels the current user belongs to, with role. */
export async function GET(): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response
  const db = labelDb(auth.supabase)

  const { data: memberships, error: membersError } = await db
    .members()
    .select('label_id, role')
    .eq('user_id', auth.user.id)
    .limit(50)

  if (membersError) {
    log.error('Failed to load memberships', membersError)
    return NextResponse.json({ error: 'Failed to load labels' }, { status: 500 })
  }

  const rows = (memberships ?? []) as Pick<LabelMemberRow, 'label_id' | 'role'>[]
  if (rows.length === 0) {
    return NextResponse.json({ data: [] })
  }

  const { data: labels, error: labelsError } = await db
    .labels()
    .select('*')
    .in(
      'id',
      rows.map((m) => m.label_id)
    )
    .order('created_at', { ascending: true })
    .limit(50)

  if (labelsError) {
    log.error('Failed to load labels', labelsError)
    return NextResponse.json({ error: 'Failed to load labels' }, { status: 500 })
  }

  const roleByLabel = new Map(rows.map((m) => [m.label_id, m.role]))
  const data: LabelWithRole[] = ((labels ?? []) as LabelRow[]).map((label) => ({
    ...label,
    member_role: roleByLabel.get(label.id) ?? 'member',
  }))

  return NextResponse.json({ data })
}

/** POST /api/label/labels — create a label (atomic label + owner membership). */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response
  const db = labelDb(auth.supabase)

  const parsed = createLabelSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.format() },
      { status: 400 }
    )
  }

  const { name, slug, description } = parsed.data
  const { data, error } = await db.rpc('create_label', {
    p_name: name,
    p_slug: slug,
    p_description: description ?? null,
  })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'That slug is already taken' }, { status: 409 })
    }
    log.error('Failed to create label', error)
    return NextResponse.json({ error: 'Failed to create label' }, { status: 500 })
  }

  const label = data as LabelRow
  const withRole: LabelWithRole = { ...label, member_role: 'owner' }
  return NextResponse.json({ data: withRole }, { status: 201 })
}
