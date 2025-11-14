/**
 * useEpkComments Hook
 * Phase 15.8: Threaded comments system
 *
 * Provides CRUD helpers and optimistic updates for EPK comments.
 */

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { logger } from '@/lib/logger'
import { useFlowStateTelemetry } from '@/hooks/useFlowStateTelemetry'
import { createBrowserSupabaseClient } from '@aud-web/lib/supabase/client'

const log = logger.scope('useEpkComments')

export interface CommentAuthor {
  id: string
  fullName?: string
  email?: string
  avatarUrl?: string
  role?: 'owner' | 'editor' | 'viewer' | 'guest'
}

export interface Comment {
  id: string
  epkId: string
  content: string
  user: CommentAuthor
  parentId?: string | null
  createdAt: string
  updatedAt?: string
  edited?: boolean
}

export interface UseEpkCommentsOptions {
  epkId: string
  enabled?: boolean
  realtimeEnabled?: boolean
}

export interface UseEpkCommentsReturn {
  comments: Comment[]
  loading: boolean
  error: string | null
  createComment: (body: string, parentId?: string | null) => Promise<boolean>
  updateComment: (id: string, body: string) => Promise<boolean>
  deleteComment: (id: string) => Promise<boolean>
  refetch: () => Promise<void>
}

interface CommentsResponse {
  comments: Array<{
    id: string
    epkId: string
    body: string
    parentId?: string | null
    createdAt: string
    updatedAt?: string | null
    user: {
      id: string
      fullName?: string
      email?: string
      role?: 'owner' | 'editor' | 'viewer' | 'guest'
    }
  }>
}

export function useEpkComments({
  epkId,
  enabled = true,
  realtimeEnabled = false,
}: UseEpkCommentsOptions): UseEpkCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const telemetry = useFlowStateTelemetry()
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])

  const fetchComments = useCallback(async () => {
    if (!enabled) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/epk/${epkId}/comments`)

      if (!response.ok) {
        throw new Error(`Failed to load comments (${response.status})`)
      }

      const payload: CommentsResponse = await response.json()
      const mapped = payload.comments.map<Comment>((comment) => ({
        id: comment.id,
        epkId: comment.epkId,
        content: comment.body,
        parentId: comment.parentId,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt ?? undefined,
        edited: !!comment.updatedAt && comment.updatedAt !== comment.createdAt,
        user: {
          id: comment.user.id,
          fullName: comment.user.fullName,
          email: comment.user.email,
          role: comment.user.role,
        },
      }))

      setComments(mapped)

      telemetry.trackEvent('epk_comments_loaded', {
        metadata: {
          commentCount: mapped.length,
        },
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load comments'
      setError(message)
      log.error('Failed to fetch comments', { error: err })
    } finally {
      setLoading(false)
    }
  }, [enabled, epkId, telemetry])

  useEffect(() => {
    if (!enabled) return
    void fetchComments()
  }, [enabled, fetchComments])

  useEffect(() => {
    if (!enabled || !realtimeEnabled) return

    const channel = supabase
      .channel(`epk-comments-${epkId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'epk_comments',
          filter: `epk_id=eq.${epkId}`,
        },
        () => {
          log.debug('Realtime EPK comment event received')
          void fetchComments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [enabled, epkId, fetchComments, realtimeEnabled, supabase])

  const createComment = useCallback(
    async (body: string, parentId?: string | null) => {
      try {
        const response = await fetch(`/api/epk/${epkId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body, parentId }),
        })

        if (!response.ok) {
          throw new Error(`Failed to create comment (${response.status})`)
        }

        telemetry.trackEvent('epk_comment_created', {
          metadata: {
            hasParent: Boolean(parentId),
          },
        })

        await fetchComments()
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create comment'
        setError(message)
        log.error('Failed to create comment', { error: err })
        return false
      }
    },
    [epkId, fetchComments, telemetry]
  )

  const updateComment = useCallback(
    async (id: string, body: string) => {
      try {
        const response = await fetch(`/api/epk/${epkId}/comments/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body }),
        })

        if (!response.ok) {
          throw new Error(`Failed to update comment (${response.status})`)
        }

        telemetry.trackEvent('epk_comment_updated', {
          metadata: {
            commentId: id,
          },
        })

        await fetchComments()
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update comment'
        setError(message)
        log.error('Failed to update comment', { error: err })
        return false
      }
    },
    [epkId, fetchComments, telemetry]
  )

  const deleteComment = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/epk/${epkId}/comments/${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error(`Failed to delete comment (${response.status})`)
        }

        telemetry.trackEvent('epk_comment_deleted', {
          metadata: {
            commentId: id,
          },
        })

        await fetchComments()
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete comment'
        setError(message)
        log.error('Failed to delete comment', { error: err })
        return false
      }
    },
    [epkId, fetchComments, telemetry]
  )

  return {
    comments,
    loading,
    error,
    createComment,
    updateComment,
    deleteComment,
    refetch: fetchComments,
  }
}
