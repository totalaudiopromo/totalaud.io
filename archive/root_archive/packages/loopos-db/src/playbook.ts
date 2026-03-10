import { supabase } from './client'
import type { PlaybookChapter } from './types'

export const playbookDb = {
  async create(
    workspaceId: string | null,
    data: {
      title: string
      description: string
      content: Record<string, unknown>
      order_index: number
      is_public?: boolean
    }
  ): Promise<PlaybookChapter> {
    const { data: chapter, error } = await supabase
      .from('loopos_playbook_chapters')
      .insert({
        workspace_id: workspaceId,
        is_public: data.is_public ?? false,
        ...data,
      })
      .select()
      .single()

    if (error) throw error
    return chapter
  },

  async list(workspaceId: string | null): Promise<PlaybookChapter[]> {
    const { data, error } = await supabase
      .from('loopos_playbook_chapters')
      .select('*')
      .or(`workspace_id.eq.${workspaceId},is_public.eq.true`)
      .order('order_index', { ascending: true })

    if (error) throw error
    return data
  },

  async get(chapterId: string): Promise<PlaybookChapter> {
    const { data, error } = await supabase
      .from('loopos_playbook_chapters')
      .select('*')
      .eq('id', chapterId)
      .single()

    if (error) throw error
    return data
  },

  async update(
    chapterId: string,
    updates: Partial<Omit<PlaybookChapter, 'id' | 'created_at'>>
  ): Promise<PlaybookChapter> {
    const { data, error } = await supabase
      .from('loopos_playbook_chapters')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', chapterId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(chapterId: string): Promise<void> {
    const { error } = await supabase.from('loopos_playbook_chapters').delete().eq('id', chapterId)

    if (error) throw error
  },

  async reorder(chapterId: string, newOrderIndex: number): Promise<PlaybookChapter> {
    const { data, error } = await supabase
      .from('loopos_playbook_chapters')
      .update({ order_index: newOrderIndex, updated_at: new Date().toISOString() })
      .eq('id', chapterId)
      .select()
      .single()

    if (error) throw error
    return data
  },
}
