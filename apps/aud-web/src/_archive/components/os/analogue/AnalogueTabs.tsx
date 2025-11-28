'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useThemeAudio } from '@/hooks/useThemeAudio'

export type AnalogueTabId = 'Today' | 'Ideas' | 'Campaigns' | 'Notes'

interface AnalogueTabsProps {
  tabs: AnalogueTabId[]
  activeTab: AnalogueTabId
  onTabChange: (tab: AnalogueTabId) => void
}

/**
 * AnalogueTabs
 * Notebook-style tabs along the top edge
 */
export function AnalogueTabs({ tabs, activeTab, onTabChange }: AnalogueTabsProps) {
  const { play } = useThemeAudio()
  const prefersReducedMotion = useReducedMotion()

  const handleClick = (tab: AnalogueTabId) => {
    if (tab === activeTab) return
    play('click')
    onTabChange(tab)
  }

  return (
    <div className="flex flex-wrap gap-1.5 pb-3">
      {tabs.map((tab, index) => {
        const isActive = tab === activeTab
        const shape =
          index % 3 === 0
            ? 'rounded-tl-[18px] rounded-tr-[14px]'
            : index % 3 === 1
              ? 'rounded-tl-[16px] rounded-tr-[20px]'
              : 'rounded-tl-[14px] rounded-tr-[16px]'

        return (
          <motion.button
            key={tab}
            type="button"
            onClick={() => handleClick(tab)}
            className={`relative flex items-center gap-2 border border-[#e1d2bf] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] ${
              shape
            } ${
              isActive
                ? 'bg-[#f7ebda] text-[#34261a] shadow-[0_6px_0_rgba(191,155,110,0.55)]'
                : 'bg-[#f0e2cf] text-[#7a5c40] shadow-[0_3px_0_rgba(174,140,101,0.5)]'
            }`}
            style={{
              boxShadow: isActive
                ? '0 6px 0 rgba(191,155,110,0.55)'
                : '0 3px 0 rgba(174,140,101,0.5)',
            }}
            whileHover={
              prefersReducedMotion
                ? undefined
                : {
                    y: -1,
                    rotate: index % 2 === 0 ? -0.4 : 0.4,
                  }
            }
            whileTap={prefersReducedMotion ? undefined : { y: 1, scale: 0.97 }}
            transition={
              prefersReducedMotion
                ? undefined
                : {
                    type: 'spring',
                    stiffness: 260,
                    damping: 22,
                    mass: 0.6,
                  }
            }
            aria-pressed={isActive}
          >
            <span className="relative z-10">{tab}</span>
            {isActive && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-1 bottom-[-6px] h-[6px] rounded-b-[10px] bg-[#e6c9a1]"
              />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
