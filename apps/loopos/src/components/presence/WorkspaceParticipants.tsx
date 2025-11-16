'use client'

import { useState } from 'react'
import { Users, X, Circle } from 'lucide-react'
import { usePresence } from '@/hooks/usePresence'
import { motion, AnimatePresence } from 'framer-motion'

interface WorkspaceParticipantsProps {
  workspaceId: string
  userId: string
}

export function WorkspaceParticipants({
  workspaceId,
  userId,
}: WorkspaceParticipantsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { participants, loading } = usePresence(workspaceId, userId)

  const activeCount = participants.filter((p) => p.user_id !== userId).length + 1

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-centre gap-2 px-3 py-2 rounded hover:bg-accent/5 transition-colours"
      >
        <Users className="w-4 h-4" />
        <span className="text-sm">{activeCount}</span>
      </button>

      {/* Participants Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background border border-border rounded-lg shadow-xl z-50"
            >
              {/* Header */}
              <div className="flex items-centre justify-between p-4 border-b border-border">
                <div className="flex items-centre gap-2">
                  <Users className="w-5 h-5 text-accent" />
                  <h2 className="text-lg font-semibold">
                    Workspace Participants
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:bg-accent/10 transition-colours"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Participants List */}
              <div className="p-4 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-centre text-foreground/60 py-8">
                    Loading participants...
                  </div>
                ) : participants.length === 0 ? (
                  <div className="text-centre text-foreground/60 py-8">
                    No active participants
                  </div>
                ) : (
                  <div className="space-y-2">
                    {participants.map((participant) => {
                      const isCurrentUser = participant.user_id === userId

                      return (
                        <div
                          key={participant.user_id}
                          className="flex items-centre gap-3 p-3 rounded-lg border border-border/50 hover:border-accent/20 transition-colours"
                        >
                          {/* Avatar */}
                          <div
                            className="w-10 h-10 rounded-full flex items-centre justify-centre text-sm font-semibold"
                            style={{
                              backgroundColor: participant.colour,
                              color: '#0F1113',
                            }}
                          >
                            {participant.display_name.charAt(0).toUpperCase()}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-centre gap-2">
                              <p className="text-sm font-medium truncate">
                                {participant.display_name}
                                {isCurrentUser && (
                                  <span className="text-xs text-foreground/60 ml-2">
                                    (you)
                                  </span>
                                )}
                              </p>
                            </div>
                            {participant.current_page && (
                              <p className="text-xs text-foreground/60 truncate">
                                {participant.current_page}
                              </p>
                            )}
                          </div>

                          {/* Status Indicator */}
                          <div className="flex items-centre gap-1">
                            <Circle
                              className="w-2 h-2 fill-green-500 text-green-500"
                            />
                            <span className="text-xs text-foreground/60">
                              Online
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
