import type { SupabaseClient } from '@supabase/supabase-js'
import {
  type JournalEntry,
  type CreateJournalEntryInput,
  CreateJournalEntrySchema,
  JournalEntrySchema,
} from './types'

/**
 * Journal database operations for LoopOS
 */

export async function createJournalEntry(
  supabase: SupabaseClient,
  userId: string,
  input: CreateJournalEntryInput
): Promise<JournalEntry> {
  const validated = CreateJournalEntrySchema.parse(input)

  const { data, error } = await supabase
    .from('loopos_journal_entries')
    .insert({
      user_id: userId,
      ...validated,
    })
    .select()
    .single()

  if (error) throw error
  return JournalEntrySchema.parse(data)
}

export async function getJournalEntries(
  supabase: SupabaseClient,
  userId: string,
  options?: { limit?: number; offset?: number }
): Promise<JournalEntry[]> {
  let query = supabase
    .from('loopos_journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) throw error
  return data.map((entry) => JournalEntrySchema.parse(entry))
}

export async function getJournalEntryById(
  supabase: SupabaseClient,
  userId: string,
  entryId: string
): Promise<JournalEntry | null> {
  const { data, error } = await supabase
    .from('loopos_journal_entries')
    .select('*')
    .eq('id', entryId)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return JournalEntrySchema.parse(data)
}

export async function updateJournalEntry(
  supabase: SupabaseClient,
  userId: string,
  entryId: string,
  updates: Partial<CreateJournalEntryInput>
): Promise<JournalEntry> {
  const { data, error } = await supabase
    .from('loopos_journal_entries')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', entryId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return JournalEntrySchema.parse(data)
}

export async function deleteJournalEntry(
  supabase: SupabaseClient,
  userId: string,
  entryId: string
): Promise<void> {
  const { error } = await supabase
    .from('loopos_journal_entries')
    .delete()
    .eq('id', entryId)
    .eq('user_id', userId)

  if (error) throw error
}
