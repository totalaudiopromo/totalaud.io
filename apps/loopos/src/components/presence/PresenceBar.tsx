'use client'

import { Users } from 'lucide-react'
import { usePresence } from '@/hooks/usePresence'

interface PresenceBarProps {
  workspaceId: string
  userId: string
}

export function PresenceBar({ workspaceId, userId }: PresenceBarProps) {
  const { participants, loading } = usePresence(workspaceId, userId)

  if (loading) {
    return (
      <div className="flex items-centre gap-2 px-3 py-2 border-l border-border/50">
        <Users className="w-4 h-4 text-foreground/40" />
        <span className="text-sm text-foreground/40">Loading...</span>
      </div>
    )
  }

  const activeCount = participants.filter((p) => p.user_id !== userId).length + 1

  return (
    <div className="flex items-centre gap-3 px-3 py-2 border-l border-border/50">
      <div className="flex items-centre gap-2">
        <Users className="w-4 h-4 text-foreground/60" />
        <span className="text-sm text-foreground/80">
          {activeCount} {activeCount === 1 ? 'online' : 'online'}
        </span>
      </div>

      <div className="flex items-centre -space-x-2">
        {participants.map((participant) => (
          <div
            key={participant.user_id}
            className="relative w-8 h-8 rounded-full border-2 border-background flex items-centre justify-centre text-xs font-medium"
            style={{
              backgroundColor: participant.colour,
              color: '#0F1113',
            }}
            title={participant.display_name}
          >
            {participant.display_name.charAt(0).toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  )
}
