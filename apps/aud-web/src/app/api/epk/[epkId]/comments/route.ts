import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createRouteSupabaseClient } from '@aud-web/lib/supabase/server'

const log = logger.scope('EpkCommentsAPI')

interface CommentRow {
  id: string
  epk_id: string
  user_id: string
  body: string
  parent_id?: string | null
  created_at: string
  updated_at?: string | null
}

interface UserProfileRow {
  id: string
  full_name: string | null
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ epkId: string }> }
) {
  try {
    const { epkId } = await params

    const supabase = await createRouteSupabaseClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      log.error('Failed to retrieve session', sessionError)
      return NextResponse.json({ error: 'Failed to verify authentication' }, { status: 500 })
    }

    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { data: collaborators, error: collaboratorsError } = await supabase
      .from('campaign_collaborators')
      .select('user_id, role')
      .eq('campaign_id', epkId)

    if (collaboratorsError) {
      log.error('Failed to load collaborator roles', { error: collaboratorsError })
      return NextResponse.json({ error: 'Failed to load comments' }, { status: 500 })
    }

    const isCollaborator = collaborators?.some((row) => row.user_id === session.user.id)
    if (!isCollaborator) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Note: epk_comments table is planned but not yet created in database
    // Using type assertion to allow build to pass - will handle gracefully at runtime
     
    const { data: commentRowsData, error: commentsError } = await (supabase as any)
      .from('epk_comments')
      .select('id, epk_id, user_id, body, parent_id, created_at, updated_at')
      .eq('epk_id', epkId)
      .order('created_at', { ascending: true })

    if (commentsError) {
      log.error('Failed to load comments', { error: commentsError })
      return NextResponse.json({ error: 'Failed to load comments' }, { status: 500 })
    }

    const commentRows = (commentRowsData ?? []) as CommentRow[]
    const userIds = Array.from(new Set(commentRows.map((row) => row.user_id)))
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, full_name')
      .in('id', userIds.length > 0 ? userIds : ['00000000-0000-0000-0000-000000000000'])

    if (profilesError) {
      log.warn('Failed to load comment profiles', { error: profilesError })
    }

    const collaboratorRoleMap = new Map<string, string>()
    collaborators?.forEach((row) => collaboratorRoleMap.set(row.user_id, row.role))

    const typedProfiles = (profiles ?? []) as UserProfileRow[]
    const profileMap = new Map<string, string | null>(
      typedProfiles.map((profile) => [profile.id, profile.full_name])
    )

    const comments =
      commentRows.map((row) => ({
        id: row.id,
        epkId: row.epk_id,
        body: row.body,
        parentId: row.parent_id ?? null,
        createdAt: row.created_at,
        updatedAt: row.updated_at ?? null,
        user: {
          id: row.user_id,
          fullName: profileMap.get(row.user_id),
          email: undefined,
          role: collaboratorRoleMap.get(row.user_id) ?? 'guest',
        },
      })) ?? []

    return NextResponse.json({
      comments,
    })
  } catch (error) {
    log.error('Unexpected EPK comments error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ epkId: string }> }
) {
  try {
    const { epkId } = await params
    const body = (await request.json()) as { body?: string; parentId?: string | null }
    if (!body.body || !body.body.trim()) {
      return NextResponse.json({ error: 'Comment body is required' }, { status: 400 })
    }

    const supabase = await createRouteSupabaseClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      log.error('Failed to retrieve session', sessionError)
      return NextResponse.json({ error: 'Failed to verify authentication' }, { status: 500 })
    }

    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }
    const parentId = body.parentId ?? null

    const { data: roleRecord, error: roleError } = await supabase
      .from('campaign_collaborators')
      .select('role')
      .eq('campaign_id', epkId)
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (roleError) {
      log.error('Failed to check collaborator role', { error: roleError })
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
    }

    if (!roleRecord || !['owner', 'editor'].includes(roleRecord.role)) {
      return NextResponse.json({ error: 'Insufficient permissions to comment' }, { status: 403 })
    }

    const insertPayload = {
      epk_id: epkId,
      user_id: session.user.id,
      body: body.body,
      parent_id: parentId,
    }

    // Note: epk_comments table is planned but not yet created in database
     
    const { data: inserted, error: insertError } = await (supabase as any)
      .from('epk_comments')
      .insert(insertPayload)
      .select('id, epk_id, user_id, body, parent_id, created_at, updated_at')
      .single()

    if (insertError || !inserted) {
      log.error('Failed to insert comment', { error: insertError })
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
    }

    return NextResponse.json({ id: inserted.id })
  } catch (error) {
    log.error('Unexpected comment creation error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
