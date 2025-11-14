import { NextRequest, NextResponse } from 'next/server'
import { createRouteSupabaseClient } from '@aud-web/lib/supabase/server'
import { logger } from '@/lib/logger'

const log = logger.scope('EpkCollaboratorDetailAPI')

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { epkId: string; collaboratorId: string } }
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

    const campaignId = params.epkId
    const collaboratorId = params.collaboratorId

    const { data: ownerRecord, error: roleError } = await supabase
      .from('campaign_collaborators')
      .select('role')
      .eq('campaign_id', campaignId)
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (roleError) {
      log.error('Failed to resolve collaborator role', { error: roleError })
      return NextResponse.json({ error: 'Failed to resolve collaborator role' }, { status: 500 })
    }

    if (!ownerRecord || ownerRecord.role !== 'owner') {
      return NextResponse.json({ error: 'Only owners can remove collaborators' }, { status: 403 })
    }

    const { error: deleteError } = await supabase
      .from('campaign_collaborators')
      .delete()
      .eq('campaign_id', campaignId)
      .eq('id', collaboratorId)

    if (deleteError) {
      log.error('Failed to delete collaborator', { error: deleteError })
      return NextResponse.json({ error: 'Failed to delete collaborator' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    log.error('Unexpected collaborator deletion error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

