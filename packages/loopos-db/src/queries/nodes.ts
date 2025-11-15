import { createServerClient } from '../dbClient'
import type { CreateNode, Node, UpdateNode } from '../schemas/node'

/**
 * Get all nodes for a user
 */
export async function getNodes(userId: string): Promise<Node[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('loopos_nodes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch nodes: ${error.message}`)
  }

  return data as Node[]
}

/**
 * Get a single node by ID
 */
export async function getNode(id: string, userId: string): Promise<Node | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('loopos_nodes')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    throw new Error(`Failed to fetch node: ${error.message}`)
  }

  return data as Node
}

/**
 * Create a new node
 */
export async function createNode(
  userId: string,
  nodeData: CreateNode
): Promise<Node> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('loopos_nodes')
    .insert({
      user_id: userId,
      ...nodeData,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create node: ${error.message}`)
  }

  return data as Node
}

/**
 * Update an existing node
 */
export async function updateNode(
  id: string,
  userId: string,
  updates: UpdateNode
): Promise<Node> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('loopos_nodes')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update node: ${error.message}`)
  }

  return data as Node
}

/**
 * Delete a node
 */
export async function deleteNode(id: string, userId: string): Promise<void> {
  const supabase = createServerClient()

  const { error } = await supabase
    .from('loopos_nodes')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to delete node: ${error.message}`)
  }
}

/**
 * Get nodes by status
 */
export async function getNodesByStatus(
  userId: string,
  status: 'upcoming' | 'active' | 'completed'
): Promise<Node[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('loopos_nodes')
    .select('*')
    .eq('user_id', userId)
    .eq('status', status)
    .order('priority', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch nodes by status: ${error.message}`)
  }

  return data as Node[]
}

/**
 * Get nodes by type
 */
export async function getNodesByType(
  userId: string,
  type: 'create' | 'promote' | 'analyse' | 'refine'
): Promise<Node[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('loopos_nodes')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch nodes by type: ${error.message}`)
  }

  return data as Node[]
}
