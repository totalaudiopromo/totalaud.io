import { supabase } from './client'
import { DbJournalEntry, JournalEntrySchema } from './types'

export async function createJournalEntry(
  entry: Omit<DbJournalEntry, 'id' | 'created_at' | 'updated_at'>
) {
  const { data, error } = await supabase
    .from('journal_entries')
    .insert([entry])
    .select()
    .single()

  if (error) throw error
  return JournalEntrySchema.parse(data)
}

export async function getJournalEntries(userId: string, limit = 30) {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data.map((entry) => JournalEntrySchema.parse(entry))
}

export async function getJournalEntry(id: string) {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return JournalEntrySchema.parse(data)
}

export async function updateJournalEntry(id: string, updates: Partial<DbJournalEntry>) {
  const { data, error } = await supabase
    .from('journal_entries')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return JournalEntrySchema.parse(data)
}

export async function deleteJournalEntry(id: string) {
  const { error } = await supabase.from('journal_entries').delete().eq('id', id)

  if (error) throw error
}
