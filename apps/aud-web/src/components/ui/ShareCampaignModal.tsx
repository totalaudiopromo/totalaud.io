/**
 * Share Campaign Modal
 *
 * Stage 8: Studio Personalisation & Collaboration
 * Modal for inviting collaborators to campaigns with role-based permissions.
 *
 * Features:
 * - Email input for inviting new collaborators
 * - Role selector (Editor / Viewer)
 * - List of current collaborators with roles
 * - Remove collaborator (owner only)
 * - Copy invite link to clipboard
 * - Toast notifications
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getSupabaseClient } from '@/lib/supabaseClient'
import type { CampaignCollaborator } from '@/lib/supabaseClient'

interface ShareCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  campaignId: string
  campaignTitle: string
  currentUserId: string
  currentUserRole: 'owner' | 'editor' | 'viewer'
}

type Toast = {
  id: string
  message: string
  type: 'success' | 'error'
}

export function ShareCampaignModal({
  isOpen,
  onClose,
  campaignId,
  campaignTitle,
  currentUserId,
  currentUserRole,
}: ShareCampaignModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'editor' | 'viewer'>('editor')
  const [isInviting, setIsInviting] = useState(false)
  const [collaborators, setCollaborators] = useState<CampaignCollaborator[]>([])
  const [isLoadingCollaborators, setIsLoadingCollaborators] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)

  const supabase = getSupabaseClient()
  const isOwner = currentUserRole === 'owner'

  // Fetch collaborators
  useEffect(() => {
    if (isOpen) {
      fetchCollaborators()
    }
  }, [isOpen, campaignId])

  const fetchCollaborators = async () => {
    setIsLoadingCollaborators(true)
    try {
      const { data, error } = await supabase
        .from('campaign_collaborators')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setCollaborators(data || [])
    } catch (err) {
      console.error('Failed to fetch collaborators:', err)
      showToast('Failed to load collaborators', 'error')
    } finally {
      setIsLoadingCollaborators(false)
    }
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { id, message, type }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }

  const handleInvite = async () => {
    if (!email.trim()) {
      showToast('Please enter an email address', 'error')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address', 'error')
      return
    }

    if (!isOwner) {
      showToast('Only campaign owners can invite collaborators', 'error')
      return
    }

    setIsInviting(true)

    try {
      const response = await fetch('/api/collaboration/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaignId,
          invited_email: email,
          role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create invite')
      }

      showToast(`Invite sent to ${email}`, 'success')
      setInviteUrl(data.invite_url)
      setEmail('')
      fetchCollaborators() // Refresh list
    } catch (err: any) {
      showToast(err.message || 'Failed to send invite', 'error')
    } finally {
      setIsInviting(false)
    }
  }

  const handleCopyInviteLink = async () => {
    if (!inviteUrl) return

    try {
      await navigator.clipboard.writeText(inviteUrl)
      showToast('Invite link copied to clipboard', 'success')
    } catch (err) {
      showToast('Failed to copy link', 'error')
    }
  }

  const handleRemoveCollaborator = async (collaboratorId: string, collaboratorEmail?: string) => {
    if (!isOwner) {
      showToast('Only campaign owners can remove collaborators', 'error')
      return
    }

    if (!confirm(`Remove ${collaboratorEmail || 'this collaborator'}?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('campaign_collaborators')
        .delete()
        .eq('id', collaboratorId)

      if (error) throw error

      showToast('Collaborator removed', 'success')
      fetchCollaborators()
    } catch (err) {
      showToast('Failed to remove collaborator', 'error')
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="
            w-full max-w-2xl max-h-[80vh] overflow-hidden
            bg-[#0F1419] border-2 border-[#1E2933]
            rounded-lg shadow-2xl
            flex flex-col
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#1E2933] flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#3AA9BE] font-mono">Share Campaign</h2>
              <p className="text-sm text-[#6B7280] mt-1">{campaignTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="
                text-[#6B7280] hover:text-[#3AA9BE]
                transition-colors duration-150
                focus:outline-none focus:ring-2 focus:ring-[#3AA9BE]
                rounded-lg p-2
              "
              aria-label="Close modal"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Invite Form */}
            {isOwner && (
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-[#9CA3AF] font-mono">
                  Invite Collaborator
                </label>
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                    placeholder="email@example.com"
                    disabled={isInviting}
                    className="
                      flex-1 px-4 py-2 rounded-lg
                      bg-[#0A0E12] border border-[#1E2933]
                      text-[#E5E7EB] placeholder:text-[#4B5563]
                      focus:outline-none focus:border-[#3AA9BE] focus:ring-1 focus:ring-[#3AA9BE]
                      disabled:opacity-50 disabled:cursor-not-allowed
                      font-mono text-sm
                    "
                  />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
                    disabled={isInviting}
                    className="
                      px-4 py-2 rounded-lg
                      bg-[#0A0E12] border border-[#1E2933]
                      text-[#E5E7EB]
                      focus:outline-none focus:border-[#3AA9BE] focus:ring-1 focus:ring-[#3AA9BE]
                      disabled:opacity-50 disabled:cursor-not-allowed
                      font-mono text-sm
                    "
                  >
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <button
                    onClick={handleInvite}
                    disabled={isInviting || !email.trim()}
                    className="
                      px-6 py-2 rounded-lg
                      bg-[#3AA9BE] text-[#0A0E12]
                      font-semibold font-mono text-sm
                      hover:bg-[#2EC9AA] active:bg-[#25A68A]
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors duration-150
                      focus:outline-none focus:ring-2 focus:ring-[#3AA9BE] focus:ring-offset-2 focus:ring-offset-[#0F1419]
                    "
                  >
                    {isInviting ? 'Sending...' : 'Invite'}
                  </button>
                </div>

                {/* Invite Link (if generated) */}
                {inviteUrl && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={inviteUrl}
                      readOnly
                      className="
                        flex-1 px-4 py-2 rounded-lg
                        bg-[#0A0E12] border border-[#1E2933]
                        text-[#6B7280] font-mono text-xs
                        focus:outline-none
                      "
                    />
                    <button
                      onClick={handleCopyInviteLink}
                      className="
                        px-4 py-2 rounded-lg
                        bg-[#1E2933] text-[#9CA3AF]
                        hover:bg-[#2A3744] hover:text-[#3AA9BE]
                        transition-colors duration-150
                        font-mono text-sm
                        focus:outline-none focus:ring-2 focus:ring-[#3AA9BE]
                      "
                    >
                      Copy Link
                    </button>
                  </motion.div>
                )}
              </div>
            )}

            {/* Collaborators List */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-[#9CA3AF] font-mono">
                Current Collaborators ({collaborators.length})
              </label>

              {isLoadingCollaborators ? (
                <div className="text-center py-8 text-[#6B7280] text-sm">
                  Loading collaborators...
                </div>
              ) : collaborators.length === 0 ? (
                <div className="text-center py-8 text-[#6B7280] text-sm">No collaborators yet</div>
              ) : (
                <div className="space-y-2">
                  {collaborators.map((collab) => {
                    const isCurrentUser = collab.user_id === currentUserId
                    const canRemove = isOwner && !isCurrentUser && collab.role !== 'owner'

                    return (
                      <motion.div
                        key={collab.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="
                          flex items-center justify-between
                          px-4 py-3 rounded-lg
                          bg-[#0A0E12] border border-[#1E2933]
                          hover:border-[#2A3744]
                          transition-colors duration-150
                        "
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className="
                            w-10 h-10 rounded-full
                            bg-[#1E2933] text-[#3AA9BE]
                            flex items-center justify-center
                            font-mono text-sm font-bold
                          "
                          >
                            {collab.user_id.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[#E5E7EB] font-mono truncate">
                              {collab.user_id}
                              {isCurrentUser && <span className="ml-2 text-[#6B7280]">(You)</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Role Badge */}
                          <span
                            className={`
                              px-3 py-1 rounded-full text-xs font-semibold font-mono uppercase
                              ${
                                collab.role === 'owner'
                                  ? 'bg-[#3AA9BE]/20 text-[#3AA9BE]'
                                  : collab.role === 'editor'
                                    ? 'bg-[#0078D7]/20 text-[#0078D7]'
                                    : 'bg-[#6B7280]/20 text-[#9CA3AF]'
                              }
                            `}
                          >
                            {collab.role}
                          </span>

                          {/* Remove Button */}
                          {canRemove && (
                            <button
                              onClick={() => handleRemoveCollaborator(collab.id, collab.user_id)}
                              className="
                                text-[#6B7280] hover:text-red-400
                                transition-colors duration-150
                                focus:outline-none focus:ring-2 focus:ring-red-400
                                rounded p-1
                              "
                              aria-label="Remove collaborator"
                            >
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M18 6L6 18M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Role Descriptions */}
            <div className="space-y-2 pt-4 border-t border-[#1E2933]">
              <p className="text-xs font-semibold text-[#9CA3AF] font-mono mb-2">
                Role Permissions:
              </p>
              <div className="space-y-1 text-xs text-[#6B7280] font-mono">
                <div>
                  <span className="text-[#3AA9BE]">Owner:</span> Full control (manage collaborators,
                  delete campaign)
                </div>
                <div>
                  <span className="text-[#0078D7]">Editor:</span> Can add events and edit campaign
                  details
                </div>
                <div>
                  <span className="text-[#9CA3AF]">Viewer:</span> Read-only access to campaign
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#1E2933] flex justify-end">
            <button
              onClick={onClose}
              className="
                px-6 py-2 rounded-lg
                bg-[#1E2933] text-[#E5E7EB]
                hover:bg-[#2A3744]
                transition-colors duration-150
                font-mono text-sm font-semibold
                focus:outline-none focus:ring-2 focus:ring-[#3AA9BE]
              "
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-[60] space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`
                px-4 py-3 rounded-lg shadow-lg
                font-mono text-sm
                ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
              `}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}
