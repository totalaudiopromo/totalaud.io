/**
 * AssistantTokensSection — "Bring your own assistant" (Phase 6).
 *
 * Personal access tokens for the totalaud.io MCP endpoint, so an artist's
 * own AI assistant can read their workspace. The full token is shown once
 * at creation; after that only the last four characters remain visible.
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const NORMAL_TRANSITION = { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const }

interface TokenRow {
  id: string
  label: string
  token_last4: string
  created_at: string
  last_used_at: string | null
  revoked_at: string | null
}

export function AssistantTokensSection() {
  const [tokens, setTokens] = useState<TokenRow[]>([])
  const [loading, setLoading] = useState(true)
  const [label, setLabel] = useState('')
  const [creating, setCreating] = useState(false)
  const [freshToken, setFreshToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTokens = useCallback(async () => {
    try {
      const response = await fetch('/api/tokens')
      if (!response.ok) throw new Error('load failed')
      const body = await response.json()
      setTokens(body.tokens ?? [])
    } catch {
      setError('Could not load your tokens just now.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadTokens()
  }, [loadTokens])

  const createToken = async () => {
    if (creating || !label.trim()) return
    setCreating(true)
    setError(null)
    try {
      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: label.trim() }),
      })
      const body = await response.json()
      if (!response.ok) {
        setError(typeof body.error === 'string' ? body.error : 'Could not create the token.')
        return
      }
      setFreshToken(body.token)
      setLabel('')
      await loadTokens()
    } catch {
      setError('Could not create the token just now.')
    } finally {
      setCreating(false)
    }
  }

  const revokeToken = async (id: string) => {
    setError(null)
    const previous = tokens
    setTokens(tokens.map((t) => (t.id === id ? { ...t, revoked_at: new Date().toISOString() } : t)))
    const response = await fetch(`/api/tokens/${id}`, { method: 'DELETE' })
    if (!response.ok) {
      setTokens(previous)
      setError('Could not revoke that token just now.')
    }
  }

  const copyFreshToken = async () => {
    if (!freshToken) return
    await navigator.clipboard.writeText(freshToken)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const active = tokens.filter((t) => !t.revoked_at)

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 space-y-4">
      <p className="text-[13px] text-white/60 leading-relaxed">
        Let your own AI assistant read your workspace: timeline, finishing notes, follow-ups and
        pitch drafts. Connect any MCP-capable assistant to{' '}
        <code className="font-mono text-ta-cyan/90 text-[12px]">https://totalaud.io/api/mcp</code>{' '}
        with a token below as the bearer token. Nothing can be sent on your behalf, and your audio
        never left your device in the first place.
      </p>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void createToken()
          }}
          placeholder="Name this token (e.g. Claude on my laptop)"
          maxLength={60}
          className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-[13px] text-white placeholder-white/30 focus:outline-none focus:border-ta-cyan/50 transition-colors"
        />
        <button
          onClick={() => void createToken()}
          disabled={creating || !label.trim()}
          className="px-4 py-2.5 rounded-lg bg-ta-cyan text-ta-black text-[13px] font-medium hover:bg-ta-cyan/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {creating ? 'Creating…' : 'Create token'}
        </button>
      </div>

      <AnimatePresence>
        {freshToken && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={NORMAL_TRANSITION}
            className="rounded-lg border border-ta-cyan/25 bg-ta-cyan/[0.06] p-4 space-y-2"
          >
            <p className="text-[12px] text-white/70">
              Copy this now — it will not be shown again.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-[12px] text-ta-cyan break-all">
                {freshToken}
              </code>
              <button
                onClick={() => void copyFreshToken()}
                className="px-3 py-1.5 rounded-md border border-white/15 text-[12px] text-white/70 hover:text-white hover:border-white/30 transition-colors shrink-0"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <button
              onClick={() => setFreshToken(null)}
              className="text-[11px] text-white/40 hover:text-white/70 transition-colors"
            >
              Done, hide it
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-[12px] text-red-300/80">{error}</p>}

      {loading ? (
        <p className="text-[12px] text-white/40">Loading tokens…</p>
      ) : active.length === 0 ? (
        <p className="text-[12px] text-white/40">No active tokens.</p>
      ) : (
        <ul className="space-y-2">
          {active.map((token) => (
            <li
              key={token.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-[13px] text-white/80 truncate">{token.label}</p>
                <p className="text-[11px] font-mono text-white/35">
                  …{token.token_last4} · created {token.created_at.slice(0, 10)}
                  {token.last_used_at ? ` · last used ${token.last_used_at.slice(0, 10)}` : ' · never used'}
                </p>
              </div>
              <button
                onClick={() => void revokeToken(token.id)}
                className="px-3 py-1.5 rounded-md border border-red-500/30 text-[12px] text-red-300/90 hover:bg-red-500/10 transition-colors shrink-0"
              >
                Revoke
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
