/**
 * Smart Composer Component
 *
 * AI-powered follow-up email composer with:
 * - List of generated drafts
 * - Inline editor with autosave
 * - Send via Gmail API
 * - Keyboard shortcuts (Cmd+Enter to send, Escape to close)
 *
 * Design Principle: "Data should lead to dialogue."
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createBrowserClient } from '@aud-web/lib/supabase'
import { playAgentSound } from '@total-audio/core-theme-engine'

interface Draft {
  id: string
  contact_email: string
  contact_name?: string
  subject: string
  body: string
  theme: string
  status: string
  created_at: string
}

interface SmartComposerProps {
  sessionId: string
  onDraftSent?: () => void
}

export function SmartComposer({ sessionId, onDraftSent }: SmartComposerProps) {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedBody, setEditedBody] = useState('')
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient()

  // Fetch drafts
  const fetchDrafts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/coach/generate?sessionId=${sessionId}`)
      const data = await response.json()

      if (data.drafts) {
        setDrafts(data.drafts)
      }
    } catch (err) {
      console.error('[SmartComposer] Failed to fetch drafts:', err)
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    fetchDrafts()
  }, [fetchDrafts])

  // Subscribe to realtime draft updates
  useEffect(() => {
    const channel = supabase
      .channel(`coach-drafts-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'coach_drafts',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const newDraft = payload.new as Draft
          setDrafts((prev) => [newDraft, ...prev])
          playAgentSound('coach', 'complete')
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [sessionId, supabase])

  // Generate new drafts
  async function handleGenerate() {
    try {
      setGenerating(true)
      setError(null)

      const response = await fetch('/api/coach/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate drafts')
      }

      // Refresh drafts list
      await fetchDrafts()

      // Play success sound
      playAgentSound('coach', 'complete')
    } catch (err) {
      console.error('[SmartComposer] Generate error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate drafts')
      playAgentSound('coach', 'error')
    } finally {
      setGenerating(false)
    }
  }

  // Send draft
  async function handleSend(draftId: string) {
    try {
      setSending(draftId)
      setError(null)

      // Get custom body if editing
      const customBody = editingId === draftId ? editedBody : undefined

      const response = await fetch('/api/coach/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId, customBody }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email')
      }

      // Remove draft from list
      setDrafts((prev) => prev.filter((d) => d.id !== draftId))

      // Reset edit state
      setEditingId(null)
      setEditedBody('')

      // Play success sound
      playAgentSound('coach', 'complete')

      // Notify parent
      if (onDraftSent) {
        onDraftSent()
      }
    } catch (err) {
      console.error('[SmartComposer] Send error:', err)
      setError(err instanceof Error ? err.message : 'Failed to send email')
      playAgentSound('coach', 'error')
    } finally {
      setSending(null)
    }
  }

  // Edit draft
  function handleEdit(draft: Draft) {
    setEditingId(draft.id)
    setEditedBody(draft.body)
  }

  // Cancel edit
  function handleCancelEdit() {
    setEditingId(null)
    setEditedBody('')
  }

  // Archive draft
  async function handleArchive(draftId: string) {
    try {
      await supabase
        .from('coach_drafts')
        .update({ status: 'archived' } as any)
        .eq('id', draftId)

      setDrafts((prev) => prev.filter((d) => d.id !== draftId))
    } catch (err) {
      console.error('[SmartComposer] Archive error:', err)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Cmd/Ctrl + Enter to send
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && editingId) {
        e.preventDefault()
        handleSend(editingId)
      }

      // Escape to cancel edit
      if (e.key === 'Escape' && editingId) {
        e.preventDefault()
        handleCancelEdit()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editingId])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-slate-400 font-mono">Loading drafts...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-mono font-bold text-white">🎯 Smart Composer</h3>
          <p className="text-sm text-slate-400 mt-1">AI-powered follow-up email drafts</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 rounded font-mono text-white text-sm transition-colors"
        >
          {generating ? 'Generating...' : 'Generate Follow-Ups'}
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Drafts List */}
      {drafts.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 rounded-lg border border-slate-700">
          <div className="text-6xl mb-4">💌</div>
          <div className="text-slate-400 font-mono">
            No drafts yet. Click "Generate Follow-Ups" to create AI-powered emails.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {drafts.map((draft) => (
              <motion.div
                key={draft.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-slate-900 border border-blue-500/50 rounded-lg p-4"
              >
                {/* Draft Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-mono font-bold text-white">
                      {draft.contact_name || draft.contact_email}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {draft.contact_email} • {new Date(draft.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {editingId !== draft.id && (
                      <button
                        onClick={() => handleEdit(draft)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs font-mono text-slate-300 transition-colors"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleArchive(draft.id)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs font-mono text-slate-300 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>

                {/* Subject */}
                <div className="text-sm text-slate-300 font-mono mb-2">
                  <span className="text-slate-500">Subject:</span> {draft.subject}
                </div>

                {/* Body (editable or preview) */}
                {editingId === draft.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editedBody}
                      onChange={(e) => setEditedBody(e.target.value)}
                      className="w-full h-32 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-sm text-white font-mono resize-none focus:outline-none focus:border-blue-500"
                      placeholder="Email body..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSend(draft.id)}
                        disabled={sending === draft.id}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 rounded font-mono text-white text-sm transition-colors"
                      >
                        {sending === draft.id ? 'Sending...' : 'Send Email (⌘↵)'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded font-mono text-slate-300 text-sm transition-colors"
                      >
                        Cancel (Esc)
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-slate-300 whitespace-pre-wrap bg-slate-800/50 rounded p-3 mb-3 font-mono">
                      {draft.body}
                    </div>
                    <button
                      onClick={() => handleSend(draft.id)}
                      disabled={sending === draft.id}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 rounded font-mono text-white text-sm transition-colors"
                    >
                      {sending === draft.id ? 'Sending...' : 'Send as-is'}
                    </button>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
