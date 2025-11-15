import { create } from 'zustand'
import type { Note, NoteCategory } from '@total-audio/loopos-db'

type SyncState = 'idle' | 'syncing' | 'synced' | 'error'

interface NotesStore {
  // State
  notes: Note[]
  syncState: SyncState
  error: string | null

  // Actions
  setNotes: (notes: Note[]) => void
  addNote: (note: Note) => void
  updateNote: (id: string, updates: Partial<Note>) => void
  removeNote: (id: string) => void
  setSyncState: (state: SyncState) => void
  setError: (error: string | null) => void

  // Derived getters
  getNotesByCategory: (category: NoteCategory) => Note[]
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  // Initial state
  notes: [],
  syncState: 'idle',
  error: null,

  // Actions
  setNotes: (notes) => set({ notes, syncState: 'synced', error: null }),

  addNote: (note) =>
    set((state) => ({
      notes: [note, ...state.notes],
    })),

  updateNote: (id, updates) =>
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, ...updates } : note
      ),
    })),

  removeNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
    })),

  setSyncState: (syncState) => set({ syncState }),

  setError: (error) => set({ error, syncState: 'error' }),

  // Derived getters
  getNotesByCategory: (category) =>
    get().notes.filter((note) => note.category === category),
}))
