import { supabase } from './client'
import type { JournalEntry, JournalEntryType } from './types'

export const journalDb = {
  async create(
    workspaceId: string,
    userId: string,
    data: {
      type: JournalEntryType
      title: string
      content: string
      voice_url?: string
      metadata?: Record<string, unknown>
    }
  ): Promise<JournalEntry> {
    const { data: entry, error } = await supabase
      .from('loopos_journal_entries')
      .insert({
        workspace_id: workspaceId,
        user_id: userId,
        ...data,
      })
      .select()
      .single()

    if (error) throw error
    return entry
  },

  async list(workspaceId: string): Promise<JournalEntry[]> {
    const { data, error } = await supabase
      .from('loopos_journal_entries')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async get(entryId: string): Promise<JournalEntry> {
    const { data, error } = await supabase
      .from('loopos_journal_entries')
      .select('*')
      .eq('id', entryId)
      .single()

    if (error) throw error
    return data
  },

  async update(
    entryId: string,
    updates: Partial<Omit<JournalEntry, 'id' | 'workspace_id' | 'user_id' | 'created_at'>>
  ): Promise<JournalEntry> {
    const { data, error } = await supabase
      .from('loopos_journal_entries')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', entryId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(entryId: string): Promise<void> {
    const { error } = await supabase.from('loopos_journal_entries').delete().eq('id', entryId)

    if (error) throw error
  },
}
