'use client'

import React, { useEffect, useState } from 'react'
import { useOS } from '@/components/os/navigation'

interface ViewportInfo {
  width: number
  height: number
}

export function XPSystemInfoApp() {
  const { currentOS } = useOS()
  const [viewport, setViewport] = useState<ViewportInfo | null>(null)
  const [uptimeSeconds, setUptimeSeconds] = useState(0)

  useEffect(() => {
    const syncViewport = () => {
      if (typeof window === 'undefined') return
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    syncViewport()

    window.addEventListener('resize', syncViewport)
    return () => window.removeEventListener('resize', syncViewport)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setUptimeSeconds((value) => value + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    if (typeof window !== 'undefined') {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
    setUptimeSeconds(0)
  }

  const uptimeLabel = `${uptimeSeconds}s`

  return (
    <div className="flex h-full flex-col gap-2 text-xs text-slate-800">
      <p className="text-[11px] text-slate-600">
        Quick snapshot of what this XP surface knows about your current session. All local, no
        tracking.
      </p>

      <div className="space-y-2 rounded border border-[#cbd5e1] bg-white/85 px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Current OS</span>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-900">
            {currentOS?.name ?? 'unknown'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Viewport</span>
          <span className="font-mono text-[11px] text-slate-900">
            {viewport ? `${viewport.width} × ${viewport.height}` : '…'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500">XP uptime</span>
          <span className="font-mono text-[11px] text-slate-900">{uptimeLabel}</span>
        </div>
      </div>

      <div className="mt-1 flex items-center justify-between">
        <button
          type="button"
          onClick={handleRefresh}
          className="rounded border border-[#3b82f6]/80 bg-[#dbeafe] px-2 py-1 text-[11px] font-medium text-[#1d4ed8] shadow-sm hover:bg-[#bfdbfe]"
        >
          Refresh snapshot
        </button>
        <span className="text-[10px] text-slate-500">Great for debugging / screen sharing.</span>
      </div>
    </div>
  )
}
