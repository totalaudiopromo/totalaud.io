'use client'

import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { format } from 'date-fns'

interface CoverageTimelineProps {
  events: Array<{
    id: string
    type: string
    date: Date
    location: {
      country?: string
      city?: string
    }
    title: string
    importance: number
  }>
  geographicClusters: Array<{
    country: string
    eventCount: number
    importance: number
  }>
}

export function CoverageTimeline({ events, geographicClusters }: CoverageTimelineProps) {
  return (
    <div className="space-y-6">
      {/* Geographic Clusters */}
      <Card>
        <h3 className="text-lg font-semibold text-tap-white lowercase mb-4">
          geographic distribution
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {geographicClusters.slice(0, 6).map((cluster) => (
            <div
              key={cluster.country}
              className="p-4 bg-tap-black/30 rounded-lg border border-tap-panel/30"
            >
              <p className="text-xs text-tap-grey uppercase tracking-wider mb-1">
                {cluster.country}
              </p>
              <p className="text-2xl font-mono font-semibold text-tap-white">
                {cluster.eventCount}
              </p>
              <p className="text-xs text-tap-grey lowercase">events</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Timeline */}
      <Card>
        <h3 className="text-lg font-semibold text-tap-white lowercase mb-4">coverage timeline</h3>
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-3 p-3 bg-tap-black/30 rounded-lg border border-tap-panel/30"
            >
              <div className="flex-shrink-0 w-20 text-xs text-tap-grey font-mono">
                {format(event.date, 'MMM dd')}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm text-tap-white lowercase">{event.title}</p>
                  <Badge variant={event.importance > 0.7 ? 'success' : 'default'} size="sm">
                    {(event.importance * 100).toFixed(0)}%
                  </Badge>
                </div>
                {event.location.city && (
                  <p className="text-xs text-tap-grey lowercase">
                    {event.location.city}, {event.location.country}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
