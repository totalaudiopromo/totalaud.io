'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle, RefreshCw, Clock } from 'lucide-react'
import type { AgentAction } from '@/agents/types'

interface DailyActionsProps {
  actions: AgentAction[]
  onRegenerate: () => void
  isLoading?: boolean
}

export function DailyActions({
  actions,
  onRegenerate,
  isLoading = false,
}: DailyActionsProps) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  const toggleComplete = (id: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-500'
      case 'high':
        return 'text-orange-500'
      case 'medium':
        return 'text-yellow-500'
      case 'low':
        return 'text-green-500'
      default:
        return 'text-foreground/50'
    }
  }

  return (
    <div className="rounded-lg border border-foreground/10 bg-background/50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Today's Actions</h3>
        <button
          onClick={onRegenerate}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-md border border-foreground/10 px-3 py-1.5 text-sm transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
          />
          Regenerate
        </button>
      </div>

      {actions.length === 0 ? (
        <p className="text-sm text-foreground/50">
          No actions yet. Click "Regenerate" to generate AI-powered daily
          actions.
        </p>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {actions.map((action, index) => {
              const isCompleted = completedIds.has(action.id)

              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className={`group rounded-lg border border-foreground/10 p-4 transition-all hover:border-accent/50 ${
                    isCompleted ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleComplete(action.id)}
                      className="mt-0.5 transition-colors hover:text-accent"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-accent" />
                      ) : (
                        <Circle className="h-5 w-5 text-foreground/30" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <h4
                          className={`font-medium ${isCompleted ? 'line-through' : ''}`}
                        >
                          {action.title}
                        </h4>
                        <span
                          className={`shrink-0 text-xs font-semibold uppercase ${getPriorityColor(action.priority)}`}
                        >
                          {action.priority}
                        </span>
                      </div>

                      <p className="mb-2 text-sm text-foreground/70">
                        {action.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-foreground/50">
                        {action.estimatedTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {action.estimatedTime}
                          </div>
                        )}
                        {action.category && (
                          <div className="rounded-full bg-foreground/5 px-2 py-0.5">
                            {action.category}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
