import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'

interface CoverageMapCardProps {
  coverage: {
    totalEvents: number
    countriesReached: number
    citiesReached: number
    coverageScore: number
  }
}

export function CoverageMapCard({ coverage }: CoverageMapCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-tap-white lowercase">coverage footprint</h3>
        <Badge variant="info">{coverage.coverageScore.toFixed(0)} score</Badge>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-tap-grey uppercase tracking-wider mb-1">total events</p>
          <p className="text-2xl font-mono font-semibold text-tap-white">{coverage.totalEvents}</p>
        </div>
        <div>
          <p className="text-xs text-tap-grey uppercase tracking-wider mb-1">countries</p>
          <p className="text-2xl font-mono font-semibold text-tap-white">
            {coverage.countriesReached}
          </p>
        </div>
        <div>
          <p className="text-xs text-tap-grey uppercase tracking-wider mb-1">cities</p>
          <p className="text-2xl font-mono font-semibold text-tap-white">
            {coverage.citiesReached}
          </p>
        </div>
      </div>

      <div className="bg-tap-black/30 rounded-lg p-4 border border-tap-panel/30">
        <p className="text-xs text-tap-grey lowercase text-center">
          interactive map view available on coverage page →
        </p>
      </div>
    </Card>
  )
}
