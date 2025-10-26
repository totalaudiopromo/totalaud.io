/**
 * Presence Avatars Component
 *
 * Stage 8.5: Shared Session UX & Multi-User QA
 * Shows active collaborators with theme-colored borders and polished animations.
 *
 * Features:
 * - Stacked avatars with overlap (−8px)
 * - Theme-colored borders (ASCII cyan, XP blue, etc.)
 * - Fade/scale on join/leave (120ms easeOutSoft)
 * - Action glow on collaborator activity
 * - Tooltip showing name + theme + mode
 * - Max 5 visible, "+N more" indicator
 * - Click to expand full list
 * - Smooth stagger prevents jitter with >5 avatars
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Collaborator } from '@/lib/realtimePresence'

interface PresenceAvatarsProps {
  collaborators: Collaborator[]
  maxVisible?: number
  onCollaboratorClick?: (collaborator: Collaborator) => void
  className?: string
  /** Collaborator IDs that recently performed an action (show glow effect) */
  recentActions?: string[]
}

// Theme colors for avatar borders
const themeColors: Record<string, string> = {
  ascii: '#3AA9BE', // Slate Cyan (updated)
  xp: '#0078D7', // Blue
  aqua: '#007AFF', // Blue
  daw: '#FF6B35', // Orange
  analogue: '#D4A574', // Warm brown
}

// Get initials from name or email
function getInitials(name?: string, email?: string): string {
  if (name) {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  if (email) {
    return email.slice(0, 2).toUpperCase()
  }

  return '??'
}

// Format mode for display
function formatMode(mode: string): string {
  return mode.charAt(0).toUpperCase() + mode.slice(1)
}

// Format theme for display
function formatTheme(theme: string): string {
  return theme.toUpperCase()
}

export function PresenceAvatars({
  collaborators,
  maxVisible = 5,
  onCollaboratorClick,
  className = '',
  recentActions = [],
}: PresenceAvatarsProps) {
  const [showAll, setShowAll] = useState(false)
  const [glowingAvatars, setGlowingAvatars] = useState<Set<string>>(new Set())

  // Only show active collaborators
  const activeCollaborators = collaborators.filter((c) => c.is_active)
  const visibleCollaborators = showAll
    ? activeCollaborators
    : activeCollaborators.slice(0, maxVisible)
  const remainingCount = Math.max(0, activeCollaborators.length - maxVisible)

  // Handle action glow effect (1.5s duration)
  useEffect(() => {
    if (recentActions.length > 0) {
      setGlowingAvatars(new Set(recentActions))
      const timer = setTimeout(() => {
        setGlowingAvatars(new Set())
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [recentActions])

  if (activeCollaborators.length === 0) {
    return null
  }

  return (
    <div className={`relative flex items-center ${className}`}>
      {/* Stacked avatars */}
      <div className="flex items-center">
        <AnimatePresence mode="popLayout">
          {visibleCollaborators.map((collaborator, index) => {
            const initials = getInitials(collaborator.user_name, collaborator.user_email)
            const borderColor = themeColors[collaborator.theme] || '#3AA9BE' // Fallback to Slate Cyan
            const isGlowing = glowingAvatars.has(collaborator.user_id)

            return (
              <motion.div
                key={collaborator.user_id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: -index * 8, // Stack with −8px overlap
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  duration: 0.12, // 120ms as specified
                  ease: [0.25, 0.1, 0.25, 1], // easeOutSoft cubic-bezier
                  delay: index * 0.02, // 20ms stagger to prevent jitter
                }}
                style={{
                  zIndex: visibleCollaborators.length - index,
                }}
                className="relative"
              >
                {/* Avatar button */}
                <motion.button
                  onClick={() => {
                    if (onCollaboratorClick) {
                      onCollaboratorClick(collaborator)
                    }
                  }}
                  animate={{
                    boxShadow: isGlowing
                      ? [
                          `0 0 8px ${borderColor}40`,
                          `0 0 20px ${borderColor}FF, 0 0 40px ${borderColor}80`,
                          `0 0 8px ${borderColor}40`,
                        ]
                      : `0 0 8px ${borderColor}40`,
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: isGlowing ? 1 : 0,
                    ease: 'easeInOut',
                  }}
                  className="
                    relative w-10 h-10 rounded-full
                    bg-[#0F1419] text-[#3AA9BE]
                    flex items-center justify-center
                    font-mono text-xs font-semibold
                    cursor-pointer
                    transition-transform duration-100
                    hover:scale-110 hover:z-50
                    focus:outline-none focus:ring-2 focus:ring-[#3AA9BE] focus:ring-offset-2 focus:ring-offset-[#0A0E12]
                  "
                  style={{
                    border: `2px solid ${borderColor}`,
                  }}
                  aria-label={`${collaborator.user_name || collaborator.user_email} - ${formatTheme(collaborator.theme)}`}
                  title={`${collaborator.user_name || collaborator.user_email}\n${formatTheme(collaborator.theme)} theme\n${formatMode(collaborator.mode)} mode`}
                >
                  {initials}

                  {/* Active indicator dot */}
                  {collaborator.is_active && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.12, ease: [0.25, 0.1, 0.25, 1] }}
                      className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-[#0F1419]"
                      style={{
                        boxShadow: '0 0 4px rgba(74, 222, 128, 0.5)',
                      }}
                    />
                  )}
                </motion.button>

                {/* Tooltip (enhanced on hover) */}
                <div
                  className="
                  absolute top-full mt-2 left-1/2 -translate-x-1/2
                  opacity-0 pointer-events-none
                  group-hover:opacity-100 group-hover:pointer-events-auto
                  transition-opacity duration-150
                  bg-[#0F1419] border border-[#1E2933] rounded-lg
                  px-3 py-2 whitespace-nowrap
                  text-xs text-[#9CA3AF] font-mono
                  z-50
                "
                >
                  <div className="font-semibold text-[#3AA9BE] mb-1">
                    {collaborator.user_name || collaborator.user_email}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: borderColor }}
                    />
                    <span>{formatTheme(collaborator.theme)}</span>
                  </div>
                  <div className="text-[#6B7280]">{formatMode(collaborator.mode)} mode</div>

                  {/* Tooltip arrow */}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0F1419] border-l border-t border-[#1E2933] rotate-45" />
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* "+N more" indicator */}
        {!showAll && remainingCount > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: -visibleCollaborators.length * 8,
            }}
            transition={{
              duration: 0.12,
              ease: [0.25, 0.1, 0.25, 1],
              delay: visibleCollaborators.length * 0.02,
            }}
            onClick={() => setShowAll(true)}
            className="
              relative w-10 h-10 rounded-full
              bg-[#0F1419] text-[#6B7280]
              border-2 border-[#1E2933]
              flex items-center justify-center
              font-mono text-xs font-semibold
              cursor-pointer
              transition-all duration-100
              hover:scale-110 hover:text-[#3AA9BE] hover:border-[#3AA9BE]
              focus:outline-none focus:ring-2 focus:ring-[#3AA9BE]
            "
            style={{
              zIndex: 0,
            }}
            aria-label={`Show ${remainingCount} more collaborators`}
          >
            +{remainingCount}
          </motion.button>
        )}

        {/* "Show less" button */}
        {showAll && activeCollaborators.length > maxVisible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: -visibleCollaborators.length * 8,
            }}
            transition={{
              duration: 0.12,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            onClick={() => setShowAll(false)}
            className="
              relative w-10 h-10 rounded-full
              bg-[#0F1419] text-[#6B7280]
              border-2 border-[#1E2933]
              flex items-center justify-center
              font-mono text-xs font-semibold
              cursor-pointer
              transition-all duration-100
              hover:scale-110 hover:text-[#3AA9BE] hover:border-[#3AA9BE]
              focus:outline-none focus:ring-2 focus:ring-[#3AA9BE]
            "
            style={{
              zIndex: 0,
            }}
            aria-label="Show fewer collaborators"
          >
            ←
          </motion.button>
        )}
      </div>
    </div>
  )
}
