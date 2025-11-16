import { supabase } from './client'
import type { CreativePack } from './types'

export const packsDb = {
  async create(
    workspaceId: string | null,
    userId: string | null,
    data: {
      name: string
      description: string
      category: string
      content: Record<string, unknown>
      is_public?: boolean
    }
  ): Promise<CreativePack> {
    const { data: pack, error } = await supabase
      .from('loopos_creative_packs')
      .insert({
        workspace_id: workspaceId,
        user_id: userId,
        is_public: data.is_public ?? false,
        ...data,
      })
      .select()
      .single()

    if (error) throw error
    return pack
  },

  async list(workspaceId: string | null): Promise<CreativePack[]> {
    const { data, error } = await supabase
      .from('loopos_creative_packs')
      .select('*')
      .or(`workspace_id.eq.${workspaceId},is_public.eq.true`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async get(packId: string): Promise<CreativePack> {
    const { data, error } = await supabase
      .from('loopos_creative_packs')
      .select('*')
      .eq('id', packId)
      .single()

    if (error) throw error
    return data
  },

  async update(
    packId: string,
    updates: Partial<Omit<CreativePack, 'id' | 'created_at'>>
  ): Promise<CreativePack> {
    const { data, error } = await supabase
      .from('loopos_creative_packs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', packId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(packId: string): Promise<void> {
    const { error } = await supabase
      .from('loopos_creative_packs')
      .delete()
      .eq('id', packId)

    if (error) throw error
  },

  async listByCategory(
    workspaceId: string | null,
    category: string
  ): Promise<CreativePack[]> {
    const { data, error } = await supabase
      .from('loopos_creative_packs')
      .select('*')
      .or(`workspace_id.eq.${workspaceId},is_public.eq.true`)
      .eq('category', category)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },
}
