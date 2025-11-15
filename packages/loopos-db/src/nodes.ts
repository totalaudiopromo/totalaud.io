import { supabase } from './client'
import { DbNode, NodeSchema } from './types'

export async function createNode(node: Omit<DbNode, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase.from('loop_nodes').insert([node]).select().single()

  if (error) throw error
  return NodeSchema.parse(data)
}

export async function getNodes(userId: string) {
  const { data, error } = await supabase
    .from('loop_nodes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map((node) => NodeSchema.parse(node))
}

export async function getNode(id: string) {
  const { data, error } = await supabase.from('loop_nodes').select('*').eq('id', id).single()

  if (error) throw error
  return NodeSchema.parse(data)
}

export async function updateNode(id: string, updates: Partial<DbNode>) {
  const { data, error } = await supabase
    .from('loop_nodes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return NodeSchema.parse(data)
}

export async function deleteNode(id: string) {
  const { error } = await supabase.from('loop_nodes').delete().eq('id', id)

  if (error) throw error
}
