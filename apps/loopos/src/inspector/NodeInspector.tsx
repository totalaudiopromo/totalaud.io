'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight } from 'lucide-react'
import { useCanvasStore } from '@/stores/canvas'
import { InspectorPanel } from './InspectorPanel'
import { AgentActions } from './AgentActions'
import { NodeHistory } from './NodeHistory'

export function NodeInspector() {
  const { selectedNodeId, nodes, selectNode } = useCanvasStore()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const selectedNode = nodes.find((n) => n.id === selectedNodeId)

  if (!selectedNodeId || !selectedNode) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.aside
        className="h-screen bg-matte-black border-l border-[var(--border)] flex flex-col overflow-hidden"
        initial={{ width: 0, opacity: 0 }}
        animate={{
          width: isCollapsed ? 48 : 400,
          opacity: 1,
        }}
        exit={{ width: 0, opacity: 0 }}
        transition={{
          duration: 0.24,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {/* Header */}
        <div className="h-16 border-b border-[var(--border)] flex items-center justify-between px-4">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold">Inspector</h2>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-slate-cyan/10 rounded transition-fast"
              aria-label={isCollapsed ? 'Expand inspector' : 'Collapse inspector'}
            >
              <ChevronRight
                className={`w-5 h-5 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
              />
            </button>

            {!isCollapsed && (
              <button
                onClick={() => selectNode(null)}
                className="p-2 hover:bg-slate-cyan/10 rounded transition-fast"
                aria-label="Close inspector"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto">
            <InspectorPanel node={selectedNode} />
            <AgentActions node={selectedNode} />
            <NodeHistory nodeId={selectedNode.id} />
          </div>
        )}
      </motion.aside>
    </AnimatePresence>
  )
}
