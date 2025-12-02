import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'

interface PatternsGridProps {
  patterns: Array<{
    id: string
    pattern: string
    confidence: number
    impact: string
  }>
}

export function PatternsGrid({ patterns }: PatternsGridProps) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-tap-white lowercase mb-4">detected patterns</h3>
      {patterns.length === 0 ? (
        <p className="text-sm text-tap-grey lowercase">no patterns detected yet</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patterns.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-tap-black/30 rounded-lg border border-tap-panel/30"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm text-tap-white lowercase flex-1">{item.pattern}</p>
                <Badge variant="info" size="sm">
                  {(item.confidence * 100).toFixed(0)}%
                </Badge>
              </div>
              <p className="text-xs text-tap-grey lowercase">{item.impact}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
