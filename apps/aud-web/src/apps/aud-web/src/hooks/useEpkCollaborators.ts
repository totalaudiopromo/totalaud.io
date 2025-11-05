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

import { useState, useEffect, useCallback } from 'react'
import { logger } from '@/lib/logger'
import { useFlowStateTelemetry } from './useFlowStateTelemetry'

const log = logger.scope('useEpkCollaborators')

export type EpkRole = 'owner' | 'editor' | 'viewer' | 'guest'
export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'revoked'

export interface Collaborator {
  id: string
  userId: string
  role: EpkRole
  status: InviteStatus
  email: string
  fullName?: string
  avatarUrl?: string
  invitedBy: {
    id: string
    email?: string
    fullName?: string
  }
  invitedAt: string
  acceptedAt?: string
  expiresAt?: string
  createdAt: string
  updatedAt: string
}

interface UseEpkCollaboratorsOptions {
  epkId: string
  enabled?: boolean
  includeStatus?: 'accepted' | 'pending' | 'all'
}

interface UseEpkCollaboratorsReturn {
  collaborators: Collaborator[]
  userRole: EpkRole | null
  loading: boolean
  error: string | null
  sendInvite: (
    email: string,
    role: 'editor' | 'viewer' | 'guest',
    options?: { expiryDays?: number; message?: string }
  ) => Promise<{
    success: boolean
    inviteUrl?: string
    error?: string
  }>
  removeCollaborator: (collaboratorId: string) => Promise<boolean>
  refetch: () => Promise<void>
}

export function useEpkCollaborators(
  options: UseEpkCollaboratorsOptions
): UseEpkCollaboratorsReturn {
  const { epkId, enabled = true, includeStatus = 'accepted' } = options

  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [userRole, setUserRole] = useState<EpkRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { trackEvent } = useFlowStateTelemetry()

  /**
   * Fetch collaborators
   */
  const fetchCollaborators = useCallback(async () => {
    if (!enabled || !epkId) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/epk/collaborators?epkId=${epkId}&status=${includeStatus}`)

      if (!response.ok) {
        throw new Error('Failed to fetch collaborators')
      }

      const result = await response.json()

      setCollaborators(result.collaborators || [])
      setUserRole(result.userRole || null)

      log.debug('Collaborators fetched', {
        epk_id: epkId,
        count: result.collaborators?.length || 0,
        user_role: result.userRole,
      })

      trackEvent('epk_collaborators_fetched', {
        epk_id: epkId,
        collaborator_count: result.collaborators?.length || 0,
        user_role: result.userRole,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch collaborators'
      log.error('Failed to fetch collaborators', err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [epkId, includeStatus, enabled, trackEvent])

  /**
   * Send invite
   */
  const sendInvite = useCallback(
    async (
      email: string,
      role: 'editor' | 'viewer' | 'guest',
      options?: { expiryDays?: number; message?: string }
    ): Promise<{
      success: boolean
      inviteUrl?: string
      error?: string
    }> => {
      if (!epkId) {
        log.warn('Cannot send invite without epkId')
        return { success: false, error: 'EPK ID is required' }
      }

      try {
        log.debug('Sending invite', { epk_id: epkId, email, role })

        const response = await fetch('/api/epk/invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            epkId,
            email,
            role,
            expiryDays: options?.expiryDays || 7,
            message: options?.message || '',
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to send invite')
        }

        log.info('Invite sent', {
          epk_id: epkId,
          email,
          role,
          invite_id: result.invite?.id,
        })

        trackEvent('epk_invite_sent', {
          epk_id: epkId,
          email,
          role,
          invite_id: result.invite?.id,
        })

        // Refetch to update list
        await fetchCollaborators()

        return {
          success: true,
          inviteUrl: result.invite?.inviteUrl,
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send invite'
        log.error('Failed to send invite', err)
        return { success: false, error: errorMessage }
      }
    },
    [epkId, fetchCollaborators, trackEvent]
  )

  /**
   * Remove collaborator or revoke invite
   */
  const removeCollaborator = useCallback(
    async (collaboratorId: string): Promise<boolean> => {
      try {
        log.debug('Removing collaborator', { collaborator_id: collaboratorId, epk_id: epkId })

        const response = await fetch(`/api/epk/collaborators/${collaboratorId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to remove collaborator')
        }

        const result = await response.json()

        log.info('Collaborator removed', {
          collaborator_id: collaboratorId,
          epk_id: epkId,
          action: result.action,
        })

        trackEvent('epk_collaborator_removed', {
          epk_id: epkId,
          collaborator_id: collaboratorId,
          action: result.action,
        })

        // Remove from local state
        setCollaborators((prev) => prev.filter((collab) => collab.id !== collaboratorId))

        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to remove collaborator'
        log.error('Failed to remove collaborator', err)
        setError(errorMessage)
        return false
      }
    },
    [epkId, trackEvent]
  )

  /**
   * Auto-fetch on mount
   */
  useEffect(() => {
    if (!enabled) return

    fetchCollaborators()
  }, [fetchCollaborators, enabled])

  return {
    collaborators,
    userRole,
    loading,
    error,
    sendInvite,
    removeCollaborator,
    refetch: fetchCollaborators,
  }
}
