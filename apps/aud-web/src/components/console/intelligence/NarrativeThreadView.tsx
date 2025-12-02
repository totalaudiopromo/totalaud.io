import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { format } from 'date-fns'

interface NarrativeThreadViewProps {
  thread: {
    threadType: string
    events: Array<{
      id: string
      date: Date
      type: string
      title: string
      description: string
      significance: number
    }>
    milestones: Array<{
      id: string
      date: Date
      title: string
      description: string
      impact: string
    }>
    narrativeSummary: string
    insights: string[]
  }
}

export function NarrativeThreadView({ thread }: NarrativeThreadViewProps) {
  const getEventColor = (type: string) => {
    switch (type) {
      case 'coverage':
        return 'success'
      case 'campaign_start':
        return 'info'
      case 'creative_release':
        return 'warning'
      case 'reply':
        return 'success'
      default:
        return 'default'
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <h3 className="text-lg font-semibold text-tap-white lowercase mb-4">narrative summary</h3>
        <p className="text-sm text-tap-white leading-relaxed lowercase">
          {thread.narrativeSummary}
        </p>
      </Card>

      {/* Milestones */}
      {thread.milestones.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-tap-white lowercase mb-4">key milestones</h3>
          <div className="space-y-4">
            {thread.milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="p-4 bg-tap-cyan/10 rounded-lg border border-tap-cyan/20"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-20 text-xs text-tap-grey font-mono">
                    {format(milestone.date, 'MMM dd, yyyy')}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-tap-white lowercase font-semibold mb-1">
                      {milestone.title}
                    </p>
                    <p className="text-xs text-tap-grey lowercase mb-2">{milestone.description}</p>
                    <p className="text-xs text-tap-cyan lowercase">impact: {milestone.impact}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <h3 className="text-lg font-semibold text-tap-white lowercase mb-4">full timeline</h3>
        <div className="space-y-3">
          {thread.events.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-3 p-3 bg-tap-black/30 rounded-lg border border-tap-panel/30"
            >
              <div className="flex-shrink-0 w-20 text-xs text-tap-grey font-mono">
                {format(event.date, 'MMM dd')}
              </div>
              <div className="flex-1">
                <p className="text-sm text-tap-white lowercase mb-1">{event.title}</p>
                <p className="text-xs text-tap-grey lowercase mb-2">{event.description}</p>
                <Badge variant={getEventColor(event.type)} size="sm">
                  {event.type.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Insights */}
      {thread.insights.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-tap-white lowercase mb-4">insights</h3>
          <ul className="space-y-2">
            {thread.insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-tap-white">
                <span className="text-tap-cyan">→</span>
                <span className="lowercase">{insight}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
