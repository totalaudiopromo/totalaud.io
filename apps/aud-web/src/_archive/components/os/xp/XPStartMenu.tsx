'use client'

import React from 'react'
import Link from 'next/link'
import { useThemeAudio } from '@/hooks/useThemeAudio'
import { useXPWindowStore } from './state/xpWindowStore'

interface XPStartMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function XPStartMenu({ isOpen, onClose }: XPStartMenuProps) {
  const { play } = useThemeAudio()
  const { openWindow } = useXPWindowStore()

  if (!isOpen) return null

  const handleOpenWindow = (type: 'notes' | 'processes' | 'clipboard' | 'systemInfo') => {
    openWindow(type)
    play('success')
    onClose()
  }

  const handleShutDown = () => {
    // Placeholder behaviour for now
     
    console.log('[XP] Shut Down triggered')
    play('click')
    onClose()
  }

  return (
    <div className="fixed bottom-[42px] left-2 z-[1000] w-64 rounded-t-md border border-[#9ba4b7] bg-gradient-to-b from-[#fefefe] to-[#dbe4f5] shadow-[0_0_12px_rgba(0,0,0,0.35)]">
      <div className="border-b border-[#b0bbd4] bg-gradient-to-r from-[#2563eb] via-[#3b82f6] to-[#0ea5e9] px-3 py-2 text-xs font-semibold text-white">
        XP Studio
      </div>
      <div className="px-2 py-2 text-xs text-slate-800">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-sm px-2 py-1 hover:bg-[#e5edf7]"
          onClick={() => handleOpenWindow('notes')}
        >
          <span className="h-4 w-4 rounded-sm bg-gradient-to-b from-white to-[#bfdbfe] shadow-sm" />
          <span>Flow Notes</span>
        </button>
        <button
          type="button"
          className="mt-1 flex w-full items-center gap-2 rounded-sm px-2 py-1 hover:bg-[#e5edf7]"
          onClick={() => handleOpenWindow('processes')}
        >
          <span className="h-4 w-4 rounded-sm bg-gradient-to-b from-white to-[#bbf7d0] shadow-sm" />
          <span>Agent Monitor</span>
        </button>
        <button
          type="button"
          className="mt-1 flex w-full items-center gap-2 rounded-sm px-2 py-1 hover:bg-[#e5edf7]"
          onClick={() => handleOpenWindow('clipboard')}
        >
          <span className="h-4 w-4 rounded-sm bg-gradient-to-b from-white to-[#fef9c3] shadow-sm" />
          <span>Clipboard</span>
        </button>
        <button
          type="button"
          className="mt-1 flex w-full items-center gap-2 rounded-sm px-2 py-1 hover:bg-[#e5edf7]"
          onClick={() => handleOpenWindow('systemInfo')}
        >
          <span className="h-4 w-4 rounded-sm bg-gradient-to-b from-white to-[#e0f2fe] shadow-sm" />
          <span>System Info</span>
        </button>

        <div className="mt-2 h-px bg-gradient-to-r from-transparent via-[#9ca3af] to-transparent" />

        <Link
          href="/os/ascii"
          className="mt-2 flex w-full items-center gap-2 rounded-sm px-2 py-1 text-xs hover:bg-[#e5edf7]"
          onClick={() => {
            play('click')
            onClose()
          }}
        >
          <span className="h-4 w-4 rounded-sm bg-gradient-to-b from-white to-[#facc15] shadow-sm" />
          <span>ASCII Mode</span>
        </Link>

        <button
          type="button"
          className="mt-1 flex w-full items-center gap-2 rounded-sm px-2 py-1 text-xs text-slate-500"
          disabled
        >
          <span className="h-4 w-4 rounded-sm bg-gradient-to-b from-[#e5e7eb] to-[#d1d5db] shadow-inner" />
          <span>Aqua Mode (coming soon)</span>
        </button>

        <div className="mt-2 h-px bg-gradient-to-r from-transparent via-[#9ca3af] to-transparent" />

        <button
          type="button"
          className="mt-2 flex w-full items-center justify-between rounded-sm bg-gradient-to-r from-[#fecaca] to-[#f87171] px-2 py-1 text-[11px] font-semibold text-white hover:brightness-105"
          onClick={handleShutDown}
        >
          <span>Shut Down…</span>
        </button>
      </div>
    </div>
  )
}
