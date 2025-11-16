'use client'

/**
 * TAP Export Overlay
 * Visual feedback for TAP export process (demo stub)
 */

import { CheckCircle2, Loader2, XCircle, ArrowRight } from 'lucide-react'

interface TAPExportOverlayProps {
  status: 'idle' | 'exporting' | 'success' | 'error'
  message: string
}

export function TAPExportOverlay({ status, message }: TAPExportOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-centre justify-centre pointer-events-none">
      <div className="bg-background/95 backdrop-blur-lg border-2 border-accent rounded-lg shadow-2xl p-6 max-w-md pointer-events-auto">
        {/* Icon */}
        <div className="flex items-centre justify-centre mb-4">
          {status === 'exporting' && (
            <Loader2 className="w-12 h-12 text-accent animate-spin" />
          )}
          {status === 'success' && (
            <CheckCircle2 className="w-12 h-12 text-green-500 animate-in fade-in zoom-in" />
          )}
          {status === 'error' && <XCircle className="w-12 h-12 text-red-500" />}
        </div>

        {/* Message */}
        <div className="text-centre mb-4">
          <h3 className="text-lg font-bold mb-2">
            {status === 'exporting' && 'Exporting to Total Audio Promo'}
            {status === 'success' && 'Export Successful'}
            {status === 'error' && 'Export Failed'}
          </h3>
          <p className="text-sm text-foreground/70">{message}</p>
        </div>

        {/* Preview mode notice */}
        {status === 'success' && (
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 text-xs">
            <div className="flex items-centre gap-2 text-accent font-medium mb-1">
              <ArrowRight className="w-3 h-3" />
              <span>Preview Mode</span>
            </div>
            <p className="text-foreground/60 leading-relaxed">
              This is a demo stub. Real TAP integration coming with Fusion Lite. Campaign data
              would sync to your Total Audio Promo dashboard for execution and reporting.
            </p>
          </div>
        )}

        {/* Status indicator */}
        {status === 'exporting' && (
          <div className="w-full bg-border/30 rounded-full h-1 overflow-hidden">
            <div className="h-full bg-accent w-2/3 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  )
}
