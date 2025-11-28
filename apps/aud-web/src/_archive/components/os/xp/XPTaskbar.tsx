'use client'

import React, { useEffect, useState } from 'react'
import { XPStartButton } from './XPStartButton'
import { XPTaskbarWindowIcon } from './XPTaskbarWindowIcon'
import { useXPWindowStore } from './state/xpWindowStore'

interface XPTaskbarProps {
  onToggleStartMenu: () => void
}

/**
 * XP-style taskbar with Start button, live clock, and window icons
 */
export function XPTaskbar({ onToggleStartMenu }: XPTaskbarProps) {
  const [time, setTime] = useState(() => new Date())
  const { windows, focusedWindowId } = useXPWindowStore()

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formattedTime = time.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-[42px] border-t border-[#b0b8c8] bg-gradient-to-t from-[#C8D0E0] to-[#E4E8F0] shadow-[0_-1px_0_rgba(255,255,255,0.8),0_-2px_6px_rgba(0,0,0,0.18)]"
      style={{
        backdropFilter: 'blur(6px)',
      }}
    >
      <div className="flex h-full items-center justify-between px-3">
        <div className="flex items-center gap-3">
          <XPStartButton onClick={onToggleStartMenu} />
          <div className="flex items-center gap-1">
            {windows.map((w) => (
              <XPTaskbarWindowIcon key={w.id} window={w} isFocused={focusedWindowId === w.id} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-800">
          <div className="rounded-sm border border-[#9ba4b7] bg-gradient-to-b from-white to-[#d5dbe8] px-2 py-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)]">
            <span className="tabular-nums">{formattedTime}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
