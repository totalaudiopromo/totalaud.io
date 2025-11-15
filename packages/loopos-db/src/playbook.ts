import { getSupabaseClient, getSupabaseAdmin } from './client'
import { PlaybookChapterSchema, type DbPlaybookChapter } from './types'

/**
 * Get all playbook chapters for a user
 */
export async function getPlaybookChapters(userId: string): Promise<DbPlaybookChapter[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('playbook_chapters')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map((chapter) => PlaybookChapterSchema.parse(chapter))
}

/**
 * Get a single playbook chapter by ID
 */
export async function getPlaybookChapter(id: string): Promise<DbPlaybookChapter | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('playbook_chapters')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return PlaybookChapterSchema.parse(data)
}

/**
 * Get playbook chapters by category
 */
export async function getPlaybookChaptersByCategory(
  userId: string,
  category: DbPlaybookChapter['category']
): Promise<DbPlaybookChapter[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('playbook_chapters')
    .select('*')
    .eq('user_id', userId)
    .eq('category', category)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map((chapter) => PlaybookChapterSchema.parse(chapter))
}

/**
 * Get favourite playbook chapters
 */
export async function getFavouriteChapters(userId: string): Promise<DbPlaybookChapter[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('playbook_chapters')
    .select('*')
    .eq('user_id', userId)
    .eq('is_favourite', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map((chapter) => PlaybookChapterSchema.parse(chapter))
}

/**
 * Create a new playbook chapter
 */
export async function createPlaybookChapter(
  chapter: Omit<DbPlaybookChapter, 'id' | 'created_at' | 'updated_at'>
): Promise<DbPlaybookChapter> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('playbook_chapters')
    .insert(chapter)
    .select()
    .single()

  if (error) throw error
  return PlaybookChapterSchema.parse(data)
}

/**
 * Update a playbook chapter
 */
export async function updatePlaybookChapter(
  id: string,
  updates: Partial<Omit<DbPlaybookChapter, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<DbPlaybookChapter> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('playbook_chapters')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return PlaybookChapterSchema.parse(data)
}

/**
 * Toggle favourite status
 */
export async function toggleFavourite(id: string, isFavourite: boolean): Promise<DbPlaybookChapter> {
  return updatePlaybookChapter(id, { is_favourite: isFavourite })
}

/**
 * Delete a playbook chapter
 */
export async function deletePlaybookChapter(id: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('playbook_chapters').delete().eq('id', id)

  if (error) throw error
}

/**
 * Search playbook chapters by tags
 */
export async function searchChaptersByTag(userId: string, tag: string): Promise<DbPlaybookChapter[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('playbook_chapters')
    .select('*')
    .eq('user_id', userId)
    .contains('tags', [tag])
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map((chapter) => PlaybookChapterSchema.parse(chapter))
}
