/**
 * useEpkCollaborators Hook
 * Phase 15.8: Manage EPK collaborators and invites
 *
 * Features:
 * - List collaborators with user profiles
 * - Send invites with role assignment
 * - Remove collaborators or revoke invites
 * - Track user's own role
 * - Telemetry tracking
 */

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { logger } from '@/lib/logger'
import { useFlowStateTelemetry } from '@/hooks/useFlowStateTelemetry'
import { createBrowserSupabaseClient } from '@aud-web/lib/supabase/client'

const log = logger.scope('useEpkCollaborators')

export type EpkRole = 'owner' | 'editor' | 'viewer' | 'guest'

export interface UseEpkCollaboratorsOptions {
  epkId: string
  enabled?: boolean
  includeStatus?: 'accepted' | 'pending' | 'all'
  realtime?: boolean
}

export interface UseEpkCollaboratorsReturn {
  collaborators: Array<EpkCollaborator & { status: 'accepted' | 'pending' }>
  loading: boolean
  error: string | null
  userRole: EpkRole
  refetch: () => Promise<void>
  sendInvite: (
    email: string,
    role: EpkRole,
    options?: { message?: string }
  ) => Promise<{ success: boolean; inviteUrl?: string; error?: string }>
  revokeInvite: (inviteId: string) => Promise<{ success: boolean; error?: string }>
  removeCollaborator: (collaboratorId: string) => Promise<{ success: boolean; error?: string }>
}

export interface EpkCollaborator {
  id: string
  userId?: string
  email?: string
  displayName?: string
  avatarUrl?: string
  role: EpkRole
  status: 'accepted' | 'pending'
  invitedBy?: {
    id?: string
    email?: string
    displayName?: string
  }
  invitedAt: string
  acceptedAt?: string | null
  expiresAt?: string | null
  inviteUrl?: string
}

interface CollaboratorsResponse {
  currentRole: EpkRole
  collaborators: Array<{
    id: string
    user_id: string
    role: EpkRole
    invited_by: string | null
    created_at: string
    accepted_at?: string | null
  }>
  invites: Array<{
    id: string
    invited_email: string
    role: EpkRole
    invite_token: string
    invited_by: string | null
    expires_at: string
    created_at: string
  }>
  profiles: Array<{
    id: string
    artist_name?: string | null
  }>
}

export function useEpkCollaborators({
  epkId,
  enabled = true,
  includeStatus = 'all',
  realtime = false,
}: UseEpkCollaboratorsOptions): UseEpkCollaboratorsReturn {
  const [collaborators, setCollaborators] = useState<
    Array<EpkCollaborator & { status: 'accepted' | 'pending' }>
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<EpkRole>('guest')
  const { trackEvent } = useFlowStateTelemetry()

  const supabase = useMemo(() => createBrowserSupabaseClient(), [])

  const fetchCollaborators = useCallback(async () => {
    if (!enabled) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/epk/${epkId}/collaborators`)

      if (!response.ok) {
        throw new Error(`Failed to load collaborators (${response.status})`)
      }

      const payload: CollaboratorsResponse = await response.json()
      setUserRole(payload.currentRole)

      const profileMap = new Map<string, string | undefined>(
        payload.profiles.map((profile) => [profile.id, profile.artist_name ?? undefined])
      )

    const origin =
      typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL

    const accepted =
        payload.collaborators?.map<EpkCollaborator & { status: 'accepted' }>((collab) => ({
          id: collab.id,
          userId: collab.user_id,
          email: undefined,
          displayName: profileMap.get(collab.user_id) ?? undefined,
          avatarUrl: undefined,
          role: collab.role,
          status: 'accepted',
          invitedBy: undefined,
          invitedAt: collab.created_at,
          acceptedAt: collab.accepted_at ?? collab.created_at,
        })) ?? []

      const pending =
        payload.invites?.map<EpkCollaborator & { status: 'pending' }>((invite) => ({
          id: invite.id,
          role: invite.role,
          status: 'pending',
          userId: undefined,
          email: invite.invited_email,
        displayName: invite.invited_email,
          invitedBy: undefined,
          invitedAt: invite.created_at,
          acceptedAt: null,
          expiresAt: invite.expires_at,
        inviteUrl: origin ? `${origin}/invite/${invite.invite_token}` : invite.invite_token,
        })) ?? []

      const merged =
        includeStatus === 'all'
          ? [...accepted, ...pending]
          : includeStatus === 'accepted'
            ? accepted
            : pending

      setCollaborators(merged)

      trackEvent('epk_collaborators_loaded', {
        metadata: {
          collaboratorCount: merged.length,
        },
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load collaborators'
      setError(message)
      log.error('Failed to fetch collaborators', { error: err })
    } finally {
      setLoading(false)
    }
  }, [enabled, epkId, includeStatus, trackEvent])

  useEffect(() => {
    if (!enabled) return
    void fetchCollaborators()
  }, [enabled, fetchCollaborators])

  useEffect(() => {
    if (!enabled || !realtime) return

    const channel = supabase
      .channel(`collaborators-${epkId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaign_collaborators',
          filter: `campaign_id=eq.${epkId}`,
        },
        () => {
          log.debug('Realtime collaborator change received')
          void fetchCollaborators()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collaboration_invites',
          filter: `campaign_id=eq.${epkId}`,
        },
        () => {
          log.debug('Realtime invite change received')
          void fetchCollaborators()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [enabled, epkId, fetchCollaborators, realtime, supabase])

  const sendInvite = useCallback(
    async (email: string, role: EpkRole, options?: { message?: string }) => {
      try {
        const response = await fetch(`/api/epk/${epkId}/collaborators`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, role, message: options?.message }),
        })

        if (!response.ok) {
          throw new Error(`Invite failed: ${response.status}`)
        }

        const data = (await response.json()) as { inviteUrl?: string }

        trackEvent('epk_invite_sent', {
          metadata: {
            role,
            invitedEmail: email,
            inviteId: data.inviteUrl,
          },
        })

        await fetchCollaborators()

        return { success: true, inviteUrl: data.inviteUrl }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to send invite'
        log.error('Failed to send collaborator invite', { error: err })
        setError(message)
        return { success: false, error: message }
      }
    },
    [epkId, fetchCollaborators, trackEvent]
  )

  const revokeInvite = useCallback(
    async (inviteId: string) => {
      try {
        const response = await fetch(`/api/epk/${epkId}/collaborators/invites/${inviteId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error(`Failed to revoke invite (${response.status})`)
        }

        trackEvent('epk_invite_revoked', {
          metadata: {
            inviteId,
          },
        })

        await fetchCollaborators()

        return { success: true }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to revoke invite'
        log.error('Failed to revoke collaborator invite', { error: err })
        setError(message)
        return { success: false, error: message }
      }
    },
    [epkId, fetchCollaborators, trackEvent]
  )

  const removeCollaborator = useCallback(
    async (collaboratorId: string) => {
      try {
        const response = await fetch(`/api/epk/${epkId}/collaborators/${collaboratorId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error(`Failed to remove collaborator (${response.status})`)
        }

        trackEvent('epk_collaborator_removed', {
          metadata: {
            collaboratorId,
          },
        })

        await fetchCollaborators()

        return { success: true }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to remove collaborator'
        log.error('Failed to remove collaborator', { error: err })
        setError(message)
        return { success: false, error: message }
      }
    },
    [epkId, fetchCollaborators, trackEvent]
  )

  return {
    collaborators,
    loading,
    error,
    userRole,
    refetch: fetchCollaborators,
    sendInvite,
    revokeInvite,
    removeCollaborator,
  }
}

