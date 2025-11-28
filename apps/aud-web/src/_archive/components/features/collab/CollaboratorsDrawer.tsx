/**
 * CollaboratorsDrawer Component
 * Phase 15.8: Manage EPK collaborators and invites
 *
 * Features:
 * - List accepted collaborators with profiles
 * - List pending invites (owners only)
 * - Send new invites with role selection
 * - Remove collaborators or revoke invites
 * - ⌘P keyboard shortcut toggle
 * - FlowCore design tokens
 * - Role badges with colours
 * - Mobile responsive (w-full sm:w-[480px])
 * - Reduced motion support
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  useEpkCollaborators,
  type EpkRole,
  type EpkCollaborator,
} from '@/hooks/useEpkCollaborators'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { logger } from '@/lib/logger'
import { X } from 'lucide-react'

const log = logger.scope('CollaboratorsDrawer')

interface CollaboratorsDrawerProps {
  epkId: string
  isOpen: boolean
  onClose: () => void
}

// Role colours (FlowCore palette)
const ROLE_COLOURS: Record<EpkRole, string> = {
  owner: flowCoreColours.slateCyan,
  editor: flowCoreColours.purple,
  viewer: flowCoreColours.amber,
  guest: flowCoreColours.grey,
}

export function CollaboratorsDrawer({ epkId, isOpen, onClose }: CollaboratorsDrawerProps) {
  const prefersReducedMotion = useReducedMotion()
  const [activeTab, setActiveTab] = useState<'collaborators' | 'pending'>('collaborators')
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer' | 'guest'>('viewer')
  const [inviteMessage, setInviteMessage] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null)

  const {
    collaborators,
    userRole,
    loading,
    error,
    sendInvite,
    removeCollaborator,
    revokeInvite,
    refetch,
  } = useEpkCollaborators({
    epkId,
    enabled: isOpen,
    includeStatus: activeTab === 'pending' ? 'pending' : 'accepted',
    realtime: true,
  })

  const isOwner = userRole === 'owner'

  /**
   * Keyboard shortcut: ⌘P to toggle
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifierKey = isMac ? event.metaKey : event.ctrlKey

      if (modifierKey && event.key.toLowerCase() === 'p') {
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
   * Handle send invite
   */
  const handleSendInvite = async () => {
    if (!inviteEmail || !isOwner) return

    const result = await sendInvite(inviteEmail, inviteRole, { message: inviteMessage })

    if (result.success) {
      setInviteSuccess(result.inviteUrl || 'invite sent successfully')
      setInviteEmail('')
      setInviteMessage('')
      setShowInviteForm(false)

      // Clear success message after 3s
      setTimeout(() => setInviteSuccess(null), 3000)

      // Refetch to show new pending invite
      refetch()
    } else {
      log.error('Failed to send invite', { error: result.error })
    }
  }

  /**
   * Handle remove collaborator
   */
  const handleRemove = async (
    collaborator: EpkCollaborator & { status: 'accepted' | 'pending' }
  ) => {
    const confirmed = window.confirm('Remove this collaborator?')
    if (!confirmed) return

    if (collaborator.status === 'pending') {
      await revokeInvite(collaborator.id)
    } else {
      await removeCollaborator(collaborator.id)
    }
  }

  /**
   * Handle copy invite URL
   */
  const handleCopyInviteUrl = (url?: string) => {
    if (!url) return
    navigator.clipboard.writeText(url).catch((error) => {
      log.error('Failed to copy invite URL', { error })
    })
  }

  // Get tab-specific collaborators
  const displayedCollaborators = collaborators.filter((c) =>
    activeTab === 'pending' ? c.status === 'pending' : c.status === 'accepted'
  )

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

          {/* Drawer */}
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
                <h2 className="text-lg font-semibold text-white">collaborators</h2>
                <p className="text-xs text-grey-400">
                  Your role: <span style={{ color: flowCoreColours.slateCyan }}>{userRole}</span>
                </p>
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
                aria-label="Close drawer"
              >
                <X size={18} strokeWidth={1.6} className="text-grey-400" />
              </button>
            </div>

            {/* Tabs */}
            <div
              className="flex gap-2 p-4"
              style={{
                borderBottom: `1px solid ${flowCoreColours.borderGrey}`,
              }}
            >
              <button
                onClick={() => setActiveTab('collaborators')}
                className="px-3 py-1.5 text-sm rounded transition-colours duration-120"
                style={{
                  backgroundColor:
                    activeTab === 'collaborators'
                      ? flowCoreColours.slateCyan
                      : flowCoreColours.borderGrey,
                  color: activeTab === 'collaborators' ? 'white' : flowCoreColours.textSecondary,
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'collaborators') {
                    e.currentTarget.style.backgroundColor = flowCoreColours.hoverGrey
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'collaborators') {
                    e.currentTarget.style.backgroundColor = flowCoreColours.borderGrey
                  }
                }}
              >
                collaborators ({displayedCollaborators.length})
              </button>
              {isOwner && (
                <button
                  onClick={() => setActiveTab('pending')}
                  className="px-3 py-1.5 text-sm rounded transition-colours duration-120"
                  style={{
                    backgroundColor:
                      activeTab === 'pending'
                        ? flowCoreColours.slateCyan
                        : flowCoreColours.borderGrey,
                    color: activeTab === 'pending' ? 'white' : flowCoreColours.textSecondary,
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== 'pending') {
                      e.currentTarget.style.backgroundColor = flowCoreColours.hoverGrey
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== 'pending') {
                      e.currentTarget.style.backgroundColor = flowCoreColours.borderGrey
                    }
                  }}
                >
                  pending ({collaborators.filter((c) => c.status === 'pending').length})
                </button>
              )}
            </div>

            {/* Success message */}
            {inviteSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.24 }}
                className="mx-4 mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded text-sm text-green-400"
              >
                {inviteSuccess}
              </motion.div>
            )}

            {/* Error message */}
            {error && (
              <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Invite form (owners only) */}
            {isOwner && showInviteForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.24 }}
                className="mx-4 mt-4 p-4 rounded space-y-3"
                style={{
                  backgroundColor: flowCoreColours.borderGrey,
                  border: `1px solid ${flowCoreColours.hoverGrey}`,
                }}
              >
                <h3 className="text-sm font-semibold text-white">send invite</h3>

                <div>
                  <label className="block text-xs text-grey-400 mb-1">email</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="collaborator@example.com"
                    className="w-full px-3 py-2 rounded text-sm text-white focus:outline-none"
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
                </div>

                <div>
                  <label className="block text-xs text-grey-400 mb-1">role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer' | 'guest')}
                    className="w-full px-3 py-2 rounded text-sm text-white focus:outline-none"
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
                  >
                    <option value="editor">editor (can edit and comment)</option>
                    <option value="viewer">viewer (read-only)</option>
                    <option value="guest">guest (limited access)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-grey-400 mb-1">message (optional)</label>
                  <textarea
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder="Add a personal message..."
                    rows={2}
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
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSendInvite}
                    disabled={!inviteEmail}
                    className="flex-1 px-3 py-2 text-white text-sm rounded transition-colours duration-120 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    send invite
                  </button>
                  <button
                    onClick={() => setShowInviteForm(false)}
                    className="px-3 py-2 text-grey-400 text-sm rounded transition-colours duration-120"
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
                    cancel
                  </button>
                </div>
              </motion.div>
            )}

            {/* Invite button (owners only) */}
            {isOwner && !showInviteForm && (
              <div className="px-4 pt-4">
                <button
                  onClick={() => setShowInviteForm(true)}
                  className="w-full px-3 py-2 text-white text-sm rounded transition-colours duration-120"
                  style={{
                    backgroundColor: flowCoreColours.slateCyan,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = flowCoreColours.slateCyanHover
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = flowCoreColours.slateCyan
                  }}
                >
                  open invite form
                </button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading && <div className="text-center text-grey-400 text-sm py-8">loading...</div>}

              {!loading && displayedCollaborators.length === 0 && (
                <div className="text-center text-grey-400 text-sm py-8">
                  {activeTab === 'pending' ? 'no pending invites' : 'no collaborators yet'}
                </div>
              )}

              {!loading &&
                displayedCollaborators.map((collab) => (
                  <div
                    key={collab.id}
                    className="p-3 rounded transition-colours duration-120"
                    style={{
                      backgroundColor: flowCoreColours.borderGrey,
                      border: `1px solid ${flowCoreColours.hoverGrey}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = flowCoreColours.hoverDarkGrey
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = flowCoreColours.hoverGrey
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {/* Avatar */}
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-grey-400"
                            style={{
                              backgroundColor: flowCoreColours.hoverGrey,
                            }}
                          >
                            {(collab.displayName ?? collab.email ?? collab.userId ?? '?').charAt(0)}
                          </div>

                          {/* Name/Email */}
                          <div>
                            <p className="text-sm font-medium text-white">
                              {collab.displayName ??
                                collab.email ??
                                collab.userId ??
                                'collaborator'}
                            </p>
                            {collab.displayName && collab.email && (
                              <p className="text-xs text-grey-400">{collab.email}</p>
                            )}
                          </div>
                        </div>

                        {/* Role badge */}
                        <div className="mt-2">
                          <span
                            className="inline-block px-2 py-0.5 text-xs rounded"
                            style={{
                              backgroundColor: `${ROLE_COLOURS[collab.role]}20`,
                              color: ROLE_COLOURS[collab.role],
                            }}
                          >
                            {collab.role}
                          </span>
                        </div>

                        {/* Status info */}
                        {collab.status === 'pending' && (
                          <div className="mt-2 text-xs text-grey-400">
                            <p>
                              invited by{' '}
                              {collab.invitedBy?.displayName ||
                                collab.invitedBy?.email ||
                                'campaign owner'}
                            </p>
                            {collab.expiresAt && (
                              <p>expires {new Date(collab.expiresAt).toLocaleDateString()}</p>
                            )}
                          </div>
                        )}

                        {collab.status === 'accepted' && collab.acceptedAt && (
                          <div className="mt-2 text-xs text-grey-400">
                            joined {new Date(collab.acceptedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {isOwner && (
                        <div className="flex items-center gap-2">
                          {collab.status === 'pending' && collab.inviteUrl && (
                            <button
                              onClick={() => handleCopyInviteUrl(collab.inviteUrl)}
                              className="p-1.5 text-grey-400 rounded transition-colours duration-120"
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
                              aria-label="Copy invite link"
                            >
                              copy link
                            </button>
                          )}
                          {collab.role !== 'owner' && (
                            <button
                              onClick={() => handleRemove(collab)}
                              className="p-1.5 text-grey-400 rounded transition-colours duration-120"
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
                              aria-label="Remove collaborator"
                            >
                              <X size={14} strokeWidth={1.6} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
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
              <p>press ⌘P to toggle this drawer</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
