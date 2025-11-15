import { getSupabaseClient, getSupabaseAdmin } from './client'
import { CreativePackSchema, type DbCreativePack } from './types'

/**
 * Get all creative packs for a user
 */
export async function getCreativePacks(userId: string): Promise<DbCreativePack[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('creative_packs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map((pack) => CreativePackSchema.parse(pack))
}

/**
 * Get a single creative pack by ID
 */
export async function getCreativePack(id: string): Promise<DbCreativePack | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('creative_packs')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return CreativePackSchema.parse(data)
}

/**
 * Get public template packs
 */
export async function getTemplatePacks(): Promise<DbCreativePack[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('creative_packs')
    .select('*')
    .eq('is_template', true)
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map((pack) => CreativePackSchema.parse(pack))
}

/**
 * Get packs by pack type
 */
export async function getCreativePacksByType(
  userId: string,
  packType: DbCreativePack['pack_type']
): Promise<DbCreativePack[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('creative_packs')
    .select('*')
    .eq('user_id', userId)
    .eq('pack_type', packType)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map((pack) => CreativePackSchema.parse(pack))
}

/**
 * Create a new creative pack
 */
export async function createCreativePack(
  pack: Omit<DbCreativePack, 'id' | 'created_at' | 'updated_at'>
): Promise<DbCreativePack> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('creative_packs')
    .insert(pack)
    .select()
    .single()

  if (error) throw error
  return CreativePackSchema.parse(data)
}

/**
 * Update a creative pack
 */
export async function updateCreativePack(
  id: string,
  updates: Partial<Omit<DbCreativePack, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<DbCreativePack> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('creative_packs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return CreativePackSchema.parse(data)
}

/**
 * Delete a creative pack
 */
export async function deleteCreativePack(id: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('creative_packs').delete().eq('id', id)

  if (error) throw error
}

/**
 * Import a template pack for a user
 */
export async function importTemplatePack(
  templateId: string,
  userId: string,
  customisations?: Partial<Pick<DbCreativePack, 'name' | 'description'>>
): Promise<DbCreativePack> {
  const template = await getCreativePack(templateId)
  if (!template || !template.is_template) {
    throw new Error('Template pack not found')
  }

  const newPack = {
    ...template,
    user_id: userId,
    name: customisations?.name || `${template.name} (Copy)`,
    description: customisations?.description || template.description,
    is_template: false,
    is_public: false,
  }

  // Remove template-specific fields
  const { id, created_at, updated_at, ...packData } = newPack

  return createCreativePack(packData)
}
