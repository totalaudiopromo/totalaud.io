import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { requireAuth } from '@/lib/api/auth'

const log = logger.scope('EpkCommentDetailAPI')

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ epkId: string; commentId: string }> }
) {
  try {
    const { epkId, commentId } = await params
    const body = (await request.json()) as { body?: string }
    if (!body.body || !body.body.trim()) {
      return NextResponse.json({ error: 'Comment body is required' }, { status: 400 })
    }

    const auth = await requireAuth()
    if (auth instanceof NextResponse) {
      return auth
    }

    const { supabase, session } = auth

    // Note: epk_comments table is planned but not yet created in database
    const { data: commentRecord, error: commentError } = await supabase
      .from('epk_comments')
      .select('user_id')
      .eq('id', commentId)
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
      .eq('campaign_id', epkId)
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
      .eq('id', commentId)

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
  { params }: { params: Promise<{ epkId: string; commentId: string }> }
) {
  try {
    const { epkId, commentId } = await params

    const auth = await requireAuth()
    if (auth instanceof NextResponse) {
      return auth
    }

    const { supabase, session } = auth

    // Note: epk_comments table is planned but not yet created in database
    const { data: commentRecord, error: commentError } = await supabase
      .from('epk_comments')
      .select('user_id')
      .eq('id', commentId)
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
      .eq('campaign_id', epkId)
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

    const { error: deleteError } = await supabase.from('epk_comments').delete().eq('id', commentId)

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
