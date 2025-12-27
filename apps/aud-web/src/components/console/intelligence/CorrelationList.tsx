import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'

interface CorrelationListProps {
  correlations: Record<string, { correlation: number; replyRate?: number; openRate?: number }>
  highlights: string[]
  recommendations: string[]
}

export function CorrelationList({
  correlations,
  highlights,
  recommendations,
}: CorrelationListProps) {
  return (
    <div className="space-y-6">
      {/* Highlights */}
      <Card>
        <h3 className="text-lg font-semibold text-ta-white lowercase mb-4">key findings</h3>
        <ul className="space-y-2">
          {highlights.map((highlight, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-ta-white">
              <span className="text-ta-cyan">→</span>
              <span className="lowercase">{highlight}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Correlations */}
      <Card>
        <h3 className="text-lg font-semibold text-ta-white lowercase mb-4">
          correlations detected
        </h3>
        <div className="space-y-3">
          {Object.entries(correlations).map(([key, value]) => (
            <div key={key} className="p-4 bg-ta-black/30 rounded-lg border border-ta-panel/30">
              <div className="flex items-start justify-between gap-4 mb-2">
                <p className="text-sm text-ta-white lowercase flex-1">{key.replace(/_/g, ' ')}</p>
                <Badge variant="info">{(value.correlation * 100).toFixed(0)}%</Badge>
              </div>
              {value.replyRate !== undefined && (
                <p className="text-xs text-ta-grey lowercase">
                  reply rate: {(value.replyRate * 100).toFixed(1)}%
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Recommendations */}
      <Card>
        <h3 className="text-lg font-semibold text-ta-white lowercase mb-4">recommendations</h3>
        <ul className="space-y-2">
          {recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-ta-white">
              <span className="text-green-400">✓</span>
              <span className="lowercase">{rec}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
