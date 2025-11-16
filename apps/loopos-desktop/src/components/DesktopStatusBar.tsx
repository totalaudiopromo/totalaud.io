/**
 * LoopOS Desktop Status Bar
 * Shows connectivity and sync status
 */

interface DesktopStatusBarProps {
  online: boolean
  syncing: boolean
  queueSize: number
}

export function DesktopStatusBar({
  online,
  syncing,
  queueSize,
}: DesktopStatusBarProps) {
  return (
    <div className="h-6 bg-background border-t border-border flex items-center justify-between px-4 text-xs">
      {/* Left side - Connectivity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              online ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-foreground/60">
            {online ? 'Online' : 'Offline'}
          </span>
        </div>

        {syncing && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-foreground/60">Syncing...</span>
          </div>
        )}

        {!online && queueSize > 0 && (
          <span className="text-foreground/60">
            {queueSize} {queueSize === 1 ? 'action' : 'actions'} queued
          </span>
        )}
      </div>

      {/* Right side - App info */}
      <div className="text-foreground/40">LoopOS Desktop v1.0.0</div>
    </div>
  )
}
