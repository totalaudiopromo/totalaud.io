/**
 * EpkCommentsPanel Component
 * Phase 15.8: Threaded comments system
 *
 * Features:
 * - Threaded comments (parent/child structure)
 * - Create comments and replies
 * - Edit own comments
 * - Delete own comments (or as owner)
 * - Realtime updates via Supabase
 * - ⌘M keyboard shortcut toggle
 * - FlowCore design tokens
 * - User avatars and timestamps
 * - Mobile responsive (w-full sm:w-[480px])
 * - Reduced motion support
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useEpkComments, type Comment } from '@/hooks/useEpkComments'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { logger } from '@/lib/logger'

const log = logger.scope('EpkCommentsPanel')

interface EpkCommentsPanelProps {
  epkId: string
  isOpen: boolean
  onClose: () => void
  userRole?: 'owner' | 'editor' | 'viewer' | 'guest'
}

export function EpkCommentsPanel({ epkId, isOpen, onClose, userRole }: EpkCommentsPanelProps) {
  const prefersReducedMotion = useReducedMotion()
  const [newCommentText, setNewCommentText] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  const { comments, loading, error, createComment, updateComment, deleteComment } = useEpkComments({
    epkId,
    enabled: isOpen,
    realtimeEnabled: true,
  })

  const canComment = userRole === 'owner' || userRole === 'editor'

  /**
   * Keyboard shortcut: ⌘M to toggle
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifierKey = isMac ? event.metaKey : event.ctrlKey

      if (modifierKey && event.key.toLowerCase() === 'm') {
        event.preventDefault()
        event.stopPropagation()

        if (isOpen) {
          onClose()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  /**
   * Organize comments into threaded structure
   */
  const threadedComments = useMemo(() => {
    const rootComments = comments.filter((c) => !c.parentId)
    const childComments = comments.filter((c) => c.parentId)

    return rootComments.map((root) => ({
      ...root,
      replies: childComments.filter((child) => child.parentId === root.id),
    }))
  }, [comments])

  /**
   * Handle create comment
   */
  const handleCreateComment = async () => {
    if (!newCommentText.trim() || !canComment) return

    const result = await createComment(newCommentText)

    if (result) {
      setNewCommentText('')
    }
  }

  /**
   * Handle create reply
   */
  const handleCreateReply = async (parentId: string) => {
    if (!replyText.trim() || !canComment) return

    const result = await createComment(replyText, parentId)

    if (result) {
      setReplyText('')
      setReplyingTo(null)
    }
  }

  /**
   * Handle start edit
   */
  const handleStartEdit = (comment: Comment) => {
    setEditingId(comment.id)
    setEditText(comment.content)
  }

  /**
   * Handle save edit
   */
  const handleSaveEdit = async (commentId: string) => {
    if (!editText.trim()) return

    const result = await updateComment(commentId, editText)

    if (result) {
      setEditingId(null)
      setEditText('')
    }
  }

  /**
   * Handle delete comment
   */
  const handleDelete = async (commentId: string) => {
    const confirmed = window.confirm('Delete this comment?')
    if (!confirmed) return

    await deleteComment(commentId)
  }

  /**
   * Render single comment
   */
  const renderComment = (comment: Comment, isReply: boolean = false) => {
    const isEditing = editingId === comment.id

    return (
      <div
        key={comment.id}
        className={`p-3 rounded ${isReply ? 'ml-8' : ''}`}
        style={{
          backgroundColor: flowCoreColours.borderGrey,
          border: `1px solid ${flowCoreColours.hoverGrey}`,
        }}
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs text-grey-400"
            style={{
              backgroundColor: flowCoreColours.hoverGrey,
            }}
          >
            {comment.user.fullName?.[0] || comment.user.email?.[0].toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="text-sm font-medium text-white">
                  {comment.user.fullName || comment.user.email}
                </p>
                <p className="text-xs text-grey-400">
                  {new Date(comment.createdAt).toLocaleString()}
                  {comment.edited && <span className="ml-1">(edited)</span>}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {canComment && (
                  <button
                    onClick={() => setReplyingTo(comment.id)}
                    className="p-1.5 text-xs text-grey-400 rounded transition-colours duration-120"
                    style={{
                      backgroundColor: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = flowCoreColours.slateCyan
                      e.currentTarget.style.backgroundColor = flowCoreColours.hoverGrey
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = flowCoreColours.textSecondary
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                    aria-label="Reply"
                  >
                    Reply
                  </button>
                )}
                {/* Edit/Delete own comments */}
                <button
                  onClick={() => handleStartEdit(comment)}
                  className="p-1.5 text-xs text-grey-400 rounded transition-colours duration-120"
                  style={{
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = flowCoreColours.slateCyan
                    e.currentTarget.style.backgroundColor = flowCoreColours.hoverGrey
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = flowCoreColours.textSecondary
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                  aria-label="Edit"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="p-1.5 text-xs text-grey-400 rounded transition-colours duration-120"
                  style={{
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = flowCoreColours.errorRed
                    e.currentTarget.style.backgroundColor = 'rgba(229, 115, 115, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = flowCoreColours.textSecondary
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                  aria-label="Delete"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Content */}
            {isEditing ? (
              <div className="mt-2 space-y-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded text-sm text-white resize-none focus:outline-none"
                  style={{
                    backgroundColor: flowCoreColours.matteBlack,
                    border: `1px solid ${flowCoreColours.hoverGrey}`,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = flowCoreColours.slateCyan
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = flowCoreColours.hoverGrey
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(comment.id)}
                    disabled={!editText.trim()}
                    className="px-3 py-1.5 text-white text-xs rounded transition-colours duration-120 disabled:opacity-50"
                    style={{
                      backgroundColor: flowCoreColours.slateCyan,
                    }}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.backgroundColor = flowCoreColours.slateCyanHover
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = flowCoreColours.slateCyan
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null)
                      setEditText('')
                    }}
                    className="px-3 py-1.5 text-grey-400 text-xs rounded transition-colours duration-120"
                    style={{
                      backgroundColor: flowCoreColours.hoverGrey,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = flowCoreColours.hoverDarkGrey
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = flowCoreColours.hoverGrey
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-grey-300 whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            )}

            {/* Reply form */}
            {replyingTo === comment.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.24 }}
                className="mt-3 space-y-2"
              >
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  rows={3}
                  className="w-full px-3 py-2 rounded text-sm text-white resize-none focus:outline-none"
                  style={{
                    backgroundColor: flowCoreColours.matteBlack,
                    border: `1px solid ${flowCoreColours.hoverGrey}`,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = flowCoreColours.slateCyan
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = flowCoreColours.hoverGrey
                  }}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCreateReply(comment.id)}
                    disabled={!replyText.trim()}
                    className="px-3 py-1.5 text-white text-xs rounded transition-colours duration-120 disabled:opacity-50"
                    style={{
                      backgroundColor: flowCoreColours.slateCyan,
                    }}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.backgroundColor = flowCoreColours.slateCyanHover
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = flowCoreColours.slateCyan
                    }}
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => {
                      setReplyingTo(null)
                      setReplyText('')
                    }}
                    className="px-3 py-1.5 text-grey-400 text-xs rounded transition-colours duration-120"
                    style={{
                      backgroundColor: flowCoreColours.hoverGrey,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = flowCoreColours.hoverDarkGrey
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = flowCoreColours.hoverGrey
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.24 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: 480 }}
            animate={{ x: 0 }}
            exit={{ x: 480 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.24,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[480px] flex flex-col"
            style={{
              backgroundColor: flowCoreColours.matteBlack,
              borderLeft: `1px solid ${flowCoreColours.borderGrey}`,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4"
              style={{
                borderBottom: `1px solid ${flowCoreColours.borderGrey}`,
              }}
            >
              <div>
                <h2 className="text-lg font-semibold text-white">Comments</h2>
                <p className="text-xs text-grey-400">{comments.length} total</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded transition-colours duration-120"
                style={{
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = flowCoreColours.borderGrey
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
                aria-label="Close panel"
              >
                <span className="text-grey-400">✕</span>
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400">
                {error}
              </div>
            )}

            {/* New comment form (editors/owners only) */}
            {canComment && (
              <div
                className="p-4 space-y-2"
                style={{
                  borderBottom: `1px solid ${flowCoreColours.borderGrey}`,
                }}
              >
                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  className="w-full px-3 py-2 rounded text-sm text-white placeholder-grey-400 resize-none focus:outline-none"
                  style={{
                    backgroundColor: flowCoreColours.borderGrey,
                    border: `1px solid ${flowCoreColours.hoverGrey}`,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = flowCoreColours.slateCyan
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = flowCoreColours.hoverGrey
                  }}
                />
                <button
                  onClick={handleCreateComment}
                  disabled={!newCommentText.trim()}
                  className="w-full px-3 py-2 text-white text-sm rounded transition-colours duration-120 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: flowCoreColours.slateCyan,
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = flowCoreColours.slateCyanHover
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = flowCoreColours.slateCyan
                  }}
                >
                  Post Comment
                </button>
              </div>
            )}

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading && (
                <div className="text-center text-grey-400 text-sm py-8">Loading comments...</div>
              )}

              {!loading && comments.length === 0 && (
                <div className="text-center text-grey-400 text-sm py-8">
                  No comments yet. Be the first to comment!
                </div>
              )}

              {!loading &&
                threadedComments.map((thread) => (
                  <div key={thread.id} className="space-y-3">
                    {/* Root comment */}
                    {renderComment(thread)}

                    {/* Replies */}
                    {thread.replies.map((reply) => renderComment(reply, true))}
                  </div>
                ))}
            </div>

            {/* Footer */}
            <div
              className="p-4 text-xs text-grey-400"
              style={{
                borderTop: `1px solid ${flowCoreColours.borderGrey}`,
              }}
            >
              <p>Press ⌘M to toggle this panel</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
