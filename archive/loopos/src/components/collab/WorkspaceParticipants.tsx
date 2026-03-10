'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Users, Circle, Clock } from 'lucide-react'
import { usePresence } from '@/hooks/usePresence'
import {
  isParticipantIdle,
  getLocationCounts,
  type PresenceParticipant,
  type PresenceLocation,
} from '@/lib/realtime/presence'
import { formatDistanceToNow } from 'date-fns'

interface WorkspaceParticipantsProps {
  workspaceId: string
  currentLocation: PresenceLocation
}

/**
 * Detailed workspace participants panel
 * Shows all online users with their current location and activity
 */
export function WorkspaceParticipants({
  workspaceId,
  currentLocation,
}: WorkspaceParticipantsProps) {
  const { participants, isConnected, participantCount } = usePresence({
    workspaceId,
    location: currentLocation,
  })

  const locationCounts = getLocationCounts(participants)
  const sortedParticipants = [...participants].sort((a, b) => {
    // Sort by: not idle first, then by last active time
    const aIdle = isParticipantIdle(a)
    const bIdle = isParticipantIdle(b)

    if (aIdle !== bIdle) {
      return aIdle ? 1 : -1
    }

    return new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
  })

  return (
    <div className="w-full max-w-sm bg-background border border-border rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-background/50">
        <div className="flex items-centre justify-between">
          <div className="flex items-centre gap-2">
            <Users size={18} className="text-accent" />
            <h3 className="font-semibold text-foreground">Workspace Activity</h3>
          </div>
          <div className="flex items-centre gap-1.5">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-foreground/20'
              }`}
            />
            <span className="text-xs text-foreground/60">
              {participantCount} {participantCount === 1 ? 'person' : 'people'}
            </span>
          </div>
        </div>
      </div>

      {/* Participants list */}
      <div className="max-h-96 overflow-y-auto">
        <AnimatePresence>
          {sortedParticipants.map((participant) => (
            <ParticipantRow key={participant.userId} participant={participant} />
          ))}
        </AnimatePresence>

        {participantCount === 0 && (
          <div className="px-4 py-8 text-centre text-foreground/40">
            <Users size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No one else is online</p>
          </div>
        )}
      </div>

      {/* Location breakdown */}
      {participantCount > 0 && (
        <div className="px-4 py-3 border-t border-border bg-background/30">
          <div className="text-xs font-medium text-foreground/60 mb-2">Active Locations</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(locationCounts)
              .filter(([, count]) => count > 0)
              .map(([location, count]) => (
                <LocationBadge
                  key={location}
                  location={location as PresenceLocation}
                  count={count}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface ParticipantRowProps {
  participant: PresenceParticipant
}

function ParticipantRow({ participant }: ParticipantRowProps) {
  const idle = isParticipantIdle(participant)
  const lastActive = formatDistanceToNow(new Date(participant.lastActiveAt), {
    addSuffix: true,
  })

  const initials = participant.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <motion.div
      className="px-4 py-3 border-b border-border/50 last:border-b-0 hover:bg-accent/5 transition-colours"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex items-centre gap-3">
        {/* Avatar */}
        <div
          className="relative flex items-centre justify-centre w-10 h-10 rounded-full text-sm font-semibold shadow-md"
          style={{
            backgroundColor: participant.colour,
            color: '#FFFFFF',
            opacity: idle ? 0.5 : 1,
          }}
        >
          {initials}
          {!idle && (
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background"
              style={{ backgroundColor: participant.colour }}
            />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-foreground truncate">
            {participant.displayName}
          </div>
          <div className="flex items-centre gap-1.5 text-xs text-foreground/60 mt-0.5">
            <span className="capitalize">{participant.location.replace('_', ' ')}</span>
            {participant.focusNodeId && (
              <>
                <span>·</span>
                <span className="truncate">Editing node</span>
              </>
            )}
            {participant.focusSceneId && (
              <>
                <span>·</span>
                <span className="truncate">In designer</span>
              </>
            )}
          </div>
        </div>

        {/* Status */}
        {idle && (
          <div className="flex items-centre gap-1 text-xs text-foreground/40">
            <Clock size={12} />
            <span>{lastActive}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

interface LocationBadgeProps {
  location: PresenceLocation
  count: number
}

function LocationBadge({ location, count }: LocationBadgeProps) {
  const locationLabels: Record<PresenceLocation, string> = {
    dashboard: 'Dashboard',
    timeline: 'Timeline',
    designer: 'Designer',
    coach: 'Coach',
    journal: 'Journal',
    packs: 'Packs',
    playbook: 'Playbook',
    export: 'Export',
  }

  return (
    <div className="flex items-centre gap-1.5 px-2 py-1 rounded-md bg-accent/10 border border-accent/20">
      <Circle size={6} className="fill-accent text-accent" />
      <span className="text-xs font-medium text-foreground/80">{locationLabels[location]}</span>
      <span className="text-xs font-semibold text-accent">{count}</span>
    </div>
  )
}
