/**
 * LoopOS Desktop - Offline Action Queue
 * Queues actions when offline and syncs when connectivity is restored
 */

import { readCache, writeCache, cacheKeys } from './cache'

export type OfflineAction =
  | {
      type: 'create_node'
      payload: {
        workspaceId: string
        userId: string
        node: Record<string, unknown>
      }
    }
  | {
      type: 'update_node'
      payload: {
        nodeId: string
        updates: Record<string, unknown>
      }
    }
  | {
      type: 'delete_node'
      payload: {
        nodeId: string
      }
    }
  | {
      type: 'create_journal_entry'
      payload: {
        workspaceId: string
        userId: string
        entry: Record<string, unknown>
      }
    }
  | {
      type: 'update_journal_entry'
      payload: {
        entryId: string
        updates: Record<string, unknown>
      }
    }
  | {
      type: 'create_scene'
      payload: {
        workspaceId: string
        userId: string
        scene: Record<string, unknown>
      }
    }
  | {
      type: 'update_scene'
      payload: {
        sceneId: string
        updates: Record<string, unknown>
      }
    }

export interface QueuedAction {
  id: string
  action: OfflineAction
  timestamp: number
  retries: number
}

/**
 * Add an action to the offline queue
 */
export async function queueAction(action: OfflineAction): Promise<void> {
  const queue = await getQueue()

  const queuedAction: QueuedAction = {
    id: crypto.randomUUID(),
    action,
    timestamp: Date.now(),
    retries: 0,
  }

  queue.push(queuedAction)
  await saveQueue(queue)
}

/**
 * Get all queued actions
 */
export async function getQueue(): Promise<QueuedAction[]> {
  const queue = await readCache<QueuedAction[]>(cacheKeys.offlineQueue())
  return queue || []
}

/**
 * Save the queue
 */
async function saveQueue(queue: QueuedAction[]): Promise<void> {
  await writeCache(cacheKeys.offlineQueue(), queue)
}

/**
 * Remove an action from the queue
 */
export async function removeFromQueue(actionId: string): Promise<void> {
  let queue = await getQueue()
  queue = queue.filter((a) => a.id !== actionId)
  await saveQueue(queue)
}

/**
 * Clear the entire queue
 */
export async function clearQueue(): Promise<void> {
  await saveQueue([])
}

/**
 * Process the queue with a handler function
 */
export async function processQueue(
  handler: (action: QueuedAction) => Promise<void>,
  onProgress?: (processed: number, total: number) => void
): Promise<{ success: number; failed: number }> {
  const queue = await getQueue()
  let success = 0
  let failed = 0

  for (let i = 0; i < queue.length; i++) {
    const queuedAction = queue[i]

    try {
      await handler(queuedAction)
      await removeFromQueue(queuedAction.id)
      success++
    } catch (error) {
      console.error('Failed to process queued action:', error)

      // Increment retry count
      queuedAction.retries++

      // Remove if too many retries (max 3)
      if (queuedAction.retries >= 3) {
        await removeFromQueue(queuedAction.id)
        failed++
      } else {
        // Save updated retry count
        const updatedQueue = await getQueue()
        const index = updatedQueue.findIndex((a) => a.id === queuedAction.id)
        if (index !== -1) {
          updatedQueue[index] = queuedAction
          await saveQueue(updatedQueue)
        }
      }
    }

    if (onProgress) {
      onProgress(i + 1, queue.length)
    }
  }

  return { success, failed }
}
