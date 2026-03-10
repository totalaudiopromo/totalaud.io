// Offline sync queue for PWA support

interface QueuedOperation {
  id: string
  type: 'create' | 'update' | 'delete'
  table: string
  data: any
  timestamp: number
}

const QUEUE_KEY = 'loopos:sync-queue'

export const offlineQueue = {
  add(operation: Omit<QueuedOperation, 'id' | 'timestamp'>) {
    const queue = this.getQueue()
    const queuedOp: QueuedOperation = {
      ...operation,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    }
    queue.push(queuedOp)
    this.saveQueue(queue)
    return queuedOp.id
  },

  getQueue(): QueuedOperation[] {
    try {
      const stored = localStorage.getItem(QUEUE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  },

  saveQueue(queue: QueuedOperation[]) {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
    } catch (error) {
      console.error('Failed to save sync queue:', error)
    }
  },

  remove(id: string) {
    const queue = this.getQueue()
    const filtered = queue.filter((op) => op.id !== id)
    this.saveQueue(filtered)
  },

  clear() {
    localStorage.removeItem(QUEUE_KEY)
  },

  async process(processor: (operation: QueuedOperation) => Promise<void>) {
    const queue = this.getQueue()

    for (const operation of queue) {
      try {
        await processor(operation)
        this.remove(operation.id)
      } catch (error) {
        console.error('Failed to process queued operation:', error)
        // Keep in queue for retry
      }
    }
  },

  count(): number {
    return this.getQueue().length
  },
}

// Online/offline status tracking
export function useOnlineStatus(callback: (isOnline: boolean) => void) {
  const handleOnline = () => callback(true)
  const handleOffline = () => callback(false)

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}

// Check if app is running as installed PWA
export function isInstalledPWA(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  )
}
