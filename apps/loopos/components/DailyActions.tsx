'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Sparkles } from 'lucide-react'
import { useLoopStore } from '@/state/loopStore'
import { useMomentumStore } from '@/momentum/momentumStore'
import { playSound } from '@/sounds/audioEngine'

export function DailyActions() {
  const { nodes, completeNode } = useLoopStore()
  const { gainMomentum, recordAction } = useMomentumStore()

  // Get today's pending actions (sorted by priority)
  const pendingActions = nodes
    .filter((node) => node.status === 'upcoming' || node.status === 'active')
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5) // Show top 5

  const handleComplete = (id: string) => {
    completeNode(id)
    gainMomentum(10)
    recordAction()
    playSound('complete', 0.3)
  }

  if (pendingActions.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-loop-cyan/20 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-loop-cyan" />
        </div>
        <h3 className="text-sm font-semibold text-loop-grey-300 mb-1">
          All done!
        </h3>
        <p className="text-xs text-loop-grey-500">
          Add new actions to keep building momentum
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-2">
      {pendingActions.map((action, index) => (
        <motion.div
          key={action.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="group"
        >
          <button
            onClick={() => handleComplete(action.id)}
            className="w-full text-left bg-loop-grey-900/50 border border-loop-grey-800 rounded-md p-3 hover:bg-loop-grey-900 hover:border-loop-grey-700 transition-all duration-120"
          >
            <div className="flex items-start gap-3">
              {/* Checkbox */}
              <div className="mt-0.5">
                <Circle
                  className="w-4 h-4 text-loop-grey-600 group-hover:text-loop-cyan transition-colours duration-120"
                  strokeWidth={2}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-loop-grey-200 mb-1">
                  {action.title}
                </h4>

                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: `${action.colour}20`,
                      color: action.colour,
                    }}
                  >
                    {action.category}
                  </span>

                  {/* Priority indicator */}
                  {action.priority >= 8 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-loop-cyan/20 text-loop-cyan">
                      High priority
                    </span>
                  )}
                </div>
              </div>

              {/* Friction indicator */}
              <div className="flex items-center gap-0.5 mt-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-3 rounded-full ${
                      i < Math.ceil(action.friction / 3.3)
                        ? 'opacity-100'
                        : 'opacity-20'
                    }`}
                    style={{ backgroundColor: action.colour }}
                  />
                ))}
              </div>
            </div>
          </button>
        </motion.div>
      ))}

      {/* AI suggestion (placeholder) */}
      <div className="mt-4 pt-4 border-t border-loop-grey-800">
        <div className="flex items-start gap-2 text-xs text-loop-grey-500">
          <Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <p>
            AI suggests: Start with &quot;{pendingActions[0]?.title}&quot; -
            it&apos;s high priority and low friction
          </p>
        </div>
      </div>
    </div>
  )
}
