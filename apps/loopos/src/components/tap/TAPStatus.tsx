'use client'

import { isTAPConfigured } from '@/integrations'
import { CheckCircle2, XCircle } from 'lucide-react'

export function TAPStatus() {
  const isConfigured = isTAPConfigured()

  return (
    <div className="flex items-centre gap-2 px-3 py-2 bg-background border border-border rounded-lg">
      {isConfigured ? (
        <>
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium">TAP Connected</span>
        </>
      ) : (
        <>
          <XCircle className="w-4 h-4 text-foreground/40" />
          <span className="text-sm font-medium text-foreground/60">TAP Not Configured</span>
        </>
      )}
    </div>
  )
}
