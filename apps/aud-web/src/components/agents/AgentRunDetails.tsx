'use client'

import React, { useState } from 'react'
import type { AgentRun } from './AgentTypes'
import { pushXPClipboardUpdate } from '@/components/os/xp/state/xpClipboardBridge'
import { PERSONA_PRESETS } from '@/components/persona/personaPresets'

interface AgentRunDetailsProps {
  run: AgentRun | null
}

export function AgentRunDetails({ run }: AgentRunDetailsProps) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  if (!run) {
    return (
      <div className="rounded border border-slate-200 bg-white/80 px-3 py-2 text-[11px] text-slate-500">
        Select a run to inspect its input and output.
      </div>
    )
  }

  const handleCopyOutput = async () => {
    if (!run.output) {
      setStatusMessage('No output to copy yet.')
      return
    }

    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      setStatusMessage('Clipboard not available in this environment.')
      return
    }

    try {
      await navigator.clipboard.writeText(run.output)
      setStatusMessage('Output copied to clipboard.')
    } catch {
      setStatusMessage('Failed to copy output.')
    }
  }

  const handleSendToXPClipboard = () => {
    if (!run.output) {
      setStatusMessage('No output to send yet.')
      return
    }

    pushXPClipboardUpdate(run.output, 'append')
    setStatusMessage('Sent output to XP clipboard.')
  }

  const personaLabel =
    run.meta?.personaId && PERSONA_PRESETS[run.meta.personaId as keyof typeof PERSONA_PRESETS]
      ? PERSONA_PRESETS[run.meta.personaId as keyof typeof PERSONA_PRESETS].name
      : null

  const createdAtLabel = new Date(run.createdAt).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const startedAtLabel = run.startedAt
    ? new Date(run.startedAt).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '—'

  const finishedAtLabel = run.finishedAt
    ? new Date(run.finishedAt).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '—'

  return (
    <div className="space-y-3 rounded border border-slate-200 bg-white/85 px-3 py-3 text-xs text-slate-800">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-900 px-2 py-[2px] text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-50">
              {run.role}
            </span>
            <span className="text-[10px] text-slate-500">
              from {run.originOS === 'loopos' ? 'LoopOS' : run.originOS}
            </span>
            {personaLabel && (
              <span className="rounded-full bg-slate-200 px-1.5 py-[1px] text-[9px] uppercase tracking-[0.18em] text-slate-700">
                {personaLabel}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            Created at {createdAtLabel} · started {startedAtLabel} · finished {finishedAtLabel}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={handleCopyOutput}
            className="rounded border border-slate-300 bg-white px-2 py-[2px] text-[10px] text-slate-700 hover:bg-slate-100"
          >
            Copy output
          </button>
          <button
            type="button"
            onClick={handleSendToXPClipboard}
            className="rounded border border-emerald-400 bg-emerald-50 px-2 py-[2px] text-[10px] text-emerald-700 hover:bg-emerald-100"
          >
            Send to XP Clipboard
          </button>
        </div>
      </div>

      {statusMessage && (
        <p className="text-[10px] text-slate-500" aria-live="polite">
          {statusMessage}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <h3 className="text-[11px] font-semibold text-slate-700">Input</h3>
          <div className="max-h-40 overflow-y-auto rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-700">
            {run.input || <span className="text-slate-400">No input captured.</span>}
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-[11px] font-semibold text-slate-700">Output</h3>
          <div className="max-h-40 overflow-y-auto rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-700">
            {run.status === 'error' && run.errorMessage && (
              <p className="mb-1 text-[11px] text-red-600">Error: {run.errorMessage}</p>
            )}
            {run.output ? (
              run.output
            ) : (
              <span className="text-slate-400">
                {run.status === 'running' || run.status === 'queued'
                  ? 'Agent is still thinking…'
                  : 'No output generated for this run.'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


