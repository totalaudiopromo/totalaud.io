import { supabase } from './client'
import { DbOrchestration, OrchestrationSchema } from './types'

export async function createOrchestration(
  orchestration: Omit<DbOrchestration, 'id' | 'created_at' | 'updated_at'>
) {
  const { data, error } = await supabase
    .from('orchestrations')
    .insert([orchestration])
    .select()
    .single()

  if (error) throw error
  return OrchestrationSchema.parse(data)
}

export async function getOrchestrations(userId: string) {
  const { data, error } = await supabase
    .from('orchestrations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map((orchestration) => OrchestrationSchema.parse(orchestration))
}

export async function getOrchestration(id: string) {
  const { data, error } = await supabase
    .from('orchestrations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return OrchestrationSchema.parse(data)
}

export async function updateOrchestration(id: string, updates: Partial<DbOrchestration>) {
  const { data, error } = await supabase
    .from('orchestrations')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return OrchestrationSchema.parse(data)
}

export async function deleteOrchestration(id: string) {
  const { error } = await supabase.from('orchestrations').delete().eq('id', id)

  if (error) throw error
}
