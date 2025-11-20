import { NextRequest, NextResponse } from 'next/server'
import { createRouteSupabaseClient } from '@aud-web/lib/supabase/server'
import { logger } from '@/lib/logger'

const log = logger.scope('EpkCommentDetailAPI')

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ epkId: string; commentId: string }> }
) {
  try {
    const body = (await request.json()) as { body?: string }
    if (!body.body || !body.body.trim()) {
      return NextResponse.json({ error: 'Comment body is required' }, { status: 400 })
    }

    const supabase = createRouteSupabaseClient()
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

    const params = await context.params
    const { data: commentRecord, error: commentError } = await supabase
      .from('epk_comments')
      .select('user_id')
      .eq('id', params.commentId)
      .maybeSingle()

    if (commentError) {
      log.error('Failed to load comment', commentError)
      return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 })
    }

    if (!commentRecord) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    const { data: roleRecord, error: roleError } = await supabase
      .from('campaign_collaborators')
      .select('role')
      .eq('campaign_id', params.epkId)
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (roleError) {
      log.error('Failed to resolve collaborator role', roleError)
      return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 })
    }

    const isOwner = roleRecord?.role === 'owner'
    const isAuthor = commentRecord.user_id === session.user.id

    if (!isOwner && !isAuthor) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error: updateError } = await supabase
      .from('epk_comments')
      .update({ body: body.body })
      .eq('id', params.commentId)

    if (updateError) {
      log.error('Failed to update comment', updateError)
      return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    log.error('Unexpected comment update error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ epkId: string; commentId: string }> }
) {
  try {
    const supabase = createRouteSupabaseClient()
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

    const params = await context.params
    const { data: commentRecord, error: commentError } = await supabase
      .from('epk_comments')
      .select('user_id')
      .eq('id', params.commentId)
      .maybeSingle()

    if (commentError) {
      log.error('Failed to load comment', commentError)
      return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
    }

    if (!commentRecord) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    const { data: roleRecord, error: roleError } = await supabase
      .from('campaign_collaborators')
      .select('role')
      .eq('campaign_id', params.epkId)
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (roleError) {
      log.error('Failed to resolve collaborator role', roleError)
      return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
    }

    const isOwner = roleRecord?.role === 'owner'
    const isAuthor = commentRecord.user_id === session.user.id

    if (!isOwner && !isAuthor) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error: deleteError } = await supabase
      .from('epk_comments')
      .delete()
      .eq('id', params.commentId)

    if (deleteError) {
      log.error('Failed to delete comment', deleteError)
      return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    log.error('Unexpected comment deletion error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
