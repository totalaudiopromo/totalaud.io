'use client'

import React, { useState } from 'react'

export function XPNotesApp() {
  const [value, setValue] = useState('')

  return (
    <div className="flex h-full flex-col gap-2 text-xs text-slate-800">
      <p className="text-[11px] text-slate-600">
        Capture quick ideas while you&apos;re in flow. Notes stay local to this session.
      </p>
      <textarea
        className="min-h-[180px] w-full flex-1 resize-none rounded border border-[#cbd5e1] bg-white/90 px-2 py-1 text-xs outline-none ring-0 focus:border-[#3b82f6]"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type your release plan, campaign ideas, or targets…"
      />
    </div>
  )
}


