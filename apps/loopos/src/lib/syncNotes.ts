import { useNotesStore } from '@/state/notesStore'
import type { CreateNote, UpdateNote } from '@total-audio/loopos-db'

// TODO: Replace with actual user ID from auth session
const getUserId = () => 'demo-user-id'

/**
 * Fetch all notes from the server
 */
export async function fetchNotes() {
  const { setNotes, setSyncState, setError } = useNotesStore.getState()

  try {
    setSyncState('syncing')

    const response = await fetch('/api/notes', {
      headers: {
        'x-user-id': getUserId(),
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch notes: ${response.statusText}`)
    }

    const { notes } = await response.json()
    setNotes(notes)
  } catch (error) {
    console.error('Error fetching notes:', error)
    setError(error instanceof Error ? error.message : 'Unknown error')
  }
}

/**
 * Create a new note
 */
export async function createNoteSync(data: CreateNote) {
  const { addNote, setSyncState, setError } = useNotesStore.getState()

  try {
    setSyncState('syncing')

    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': getUserId(),
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to create note: ${response.statusText}`)
    }

    const { note } = await response.json()
    addNote(note)
    setSyncState('synced')

    return note
  } catch (error) {
    console.error('Error creating note:', error)
    setError(error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

/**
 * Update an existing note
 */
export async function updateNoteSync(id: string, updates: UpdateNote) {
  const { updateNote, setSyncState, setError } = useNotesStore.getState()

  try {
    setSyncState('syncing')

    const response = await fetch(`/api/notes/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': getUserId(),
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      throw new Error(`Failed to update note: ${response.statusText}`)
    }

    const { note } = await response.json()
    updateNote(id, note)
    setSyncState('synced')

    return note
  } catch (error) {
    console.error('Error updating note:', error)
    setError(error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

/**
 * Delete a note
 */
export async function deleteNoteSync(id: string) {
  const { removeNote, setSyncState, setError } = useNotesStore.getState()

  try {
    setSyncState('syncing')

    const response = await fetch(`/api/notes/${id}`, {
      method: 'DELETE',
      headers: {
        'x-user-id': getUserId(),
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to delete note: ${response.statusText}`)
    }

    removeNote(id)
    setSyncState('synced')
  } catch (error) {
    console.error('Error deleting note:', error)
    setError(error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

/**
 * Debounced sync helper - use this for auto-save scenarios
 */
let debounceTimer: NodeJS.Timeout | null = null

export function debouncedUpdateNote(id: string, updates: UpdateNote, delay = 1000) {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    updateNoteSync(id, updates)
  }, delay)
}
