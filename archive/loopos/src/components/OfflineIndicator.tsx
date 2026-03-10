'use client'

import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react'
import { useOfflineSync } from '@/hooks/useOfflineSync'

export function OfflineIndicator() {
  const { isOnline, syncing, queueCount, processQueue } = useOfflineSync()

  if (isOnline && queueCount === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="backdrop-blur-glass bg-background/95 border border-accent/20 rounded-lg shadow-xl p-3 flex items-centre gap-3">
        {!isOnline ? (
          <>
            <WifiOff className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-sm font-medium">Offline</p>
              {queueCount > 0 && (
                <p className="text-xs text-foreground/60">
                  {queueCount} change{queueCount > 1 ? 's' : ''} queued
                </p>
              )}
            </div>
          </>
        ) : syncing ? (
          <>
            <RefreshCw className="w-5 h-5 text-accent animate-spin" />
            <div>
              <p className="text-sm font-medium">Syncing...</p>
              <p className="text-xs text-foreground/60">{queueCount} items</p>
            </div>
          </>
        ) : queueCount > 0 ? (
          <>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium">Back online</p>
              <button onClick={processQueue} className="text-xs text-accent hover:underline">
                Sync {queueCount} changes
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
