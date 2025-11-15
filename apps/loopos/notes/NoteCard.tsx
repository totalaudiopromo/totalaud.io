'use client'

import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import type { Note } from './notesStore'
import { categoryColours } from '@/state/loopStore'

interface NoteCardProps {
  note: Note
  onRemove?: () => void
}

export function NoteCard({ note, onRemove }: NoteCardProps) {
  const categoryColour = note.category
    ? categoryColours[note.category]
    : '#737373'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-loop-grey-900/50 border border-loop-grey-800 rounded-md p-3 hover:border-loop-grey-700 transition-all duration-120"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-semibold text-loop-grey-200">
          {note.title}
        </h3>

        <button
          onClick={onRemove}
          className="text-loop-grey-600 hover:text-loop-grey-400 transition-colours duration-120"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <p className="text-xs text-loop-grey-400 mb-2 line-clamp-2">
        {note.content}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {note.category && (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: `${categoryColour}20`,
              color: categoryColour,
            }}
          >
            {note.category}
          </span>
        )}

        <span className="text-[10px] text-loop-grey-600 font-mono">
          {formatDate(note.updatedAt)}
        </span>
      </div>
    </motion.div>
  )
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}
