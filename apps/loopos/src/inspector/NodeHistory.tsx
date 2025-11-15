'use client'

import { Clock } from 'lucide-react'

interface NodeHistoryProps {
  nodeId: string
}

export function NodeHistory({ nodeId }: NodeHistoryProps) {
  // In production, fetch real history from database
  const mockHistory = [
    { timestamp: '2 hours ago', action: 'Friction reduced to 40%' },
    { timestamp: '5 hours ago', action: 'Priority increased to 80%' },
    { timestamp: '1 day ago', action: 'Node created' },
  ]

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Clock className="w-4 h-4 text-slate-400" />
        Activity History
      </h3>

      <ul className="space-y-3">
        {mockHistory.map((event, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-slate-cyan mt-1.5" />
            <div className="flex-1">
              <p className="text-sm">{event.action}</p>
              <p className="text-xs text-slate-500 mt-1">{event.timestamp}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
