import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { NodeCategory } from '@/state/loopStore'

export interface Note {
  id: string
  title: string
  content: string
  category?: NodeCategory
  createdAt: number
  updatedAt: number
}

interface NotesStore {
  notes: Note[]
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateNote: (id: string, updates: Partial<Note>) => void
  removeNote: (id: string) => void
}

export const useNotesStore = create<NotesStore>((set) => ({
  notes: [
    {
      id: nanoid(),
      title: 'Marketing strategy',
      content: 'Focus on playlists and TikTok content',
      category: 'Promote',
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 86400000,
    },
    {
      id: nanoid(),
      title: 'Production tips',
      content: 'Try sidechain compression on bass',
      category: 'Create',
      createdAt: Date.now() - 172800000,
      updatedAt: Date.now() - 172800000,
    },
    {
      id: nanoid(),
      title: 'Ideas',
      content: 'Collaborate with local artists',
      category: 'Refine',
      createdAt: Date.now() - 259200000,
      updatedAt: Date.now() - 259200000,
    },
  ],

  addNote: (note) =>
    set((state) => ({
      notes: [
        {
          ...note,
          id: nanoid(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        ...state.notes,
      ],
    })),

  updateNote: (id, updates) =>
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id
          ? { ...note, ...updates, updatedAt: Date.now() }
          : note
      ),
    })),

  removeNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
    })),
}))
