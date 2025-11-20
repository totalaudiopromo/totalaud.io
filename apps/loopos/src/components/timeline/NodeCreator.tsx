'use client'

import { useState } from 'react'
import { NodeType, NodeTypeSchema } from '@total-audio/loopos-db'
import { X } from 'lucide-react'

const nodeTypes: { value: NodeType; label: string; colour: string }[] = [
  { value: 'idea', label: 'Idea', colour: '#FFB800' },
  { value: 'milestone', label: 'Milestone', colour: '#3AA9BE' },
  { value: 'task', label: 'Task', colour: '#00D9FF' },
  { value: 'reference', label: 'Reference', colour: '#9D4EDD' },
  { value: 'insight', label: 'Insight', colour: '#06FFA5' },
  { value: 'decision', label: 'Decision', colour: '#FF006E' },
]

interface NodeCreatorProps {
  position: { x: number; y: number }
  onCreate: (data: { type: NodeType; title: string; content: string; colour: string }) => void
  onCancel: () => void
}

export function NodeCreator({ position, onCreate, onCancel }: NodeCreatorProps) {
  const [selectedType, setSelectedType] = useState<NodeType>('idea')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const selectedNodeType = nodeTypes.find((t) => t.value === selectedType)!

    onCreate({
      type: selectedType,
      title: title.trim(),
      content: content.trim(),
      colour: selectedNodeType.colour,
    })
  }

  return (
    <div
      className="absolute z-50 bg-background border border-border rounded-lg shadow-xl p-4 w-80"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className="flex items-centre justify-between mb-4">
        <h3 className="font-semibold">Create Node</h3>
        <button
          onClick={onCancel}
          className="text-foreground/60 hover:text-foreground transition-colours"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-2">Type</label>
          <div className="grid grid-cols-3 gap-2">
            {nodeTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setSelectedType(type.value)}
                className={`
                  px-2 py-1.5 rounded text-xs font-medium transition-colours
                  ${
                    selectedType === type.value
                      ? 'bg-accent/20 text-accent border border-accent'
                      : 'bg-background border border-border text-foreground/60 hover:border-accent/50'
                  }
                `}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Node title"
            required
            autoFocus
            className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:border-accent transition-colours"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add details..."
            rows={3}
            className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:border-accent transition-colours resize-none"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-3 py-2 border border-border rounded hover:bg-accent/5 transition-colours"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="flex-1 px-3 py-2 bg-accent text-background rounded hover:bg-accent/90 transition-colours disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  )
}
