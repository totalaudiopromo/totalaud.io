'use client'

import React from 'react'
import { useReducedMotion, motion } from 'framer-motion'
import { useThemeAudio } from '@/hooks/useThemeAudio'
import type { XPWindowInstance } from './state/xpWindowStore'
import { useXPWindowStore } from './state/xpWindowStore'

interface XPTaskbarWindowIconProps {
  window: XPWindowInstance
  isFocused: boolean
}

export function XPTaskbarWindowIcon({ window, isFocused }: XPTaskbarWindowIconProps) {
  const prefersReducedMotion = useReducedMotion()
  const { play } = useThemeAudio()
  const { minimiseWindow, restoreWindow, focusWindow } = useXPWindowStore()

  const handleClick = () => {
    play('click')
    if (window.minimized) {
      restoreWindow(window.id)
      focusWindow(window.id)
    } else if (isFocused) {
      minimiseWindow(window.id)
    } else {
      focusWindow(window.id)
    }
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      className={`flex items-center gap-2 rounded-sm border px-2 py-1 text-xs shadow-sm ${
        isFocused ? 'border-[#4f46e5] bg-[#e0e7ff]' : 'border-[#9ba4b7] bg-[#e5edf7]'
      }`}
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              scale: 1.02,
            }
      }
      whileTap={
        prefersReducedMotion
          ? undefined
          : {
              scale: 0.97,
            }
      }
    >
      <span className="h-3 w-3 rounded-sm bg-gradient-to-b from-white to-[#cbd5f5] shadow-[0_0_2px_rgba(0,0,0,0.25)]" />
      <span className="max-w-[140px] truncate">{window.title}</span>
    </motion.button>
  )
}


