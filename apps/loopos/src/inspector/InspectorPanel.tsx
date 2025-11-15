'use client'

import { useState } from 'react'
import type { LoopNode } from '@/types'
import { useCanvasStore } from '@/stores/canvas'

interface InspectorPanelProps {
  node: LoopNode
}

export function InspectorPanel({ node }: InspectorPanelProps) {
  const { updateNode } = useCanvasStore()

  const [title, setTitle] = useState(node.title)
  const [description, setDescription] = useState(node.description || '')
  const [friction, setFriction] = useState(node.friction)
  const [priority, setPriority] = useState(node.priority)

  const handleUpdate = () => {
    updateNode(node.id, {
      title,
      description,
      friction,
      priority,
    })
  }

  return (
    <div className="p-4 space-y-6 border-b border-[var(--border)]">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleUpdate}
          className="w-full px-3 py-2 bg-[var(--border)] border border-[var(--border-subtle)] rounded focus:outline-none focus:ring-2 focus:ring-slate-cyan transition-fast"
        />
      </div>

      {/* Type Badge */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">Type</label>
        <div className="inline-block px-3 py-1 bg-slate-cyan/20 text-slate-cyan rounded-full text-sm font-medium uppercase">
          {node.type}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleUpdate}
          rows={3}
          className="w-full px-3 py-2 bg-[var(--border)] border border-[var(--border-subtle)] rounded focus:outline-none focus:ring-2 focus:ring-slate-cyan transition-fast resize-none"
        />
      </div>

      {/* Friction Slider */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Friction: <span className="text-white">{friction}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={friction}
          onChange={(e) => setFriction(Number(e.target.value))}
          onMouseUp={handleUpdate}
          className="w-full accent-slate-cyan"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>Easy</span>
          <span>Hard</span>
        </div>
      </div>

      {/* Priority Slider */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Priority: <span className="text-white">{priority}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value))}
          onMouseUp={handleUpdate}
          className="w-full accent-slate-cyan"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      {/* Dependencies */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Dependencies ({node.dependencies.length})
        </label>
        {node.dependencies.length === 0 ? (
          <p className="text-sm text-slate-500">No dependencies</p>
        ) : (
          <ul className="space-y-2">
            {node.dependencies.map((depId) => (
              <li
                key={depId}
                className="px-3 py-2 bg-[var(--border)] rounded text-sm flex items-center justify-between"
              >
                <span className="font-mono text-xs">{depId.slice(0, 8)}...</span>
                <button
                  onClick={() => {
                    updateNode(node.id, {
                      dependencies: node.dependencies.filter((id) => id !== depId),
                    })
                  }}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
