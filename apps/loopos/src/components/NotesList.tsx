'use client'

import { useState } from 'react'
import { useNotesStore } from '@/state/notesStore'
import { motion } from 'framer-motion'
import {
  Lightbulb,
  CheckSquare,
  TrendingUp,
  AlertTriangle,
  Trophy,
  Plus,
} from 'lucide-react'
import type { NoteCategory } from '@total-audio/loopos-db'

const CATEGORY_CONFIG: Record<
  NoteCategory,
  { icon: React.ComponentType<{ className?: string }>; color: string; label: string }
> = {
  idea: { icon: Lightbulb, color: 'text-yellow-500', label: 'Ideas' },
  task: { icon: CheckSquare, color: 'text-blue-500', label: 'Tasks' },
  insight: { icon: TrendingUp, color: 'text-purple-500', label: 'Insights' },
  blocker: { icon: AlertTriangle, color: 'text-red-500', label: 'Blockers' },
  win: { icon: Trophy, color: 'text-green-500', label: 'Wins' },
}

export function NotesList() {
  const { notes } = useNotesStore()
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | 'all'>('all')

  const filteredNotes =
    selectedCategory === 'all'
      ? notes
      : notes.filter((note: { category: NoteCategory }) => note.category === selectedCategory)

  const getCategoryCount = (category: NoteCategory) =>
    notes.filter((n: { category: NoteCategory }) => n.category === category).length

  return (
    <div className="rounded-lg border border-foreground/10 bg-background/50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Notes</h3>
        <button className="flex items-center gap-1 rounded-md border border-foreground/10 px-3 py-1.5 text-sm transition-colors hover:border-accent hover:text-accent">
          <Plus className="h-4 w-4" />
          Add Note
        </button>
      </div>

      {/* Category filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-accent text-background'
              : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10'
          }`}
        >
          All ({notes.length})
        </button>

        {(Object.entries(CATEGORY_CONFIG) as [NoteCategory, typeof CATEGORY_CONFIG[NoteCategory]][]).map(
          ([category, config]) => {
            const count = getCategoryCount(category)
            const Icon = config.icon

            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-accent text-background'
                    : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10'
                }`}
              >
                <Icon className={`h-3 w-3 ${config.color}`} />
                {config.label} ({count})
              </button>
            )
          }
        )}
      </div>

      {/* Notes list */}
      <div className="space-y-2">
        {filteredNotes.length === 0 ? (
          <p className="text-center text-sm text-foreground/50">
            No notes in this category
          </p>
        ) : (
          filteredNotes.map((note: any, index: number) => {
            const config = CATEGORY_CONFIG[note.category as NoteCategory]
            const Icon = config?.icon || Lightbulb

            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-lg border border-foreground/10 p-3 hover:border-accent/50"
              >
                <div className="mb-1 flex items-start gap-2">
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${config.color}`} />
                  <div className="flex-1">
                    <h4 className="font-medium">{note.title}</h4>
                    {note.body && (
                      <p className="mt-1 text-sm text-foreground/70">
                        {note.body}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-xs text-foreground/50">
                  {new Date(note.created_at).toLocaleDateString()}
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
