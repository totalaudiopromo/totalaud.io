import type { SupabaseClient } from '@supabase/supabase-js'
import {
  type Node,
  type CreateNodeInput,
  CreateNodeSchema,
  NodeSchema,
} from './types'

/**
 * Node database operations for LoopOS
 */

export async function createNode(
  supabase: SupabaseClient,
  userId: string,
  input: CreateNodeInput
): Promise<Node> {
  // Validate input
  const validated = CreateNodeSchema.parse(input)

  const { data, error } = await supabase
    .from('loopos_nodes')
    .insert({
      user_id: userId,
      ...validated,
    })
    .select()
    .single()

  if (error) throw error
  return NodeSchema.parse(data)
}

export async function getNodes(
  supabase: SupabaseClient,
  userId: string
): Promise<Node[]> {
  const { data, error } = await supabase
    .from('loopos_nodes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map((node) => NodeSchema.parse(node))
}

export async function getNodeById(
  supabase: SupabaseClient,
  userId: string,
  nodeId: string
): Promise<Node | null> {
  const { data, error } = await supabase
    .from('loopos_nodes')
    .select('*')
    .eq('id', nodeId)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }

  return NodeSchema.parse(data)
}

export async function updateNode(
  supabase: SupabaseClient,
  userId: string,
  nodeId: string,
  updates: Partial<CreateNodeInput>
): Promise<Node> {
  const { data, error } = await supabase
    .from('loopos_nodes')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', nodeId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return NodeSchema.parse(data)
}

export async function deleteNode(
  supabase: SupabaseClient,
  userId: string,
  nodeId: string
): Promise<void> {
  const { error } = await supabase
    .from('loopos_nodes')
    .delete()
    .eq('id', nodeId)
    .eq('user_id', userId)

  if (error) throw error
}
