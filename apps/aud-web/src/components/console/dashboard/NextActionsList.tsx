'use client'

import { Card } from '../ui/Card'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircleIcon, PlayCircleIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

interface NextActionsListProps {
  actions: Array<{
    id: string
    action: string
    priority: 'high' | 'medium' | 'low'
    category: string
  }>
}

export function NextActionsList({ actions: initialActions }: NextActionsListProps) {
  const [complete, setComplete] = useState<string[]>([])

  const handleComplete = (id: string) => {
    if (complete.includes(id)) return

    // Optimistic UI update - mark as complete immediately
    setComplete((prev) => [...prev, id])

    // Here we would typically trigger an API call
    // await completeAction(id)
  }

  const priorityColor = (priority: string) => {
    if (priority === 'high') return 'bg-red-500 shadow-red-500/20'
    if (priority === 'medium') return 'bg-yellow-500 shadow-yellow-500/20'
    return 'bg-ta-cyan shadow-ta-cyan/20'
  }

  // Filter out completed actions for the list, but keep track of them
  const visibleActions = initialActions.filter((a) => !complete.includes(a.id))
  const completedCount = complete.length

  return (
    <Card className="h-full bg-[#161A1D] border border-white/5 flex flex-col">
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
            <PlayCircleIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-ta-white tracking-tight leading-none">
              Next Actions
            </h3>
            <p className="text-xs text-ta-grey mt-1">Focus on these tasks to improve coverage</p>
          </div>
        </div>

        {completedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-xs font-medium text-green-400"
          >
            {completedCount} completed
          </motion.div>
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {visibleActions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center p-8 border border-dashed border-white/5 rounded-2xl bg-white/[0.02] text-center"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <CheckCircleIcon className="w-6 h-6 text-ta-grey/50" />
              </div>
              <p className="text-sm text-ta-white font-medium">All caught up!</p>
              <p className="text-xs text-ta-grey mt-1">No pending actions for your campaigns.</p>
            </motion.div>
          ) : (
            visibleActions.map((item, i) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{
                  opacity: 0,
                  x: 30,
                  transition: { duration: 0.2 },
                }}
                transition={{ delay: i * 0.05 }}
                className="group relative flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer"
                onClick={() => handleComplete(item.id)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {/* Custom Checkbox */}
                <div className="mt-1 flex-shrink-0 relative w-5 h-5 rounded-full border border-ta-grey/30 group-hover:border-ta-cyan transition-colors overflow-hidden bg-[#0A0B0C]">
                  <div className="absolute inset-0 bg-ta-cyan opacity-0 group-hover:opacity-10 transition-opacity" />
                  <CheckCircleIcon className="w-full h-full text-ta-black opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 transition-all duration-300" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-1.5">
                    <p className="text-sm font-medium text-ta-white leading-snug group-hover:text-white transition-colors">
                      {item.action}
                    </p>

                    {/* Priority Dot */}
                    <div
                      className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] flex-shrink-0 mt-1.5 ${priorityColor(item.priority)}`}
                      title={`Priority: ${item.priority}`}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium bg-white/5 text-ta-grey group-hover:bg-white/10 transition-colors border border-white/5">
                      {item.category}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </Card>
  )
}
