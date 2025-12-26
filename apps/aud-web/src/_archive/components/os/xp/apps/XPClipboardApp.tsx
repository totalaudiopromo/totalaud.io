'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { subscribeXPClipboard } from '../state/xpClipboardBridge'

export function XPClipboardApp() {
  const [value, setValue] = useState('')

  useEffect(() => {
    const unsubscribe = subscribeXPClipboard((text, mode) => {
      if (!text) return
      if (mode === 'append') {
        setValue((previous) => (previous ? `${previous}\n${text}` : text))
        return
      }
      setValue(text)
    })

    return unsubscribe
  }, [])

  const lastLine = useMemo(() => {
    if (!value.trim()) return ''
    const lines = value.split('\n').map((line) => line.trimEnd())
    for (let i = lines.length - 1; i >= 0; i -= 1) {
      if (lines[i]) return lines[i]
    }
    return ''
  }, [value])

  const handleCopyLastLine = () => {
    if (!lastLine) {
      return
    }

    console.log('[XP Clipboard] Copy last line to ASCII (stub):', lastLine)
  }

  return (
    <div className="flex h-full flex-col gap-2 text-xs text-slate-800">
      <p className="text-[11px] text-slate-600">
        Temporary scratchpad for hooks, subject lines, and phrasing you don&apos;t want to lose.
        Lives only in this XP session.
      </p>

      <textarea
        className="min-h-[140px] w-full flex-1 resize-none rounded border border-[#cbd5e1] bg-white/90 px-2 py-1 text-xs outline-none ring-0 focus:border-[#22c55e]"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Paste rough copy, playlists, or interesting lines here…"
      />

      <div className="mt-1 flex items-center justify-between gap-2 text-[11px]">
        <button
          type="button"
          onClick={handleCopyLastLine}
          className="rounded border border-[#22c55e]/70 bg-[#bbf7d0]/60 px-2 py-1 text-[11px] font-medium text-[#166534] shadow-sm hover:bg-[#86efac]"
          disabled={!lastLine}
        >
          Copy last line to ASCII (stub)
        </button>
        <span className="text-[10px] text-slate-500">
          {lastLine
            ? `Last line: “${lastLine.slice(0, 40)}${lastLine.length > 40 ? '…' : ''}`
            : 'No lines yet'}
        </span>
      </div>
    </div>
  )
}
