/**
 * LoopOS Desktop Offline Banner
 * Displays when the app is offline
 */

import { WifiOff } from 'lucide-react'

interface OfflineBannerProps {
  queueSize: number
}

export function OfflineBanner({ queueSize }: OfflineBannerProps) {
  return (
    <div className="bg-amber-900/20 border-b border-amber-600/30 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <WifiOff className="w-4 h-4 text-amber-500" />
        <div>
          <p className="text-sm font-medium text-amber-400">
            You're offline
          </p>
          <p className="text-xs text-amber-500/80">
            Your work is saved locally and will sync when you reconnect
            {queueSize > 0 &&
              ` · ${queueSize} ${queueSize === 1 ? 'action' : 'actions'} pending`}
          </p>
        </div>
      </div>
    </div>
  )
}
