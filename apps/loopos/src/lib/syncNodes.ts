import { useLoopStore } from '@/state/loopStore'
import type { CreateNode, UpdateNode } from '@total-audio/loopos-db'

// TODO: Replace with actual user ID from auth session
const getUserId = () => 'demo-user-id'

/**
 * Fetch all nodes from the server
 */
export async function fetchNodes() {
  const { setNodes, setSyncState, setError } = useLoopStore.getState()

  try {
    setSyncState('syncing')

    const response = await fetch('/api/nodes', {
      headers: {
        'x-user-id': getUserId(),
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch nodes: ${response.statusText}`)
    }

    const { nodes } = await response.json()
    setNodes(nodes)
  } catch (error) {
    console.error('Error fetching nodes:', error)
    setError(error instanceof Error ? error.message : 'Unknown error')
  }
}

/**
 * Create a new node
 */
export async function createNodeSync(data: CreateNode) {
  const { addNode, setSyncState, setError } = useLoopStore.getState()

  try {
    setSyncState('syncing')

    const response = await fetch('/api/nodes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': getUserId(),
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to create node: ${response.statusText}`)
    }

    const { node } = await response.json()
    addNode(node)
    setSyncState('synced')

    return node
  } catch (error) {
    console.error('Error creating node:', error)
    setError(error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

/**
 * Update an existing node
 */
export async function updateNodeSync(id: string, updates: UpdateNode) {
  const { updateNode, setSyncState, setError } = useLoopStore.getState()

  try {
    setSyncState('syncing')

    const response = await fetch(`/api/nodes/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': getUserId(),
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      throw new Error(`Failed to update node: ${response.statusText}`)
    }

    const { node } = await response.json()
    updateNode(id, node)
    setSyncState('synced')

    return node
  } catch (error) {
    console.error('Error updating node:', error)
    setError(error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

/**
 * Delete a node
 */
export async function deleteNodeSync(id: string) {
  const { removeNode, setSyncState, setError } = useLoopStore.getState()

  try {
    setSyncState('syncing')

    const response = await fetch(`/api/nodes/${id}`, {
      method: 'DELETE',
      headers: {
        'x-user-id': getUserId(),
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to delete node: ${response.statusText}`)
    }

    removeNode(id)
    setSyncState('synced')
  } catch (error) {
    console.error('Error deleting node:', error)
    setError(error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

/**
 * Debounced sync helper - use this for auto-save scenarios
 */
let debounceTimer: NodeJS.Timeout | null = null

export function debouncedUpdateNode(id: string, updates: UpdateNode, delay = 1000) {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    updateNodeSync(id, updates)
  }, delay)
}
