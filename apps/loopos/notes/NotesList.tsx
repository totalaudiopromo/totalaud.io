'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useNotesStore } from './notesStore'
import { NoteCard } from './NoteCard'
import { playSound } from '@/sounds/audioEngine'

export function NotesList() {
  const { notes, addNote, removeNote } = useNotesStore()
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')

  const handleAdd = () => {
    if (!newTitle.trim()) return

    addNote({
      title: newTitle,
      content: newContent,
    })

    setNewTitle('')
    setNewContent('')
    setIsAdding(false)
    playSound('complete', 0.2)
  }

  const handleRemove = (id: string) => {
    removeNote(id)
    playSound('click', 0.1)
  }

  return (
    <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
      {/* Add note form */}
      {isAdding ? (
        <div className="bg-loop-grey-900 border border-loop-cyan rounded-md p-3 space-y-2">
          <input
            type="text"
            placeholder="Note title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full bg-loop-black border border-loop-grey-800 rounded px-2 py-1.5 text-sm text-loop-grey-200 placeholder-loop-grey-600 focus:outline-none focus:border-loop-cyan"
            autoFocus
          />
          <textarea
            placeholder="Note content..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={3}
            className="w-full bg-loop-black border border-loop-grey-800 rounded px-2 py-1.5 text-xs text-loop-grey-200 placeholder-loop-grey-600 focus:outline-none focus:border-loop-cyan resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 bg-loop-cyan text-loop-black text-xs font-semibold py-1.5 rounded hover:brightness-110 transition-all duration-120"
            >
              Add
            </button>
            <button
              onClick={() => {
                setIsAdding(false)
                setNewTitle('')
                setNewContent('')
              }}
              className="flex-1 bg-loop-grey-800 text-loop-grey-300 text-xs font-semibold py-1.5 rounded hover:bg-loop-grey-700 transition-all duration-120"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full bg-loop-grey-900/50 border border-loop-grey-800 border-dashed rounded-md p-3 hover:border-loop-cyan hover:bg-loop-grey-900 transition-all duration-120 flex items-center justify-center gap-2 text-loop-grey-500 hover:text-loop-cyan"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Add note</span>
        </button>
      )}

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="text-center py-8 text-loop-grey-600 text-sm">
          No notes yet
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onRemove={() => handleRemove(note.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
