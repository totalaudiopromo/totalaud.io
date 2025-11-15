import { getSupabaseClient, getSupabaseAdmin } from './client'
import { MoodboardSchema, MoodboardItemSchema, type DbMoodboard, type DbMoodboardItem } from './types'

/**
 * Get all moodboards for a user
 */
export async function getMoodboards(userId: string, includeArchived = false): Promise<DbMoodboard[]> {
  const supabase = getSupabaseClient()
  let query = supabase.from('moodboards').select('*').eq('user_id', userId)

  if (!includeArchived) {
    query = query.eq('is_archived', false)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data.map((moodboard) => MoodboardSchema.parse(moodboard))
}

/**
 * Get a single moodboard by ID
 */
export async function getMoodboard(id: string): Promise<DbMoodboard | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from('moodboards').select('*').eq('id', id).single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return MoodboardSchema.parse(data)
}

/**
 * Create a new moodboard
 */
export async function createMoodboard(
  moodboard: Omit<DbMoodboard, 'id' | 'created_at' | 'updated_at'>
): Promise<DbMoodboard> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('moodboards').insert(moodboard).select().single()

  if (error) throw error
  return MoodboardSchema.parse(data)
}

/**
 * Update a moodboard
 */
export async function updateMoodboard(
  id: string,
  updates: Partial<Omit<DbMoodboard, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<DbMoodboard> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('moodboards').update(updates).eq('id', id).select().single()

  if (error) throw error
  return MoodboardSchema.parse(data)
}

/**
 * Archive/unarchive a moodboard
 */
export async function toggleArchive(id: string, isArchived: boolean): Promise<DbMoodboard> {
  return updateMoodboard(id, { is_archived: isArchived })
}

/**
 * Delete a moodboard (and all its items)
 */
export async function deleteMoodboard(id: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('moodboards').delete().eq('id', id)

  if (error) throw error
}

// ==================== MOODBOARD ITEMS ====================

/**
 * Get all items for a moodboard
 */
export async function getMoodboardItems(moodboardId: string): Promise<DbMoodboardItem[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('moodboard_items')
    .select('*')
    .eq('moodboard_id', moodboardId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data.map((item) => MoodboardItemSchema.parse(item))
}

/**
 * Get a single moodboard item by ID
 */
export async function getMoodboardItem(id: string): Promise<DbMoodboardItem | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from('moodboard_items').select('*').eq('id', id).single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return MoodboardItemSchema.parse(data)
}

/**
 * Create a new moodboard item
 */
export async function createMoodboardItem(
  item: Omit<DbMoodboardItem, 'id' | 'created_at'>
): Promise<DbMoodboardItem> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('moodboard_items').insert(item).select().single()

  if (error) throw error
  return MoodboardItemSchema.parse(data)
}

/**
 * Update a moodboard item
 */
export async function updateMoodboardItem(
  id: string,
  updates: Partial<Omit<DbMoodboardItem, 'id' | 'moodboard_id' | 'user_id' | 'created_at'>>
): Promise<DbMoodboardItem> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('moodboard_items').update(updates).eq('id', id).select().single()

  if (error) throw error
  return MoodboardItemSchema.parse(data)
}

/**
 * Delete a moodboard item
 */
export async function deleteMoodboardItem(id: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('moodboard_items').delete().eq('id', id)

  if (error) throw error
}

/**
 * Upload image to Supabase Storage
 */
export async function uploadMoodboardImage(
  userId: string,
  moodboardId: string,
  file: File
): Promise<{ url: string; path: string }> {
  const supabase = getSupabaseClient()

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${moodboardId}/${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage.from('moodboards').upload(fileName, file)

  if (error) throw error

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('moodboards').getPublicUrl(data.path)

  return {
    url: publicUrl,
    path: data.path,
  }
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteMoodboardImage(storagePath: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.storage.from('moodboards').remove([storagePath])

  if (error) throw error
}
