'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Users } from 'lucide-react'
import { usePresence } from '@/hooks/usePresence'
import { isParticipantIdle, type PresenceParticipant } from '@/lib/realtime/presence'
import { useState } from 'react'

interface PresenceBarProps {
  workspaceId: string
  location:
    | 'dashboard'
    | 'timeline'
    | 'designer'
    | 'coach'
    | 'journal'
    | 'packs'
    | 'playbook'
    | 'export'
  className?: string
}

/**
 * Presence bar showing workspace participants
 * Displays avatars with names and locations
 */
export function PresenceBar({ workspaceId, location, className = '' }: PresenceBarProps) {
  const { participants, isConnected } = usePresence({
    workspaceId,
    location,
  })
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null)

  // Filter out current user's own presence
  const otherParticipants = participants.filter(
    (p) => p.userId !== participants.find((p2) => p2.location === location)?.userId
  )

  if (!isConnected || otherParticipants.length === 0) {
    return null
  }

  return (
    <div className={`flex items-centre gap-2 ${className}`}>
      <div className="flex items-centre gap-1.5 text-xs text-foreground/60">
        <Users size={14} />
        <span>{otherParticipants.length + 1} online</span>
      </div>

      <div className="flex items-centre -space-x-2">
        <AnimatePresence>
          {otherParticipants.slice(0, 5).map((participant) => (
            <ParticipantAvatar
              key={participant.userId}
              participant={participant}
              isExpanded={expandedUserId === participant.userId}
              onToggle={() =>
                setExpandedUserId(expandedUserId === participant.userId ? null : participant.userId)
              }
            />
          ))}
        </AnimatePresence>

        {otherParticipants.length > 5 && (
          <motion.div
            className="relative flex items-centre justify-centre w-8 h-8 rounded-full bg-border border-2 border-background text-xs font-medium text-foreground/60"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            +{otherParticipants.length - 5}
          </motion.div>
        )}
      </div>
    </div>
  )
}

interface ParticipantAvatarProps {
  participant: PresenceParticipant
  isExpanded: boolean
  onToggle: () => void
}

function ParticipantAvatar({ participant, isExpanded, onToggle }: ParticipantAvatarProps) {
  const idle = isParticipantIdle(participant)
  const initials = participant.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <motion.div
      className="relative"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <motion.button
        className="relative flex items-centre justify-centre w-8 h-8 rounded-full border-2 border-background text-xs font-semibold shadow-lg cursor-pointer hover:z-10 transition-all duration-200"
        style={{
          backgroundColor: participant.colour,
          color: '#FFFFFF',
          opacity: idle ? 0.5 : 1,
        }}
        whileHover={{ scale: 1.1, zIndex: 10 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        title={`${participant.displayName} (${participant.location})`}
      >
        {initials}

        {/* Active indicator dot */}
        {!idle && (
          <motion.div
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background"
            style={{ backgroundColor: participant.colour }}
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </motion.button>

      {/* Tooltip on hover/expand */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-background border border-accent/20 rounded-lg px-3 py-2 shadow-xl">
              <div className="text-sm font-medium text-foreground">{participant.displayName}</div>
              <div className="text-xs text-foreground/60 capitalize mt-0.5">
                {participant.location.replace('_', ' ')}
              </div>
              {idle && <div className="text-xs text-foreground/40 mt-1">Idle</div>}
            </div>
            {/* Arrow */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-background border-l border-t border-accent/20" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
