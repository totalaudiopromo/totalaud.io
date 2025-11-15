import { createServerClient } from '../dbClient'
import type { CreateNote, Note, UpdateNote, NoteCategory } from '../schemas/note'

/**
 * Get all notes for a user
 */
export async function getNotes(userId: string): Promise<Note[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('loopos_notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch notes: ${error.message}`)
  }

  return data as Note[]
}

/**
 * Get a single note by ID
 */
export async function getNote(id: string, userId: string): Promise<Note | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('loopos_notes')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    throw new Error(`Failed to fetch note: ${error.message}`)
  }

  return data as Note
}

/**
 * Create a new note
 */
export async function createNote(
  userId: string,
  noteData: CreateNote
): Promise<Note> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('loopos_notes')
    .insert({
      user_id: userId,
      ...noteData,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create note: ${error.message}`)
  }

  return data as Note
}

/**
 * Update an existing note
 */
export async function updateNote(
  id: string,
  userId: string,
  updates: UpdateNote
): Promise<Note> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('loopos_notes')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update note: ${error.message}`)
  }

  return data as Note
}

/**
 * Delete a note
 */
export async function deleteNote(id: string, userId: string): Promise<void> {
  const supabase = createServerClient()

  const { error } = await supabase
    .from('loopos_notes')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to delete note: ${error.message}`)
  }
}

/**
 * Get notes by category
 */
export async function getNotesByCategory(
  userId: string,
  category: NoteCategory
): Promise<Note[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('loopos_notes')
    .select('*')
    .eq('user_id', userId)
    .eq('category', category)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch notes by category: ${error.message}`)
  }

  return data as Note[]
}
