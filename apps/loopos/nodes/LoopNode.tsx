'use client'

import { motion } from 'framer-motion'
import { Music, TrendingUp, BarChart3, Sparkles, Check } from 'lucide-react'
import type { LoopNode as LoopNodeType, NodeCategory } from '@/state/loopStore'

interface LoopNodeProps {
  node: LoopNodeType
  onDragStart?: () => void
  onDrag?: (x: number, y: number) => void
  onDragEnd?: () => void
  onClick?: () => void
  onComplete?: () => void
}

const categoryIcons: Record<NodeCategory, React.ComponentType<{ className?: string }>> = {
  Create: Music,
  Promote: TrendingUp,
  Analyse: BarChart3,
  Refine: Sparkles,
}

export function LoopNode({
  node,
  onDrag,
  onClick,
  onComplete,
}: LoopNodeProps) {
  const Icon = categoryIcons[node.category]
  const isCompleted = node.status === 'completed'
  const isActive = node.status === 'active'

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      onDrag={(_, info) => {
        if (onDrag) {
          onDrag(node.position.x + info.offset.x, node.position.y + info.offset.y)
        }
      }}
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        position: 'absolute',
        left: node.position.x,
        top: node.position.y,
        cursor: 'grab',
      }}
      className="touch-none"
    >
      <div
        className={`
          relative min-w-[140px] max-w-[200px] rounded-lg border-2 p-3
          transition-all duration-240 backdrop-blur-sm
          ${isCompleted ? 'opacity-60' : ''}
          ${isActive ? 'ring-2 ring-offset-2 ring-offset-loop-black' : ''}
        `}
        style={{
          borderColor: node.colour,
          backgroundColor: `${node.colour}15`,
          boxShadow: isActive
            ? `0 0 20px ${node.colour}40`
            : `0 2px 8px ${node.colour}20`,
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div
            className="rounded-md p-1.5 flex items-center justify-center"
            style={{ backgroundColor: `${node.colour}30` }}
          >
            <span style={{ color: node.colour }}>
              <Icon className="w-4 h-4" />
            </span>
          </div>

          {isCompleted && (
            <div
              className="rounded-full p-1"
              style={{ backgroundColor: node.colour }}
            >
              <Check className="w-3 h-3 text-loop-black" />
            </div>
          )}
        </div>

        {/* Title */}
        <h3
          className={`text-sm font-semibold mb-1 ${isCompleted ? 'line-through' : ''}`}
        >
          {node.title}
        </h3>

        {/* Category badge */}
        <div className="flex items-center justify-between">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: `${node.colour}20`,
              color: node.colour,
            }}
          >
            {node.category}
          </span>

          {/* Friction indicator */}
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`w-1 h-3 rounded-full ${
                  i < Math.ceil(node.friction / 3.3)
                    ? 'opacity-100'
                    : 'opacity-20'
                }`}
                style={{ backgroundColor: node.colour }}
              />
            ))}
          </div>
        </div>

        {/* Complete button */}
        {!isCompleted && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onComplete?.()
            }}
            className="mt-2 w-full text-xs py-1.5 rounded-md font-medium transition-all duration-120 hover:brightness-110"
            style={{
              backgroundColor: `${node.colour}30`,
              color: node.colour,
            }}
          >
            Complete
          </button>
        )}
      </div>

      {/* Active pulse */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-lg -z-10"
          style={{
            border: `2px solid ${node.colour}`,
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.div>
  )
}
