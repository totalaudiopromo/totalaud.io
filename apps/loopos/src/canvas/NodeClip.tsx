'use client'

import { motion } from 'framer-motion'
import type { LoopNode } from '@/types'
import { useCanvasStore } from '@/stores/canvas'

interface NodeClipProps {
  node: LoopNode
}

export function NodeClip({ node }: NodeClipProps) {
  const { timeline, selectNode, selectedNodeId } = useCanvasStore()
  const pixelsPerSecond = 1 / timeline.zoom

  if (node.timeStart === undefined || node.duration === undefined) return null

  const leftPosition = node.timeStart * pixelsPerSecond
  const width = node.duration * pixelsPerSecond
  const isSelected = selectedNodeId === node.id

  const colours = {
    create: 'bg-emerald-500/30 border-emerald-500',
    promote: 'bg-blue-500/30 border-blue-500',
    analyse: 'bg-purple-500/30 border-purple-500',
    refine: 'bg-amber-500/30 border-amber-500',
  }

  return (
    <motion.div
      className={`absolute top-20 h-16 rounded border-2 cursor-pointer overflow-hidden ${colours[node.type]} ${isSelected ? 'ring-2 ring-slate-cyan' : ''}`}
      style={{
        left: leftPosition,
        width,
      }}
      onClick={() => selectNode(node.id)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="p-2 h-full flex flex-col justify-between">
        <div className="text-xs font-medium truncate">{node.title}</div>
        <div className="text-[10px] text-slate-400 uppercase">{node.type}</div>
      </div>

      {/* Friction indicator */}
      <div
        className="absolute bottom-0 left-0 h-1 bg-red-500/50"
        style={{ width: `${node.friction}%` }}
      />
    </motion.div>
  )
}
