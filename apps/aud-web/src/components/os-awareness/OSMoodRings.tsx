'use client'

/**
 * OS Mood Rings
 * Peripheral awareness of activity across all OS personalities
 */

import { motion } from 'framer-motion'
import { useTimeline, useCards, useCampaignMeta } from '@totalaud/os-state/campaign'
import type { ThemeId } from '@totalaud/os-state/campaign'
import { useState } from 'react'

const OS_COLOURS: Record<ThemeId, string> = {
  ascii: '#00ff99',
  xp: '#3478f6',
  aqua: '#3b82f6',
  daw: '#ff8000',
  analogue: '#ff1aff',
}

const OS_LABELS: Record<ThemeId, string> = {
  ascii: 'ASCII',
  xp: 'XP',
  aqua: 'Aqua',
  daw: 'DAW',
  analogue: 'Analogue',
}

interface OSActivity {
  clips: number
  cards: number
  lastActive: Date
}

export function OSMoodRings() {
  const { timeline } = useTimeline()
  const { cards } = useCards()
  const { meta, setTheme } = useCampaignMeta()
  const [hoveredOS, setHoveredOS] = useState<ThemeId | null>(null)

  // Calculate activity metrics
  const getOSActivity = (osId: ThemeId): OSActivity => {
    // For this implementation, we'll use the global timeline and cards
    // In a full implementation, each OS would track its own activity
    return {
      clips: timeline.clips.length,
      cards: cards.cards.length,
      lastActive: new Date(),
    }
  }

  const osIds: ThemeId[] = ['ascii', 'xp', 'aqua', 'daw', 'analogue']

  return (
    <motion.div
      className="fixed bottom-4 right-4 z-50"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.24 }}
    >
      <div className="relative flex gap-2">
        {osIds.map((osId) => {
          const activity = getOSActivity(osId)
          const isActive = osId === meta.currentTheme
          const activityLevel = Math.min(
            (activity.clips + activity.cards) / 10,
            1
          )

          return (
            <motion.button
              key={osId}
              className="group relative"
              onMouseEnter={() => setHoveredOS(osId)}
              onMouseLeave={() => setHoveredOS(null)}
              onClick={() => setTheme(osId)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Ring */}
              <div
                className={`relative h-12 w-12 rounded-full border-2 transition-all ${
                  isActive
                    ? 'border-4 shadow-lg'
                    : 'border-opacity-50 hover:border-opacity-100'
                }`}
                style={{
                  borderColor: OS_COLOURS[osId],
                  backgroundColor: isActive
                    ? `${OS_COLOURS[osId]}20`
                    : 'transparent',
                  boxShadow: isActive
                    ? `0 0 20px ${OS_COLOURS[osId]}40`
                    : 'none',
                }}
              >
                {/* Activity pulse */}
                {activityLevel > 0 && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      backgroundColor: OS_COLOURS[osId],
                      opacity: 0.2,
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}

                {/* OS indicator dot */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: OS_COLOURS[osId] }}
                  />
                </div>

                {/* Activity count badge */}
                {(activity.clips > 0 || activity.cards > 0) && (
                  <div className="absolute -right-1 -top-1 flex h-5 w-5 items-centre justify-centre rounded-full bg-[var(--flowcore-colour-bg)] font-mono text-[10px] font-bold">
                    <span style={{ color: OS_COLOURS[osId] }}>
                      {activity.clips + activity.cards}
                    </span>
                  </div>
                )}
              </div>

              {/* Tooltip */}
              {hoveredOS === osId && (
                <motion.div
                  className="absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-lg border border-[var(--flowcore-colour-border)] bg-[var(--flowcore-overlay-strong)] px-3 py-2 shadow-lg"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.12 }}
                >
                  <div className="font-mono text-xs font-semibold text-[var(--flowcore-colour-fg)]">
                    {OS_LABELS[osId]} OS
                  </div>
                  <div className="mt-1 space-y-0.5 font-mono text-[10px] text-[var(--flowcore-colour-fg)]/70">
                    <div>{activity.clips} clips</div>
                    <div>{activity.cards} cards</div>
                  </div>
                  {!isActive && (
                    <div className="mt-2 font-mono text-[10px] text-[var(--flowcore-colour-accent)]">
                      Click to switch
                    </div>
                  )}
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
