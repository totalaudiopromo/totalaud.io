import { NextRequest, NextResponse } from 'next/server'
import { createRouteSupabaseClient } from '@aud-web/lib/supabase/server'
import { logger } from '@/lib/logger'

const log = logger.scope('EpkCollaboratorsAPI')

interface CollaboratorRow {
  id: string
  user_id: string
  role: string
  invited_by: string | null
  created_at: string
  accepted_at?: string | null
}

interface InviteRow {
  id: string
  invited_email: string
  role: string
  invite_token: string
  invited_by: string | null
  expires_at: string
  created_at: string
}

export async function GET(_request: NextRequest, { params }: { params: { epkId: string } }) {
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

    const { data: collaboratorRowsData, error: collaboratorError } = await supabase
      .from('campaign_collaborators')
      .select('id, user_id, role, invited_by, created_at, accepted_at')
      .eq('campaign_id', campaignId)

    if (collaboratorError) {
      log.error('Failed to load collaborators', { error: collaboratorError })
      return NextResponse.json({ error: 'Failed to load collaborators' }, { status: 500 })
    }

    const collaboratorRows = (collaboratorRowsData ?? []) as CollaboratorRow[]

    const currentCollaborator = collaboratorRows.find((row) => row.user_id === session.user.id)

    if (!currentCollaborator) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const currentRole = (currentCollaborator.role as 'owner' | 'editor' | 'viewer') ?? 'viewer'

    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, artist_name')
      .in(
        'id',
        collaboratorRows.map((row) => row.user_id)
      )

    if (profilesError) {
      log.warn('Failed to load collaborator profiles', { error: profilesError })
    }

    const profileMap = new Map<string, string | undefined>(
      (profiles ?? []).map((profile) => [profile.id as string, (profile as any).artist_name])
    )

    let invites: InviteRow[] = []
    if (currentRole === 'owner') {
      const { data: inviteRowsData, error: inviteError } = await supabase
        .from('collaboration_invites')
        .select('id, invited_email, role, invite_token, invited_by, expires_at, created_at')
        .eq('campaign_id', campaignId)
        .is('accepted_at', null)

      if (inviteError) {
        log.warn('Failed to load pending invites', { error: inviteError })
      } else if (inviteRowsData) {
        invites = inviteRowsData as InviteRow[]
      }
    }

    return NextResponse.json({
      currentRole,
      collaborators: collaboratorRows,
      invites,
      profiles: (profiles ?? []).map((profile) => ({
        id: profile.id,
        artist_name: (profile as any).artist_name ?? null,
      })),
    })
  } catch (error) {
    log.error('Unexpected collaborator API error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { epkId: string } }) {
  try {
    const body = (await request.json()) as { email?: string; role?: string; message?: string }
    const { email, role = 'viewer' } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
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

    const campaignId = params.epkId

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
      return NextResponse.json({ error: 'Only owners can invite collaborators' }, { status: 403 })
    }

    const normalisedRole = role === 'guest' ? 'viewer' : role
    const inviteToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()

    const { error: insertError } = await supabase.from('collaboration_invites').insert({
      campaign_id: campaignId,
      invited_email: email,
      role: normalisedRole,
      invite_token: inviteToken,
      invited_by: session.user.id,
      expires_at: expiresAt,
    })

    if (insertError) {
      log.error('Failed to create invite', { error: insertError })
      return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.VERCEL_URL ??
      ''
    const inviteUrl = baseUrl ? `${baseUrl}/invite/${inviteToken}` : inviteToken

    return NextResponse.json({ inviteUrl })
  } catch (error) {
    log.error('Unexpected invite creation error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
