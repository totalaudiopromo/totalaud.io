/**
 * SendPitchPanel
 *
 * Send the pitch from the artist's own Gmail inbox (Phase 6,
 * docs/ROADMAP_2026.md). The panel only appears when the deployment has
 * Google OAuth configured; the send only happens when the artist presses
 * the button — nothing auto-sends, and replies land in their own inbox.
 */

'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const NORMAL_TRANSITION = { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const }

interface GmailStatus {
  configured: boolean
  connected: boolean
  email: string | null
}

interface SendPitchPanelProps {
  /** The assembled pitch draft, used to prefill the message body */
  draft: string
}

export function SendPitchPanel({ draft }: SendPitchPanelProps) {
  const [status, setStatus] = useState<GmailStatus | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sendKey, setSendKey] = useState<string>('')
  const [sending, setSending] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void fetch('/api/integrations/gmail/status')
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: GmailStatus | null) => {
        if (!cancelled && payload) setStatus(payload)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])

  const openForm = () => {
    setBody(draft)
    setSendKey(crypto.randomUUID())
    setSentTo(null)
    setError(null)
    setIsOpen(true)
  }

  const send = async () => {
    setSending(true)
    setError(null)
    try {
      const response = await fetch('/api/pitch/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body, idempotency_key: sendKey }),
      })
      const payload = (await response.json()) as { sent?: boolean; error?: string }
      if (!response.ok || !payload.sent) {
        setError(payload.error ?? 'The send did not go through — try again.')
        return
      }
      setSentTo(to)
      setIsOpen(false)
      setTo('')
      setSubject('')
    } catch {
      setError('The send did not go through — try again.')
    } finally {
      setSending(false)
    }
  }

  // Deployment has no Google OAuth, or status has not loaded: stay out of the way
  if (!status?.configured) return null

  const inputClasses =
    'w-full rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2 text-sm text-ta-white placeholder:text-ta-white/25 focus:border-ta-cyan/40 focus:outline-none transition-colors'

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={NORMAL_TRANSITION}
      className="mt-8 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3"
      aria-label="Send this pitch"
    >
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-ta-white">Send it from your own inbox</h3>
        <p className="text-xs text-ta-grey leading-relaxed">
          {status.connected
            ? `Connected as ${status.email}. Replies land in your own inbox, like every email you send.`
            : 'Connect Gmail once and pitches go out from your own address — nothing sends without you pressing the button.'}
        </p>
      </div>

      {!status.connected && (
        <a
          href="/api/integrations/gmail/connect"
          className="inline-block px-4 py-2.5 rounded-lg border border-ta-cyan/30 text-ta-cyan text-xs font-medium hover:border-ta-cyan/60 transition-colors"
        >
          Connect Gmail
        </a>
      )}

      {status.connected && !isOpen && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={openForm}
            disabled={draft.trim().length === 0}
            className="px-4 py-2.5 rounded-lg bg-ta-cyan text-ta-black text-xs font-medium hover:bg-ta-cyan/90 transition-colors disabled:opacity-40"
          >
            Write the email
          </button>
          {draft.trim().length === 0 && (
            <span className="text-xs text-ta-white/35">The draft above becomes the email.</span>
          )}
          {sentTo && <span className="text-xs text-ta-cyan/80">Sent to {sentTo}.</span>}
        </div>
      )}

      {status.connected && isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={NORMAL_TRANSITION}
          className="space-y-2.5"
        >
          <input
            type="email"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            placeholder="Who is this going to?"
            aria-label="Recipient email address"
            className={inputClasses}
          />
          <input
            type="text"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Subject"
            aria-label="Email subject"
            className={inputClasses}
          />
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={8}
            aria-label="Email body"
            className={`${inputClasses} resize-y font-sans leading-relaxed`}
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => void send()}
              disabled={sending || !to || !subject || !body.trim()}
              className="px-4 py-2.5 rounded-lg bg-ta-cyan text-ta-black text-xs font-medium hover:bg-ta-cyan/90 transition-colors disabled:opacity-40"
            >
              {sending ? 'Sending…' : 'Send from my inbox'}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-ta-grey hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
          {error && <p className="text-xs text-ta-white/50 leading-relaxed">{error}</p>}
        </motion.div>
      )}
    </motion.section>
  )
}
