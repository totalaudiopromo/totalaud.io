/**
 * ConsistencyCheck
 *
 * "Does this sound like you?" — checks the current pitch draft against the
 * artist's saved identity via POST /api/pitch/consistency. Observations and
 * options, never forced rewrites (docs/VISION.md §4).
 *
 * All state is local to the component; nothing touches the pitch store.
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { capture } from '@/lib/analytics'

// Normal motion token: pane transitions
const NORMAL_TRANSITION = { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const }

const MIN_DRAFT_LENGTH = 20

interface ConsistencyNote {
  observation: string
  worth_considering: string
}

interface ConsistencyResult {
  aligned: boolean
  summary: string
  notes: ConsistencyNote[]
}

type CheckState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'no_identity' }
  | { status: 'error'; message: string }
  | { status: 'ready'; check: ConsistencyResult }

function SkeletonLine({ width, delay }: { width: string; delay: number }) {
  return (
    <motion.div
      className="h-3 rounded bg-white/[0.06]"
      style={{ width }}
      animate={{ opacity: [0.4, 0.9, 0.4] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  )
}

export function ConsistencyCheck({ draft }: { draft: string }) {
  const [state, setState] = useState<CheckState>({ status: 'idle' })

  const tooShort = draft.trim().length < MIN_DRAFT_LENGTH
  const isLoading = state.status === 'loading'

  const runCheck = async () => {
    if (tooShort || isLoading) return
    setState({ status: 'loading' })

    try {
      const response = await fetch('/api/pitch/consistency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft, kind: 'pitch' }),
      })

      // Guests have no saved identity to check against
      if (response.status === 401) {
        setState({ status: 'no_identity' })
        return
      }

      const data = await response.json().catch(() => null)

      if (!response.ok || !data) {
        setState({
          status: 'error',
          message:
            typeof data?.error === 'string'
              ? data.error
              : 'The check is taking a moment, try again shortly.',
        })
        return
      }

      if (data.available === false) {
        setState({ status: 'no_identity' })
        return
      }

      const check = data.check as ConsistencyResult
      capture('consistency_checked', { aligned: check.aligned })
      setState({ status: 'ready', check })
    } catch {
      setState({
        status: 'error',
        message: 'The check could not reach us, try again shortly.',
      })
    }
  }

  return (
    <div className="mt-8 space-y-3">
      <button
        onClick={runCheck}
        disabled={tooShort || isLoading}
        title={tooShort ? 'Write a little more first' : undefined}
        className="px-3 py-2 rounded-lg border border-white/10 text-xs text-ta-grey hover:text-ta-white/80 hover:border-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Does this sound like you?
      </button>

      <AnimatePresence mode="wait">
        {state.status === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={NORMAL_TRANSITION}
            className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-2.5"
          >
            <SkeletonLine width="80%" delay={0} />
            <SkeletonLine width="65%" delay={0.15} />
            <SkeletonLine width="72%" delay={0.3} />
          </motion.div>
        )}

        {state.status === 'no_identity' && (
          <motion.div
            key="no-identity"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={NORMAL_TRANSITION}
            className="p-4 rounded-xl border border-white/5 bg-white/[0.02]"
          >
            <p className="text-xs text-ta-white/60 leading-relaxed">
              Save your identity first and this can check every draft against your story.
            </p>
          </motion.div>
        )}

        {state.status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={NORMAL_TRANSITION}
            className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-2"
          >
            <p className="text-xs text-ta-white/60 leading-relaxed">{state.message}</p>
            <button
              onClick={runCheck}
              className="text-xs text-ta-cyan hover:text-ta-cyan/80 transition-colors"
            >
              Try again
            </button>
          </motion.div>
        )}

        {state.status === 'ready' && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={NORMAL_TRANSITION}
            className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-3"
          >
            {state.check.aligned && state.check.notes.length === 0 ? (
              <p className="text-xs text-ta-white/70 leading-relaxed">
                Reads as you. No drift worth flagging.
              </p>
            ) : (
              <>
                <p className="text-xs text-ta-white/70 leading-relaxed">{state.check.summary}</p>

                <div className="space-y-2">
                  {state.check.notes.map((note, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-white/5 bg-white/[0.02] p-3 space-y-1.5"
                    >
                      <p className="text-xs text-ta-white/80 leading-relaxed">{note.observation}</p>
                      <p className="text-xs text-ta-white/50 leading-relaxed">
                        <span className="text-ta-cyan/70">Worth considering:</span>{' '}
                        {note.worth_considering}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
