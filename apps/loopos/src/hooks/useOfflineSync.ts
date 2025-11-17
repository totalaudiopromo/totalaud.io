'use client'

import { useEffect, useState } from 'react'
import { offlineQueue, useOnlineStatus } from '@/lib/offline'
import { nodesDb, notesDb, journalDb } from '@total-audio/loopos-db'
import { toast } from 'sonner'

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [syncing, setSyncing] = useState(false)
  const [queueCount, setQueueCount] = useState(0)

  useEffect(() => {
    // Update queue count
    setQueueCount(offlineQueue.count())

    // Listen for online/offline changes
    const cleanup = useOnlineStatus((online) => {
      setIsOnline(online)

      if (online) {
        // Back online - process queue
        processQueue()
      } else {
        toast.error('You are offline. Changes will sync when reconnected.')
      }
    })

    return cleanup
  }, [])

  const processQueue = async () => {
    const count = offlineQueue.count()
    if (count === 0) return

    setSyncing(true)
    toast.loading(`Syncing ${count} changes...`)

    try {
      await offlineQueue.process(async (operation) => {
        switch (operation.table) {
          case 'nodes':
            if (operation.type === 'create') {
              await nodesDb.create(
                operation.data.workspace_id,
                operation.data.user_id,
                operation.data
              )
            } else if (operation.type === 'update') {
              await nodesDb.update(operation.data.id, operation.data)
            } else if (operation.type === 'delete') {
              await nodesDb.delete(operation.data.id)
            }
            break

          case 'notes':
            if (operation.type === 'create') {
              await notesDb.create(
                operation.data.workspace_id,
                operation.data.user_id,
                operation.data
              )
            } else if (operation.type === 'update') {
              await notesDb.update(operation.data.id, operation.data.content)
            } else if (operation.type === 'delete') {
              await notesDb.delete(operation.data.id)
            }
            break

          case 'journal':
            if (operation.type === 'create') {
              await journalDb.create(
                operation.data.workspace_id,
                operation.data.user_id,
                operation.data
              )
            } else if (operation.type === 'update') {
              await journalDb.update(operation.data.id, operation.data)
            } else if (operation.type === 'delete') {
              await journalDb.delete(operation.data.id)
            }
            break
        }
      })

      toast.success(`Synced ${count} changes!`)
      setQueueCount(0)
    } catch (error) {
      console.error('Sync error:', error)
      toast.error('Failed to sync some changes')
    } finally {
      setSyncing(false)
    }
  }

  return {
    isOnline,
    syncing,
    queueCount,
    processQueue,
  }
}
