import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'

interface BenchmarkTableProps {
  artistComparisons: Array<{
    artistSlug: string
    artistName: string
    replyQuality: number
    scenePenetration: number
    momentum: number
    overallScore: number
    rank: number
  }>
  insights: string[]
}

export function BenchmarkTable({ artistComparisons, insights }: BenchmarkTableProps) {
  return (
    <div className="space-y-6">
      {/* Insights */}
      <Card>
        <h3 className="text-lg font-semibold text-ta-white lowercase mb-4">workspace insights</h3>
        <ul className="space-y-2">
          {insights.map((insight, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-ta-white">
              <span className="text-ta-cyan">→</span>
              <span className="lowercase">{insight}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Comparison Table */}
      <Card padding="sm">
        <h3 className="text-lg font-semibold text-ta-white lowercase mb-4 px-4 pt-2">
          artist comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ta-panel/50">
                <th className="px-4 py-3 text-left text-xs text-ta-grey uppercase tracking-wider">
                  rank
                </th>
                <th className="px-4 py-3 text-left text-xs text-ta-grey uppercase tracking-wider">
                  artist
                </th>
                <th className="px-4 py-3 text-right text-xs text-ta-grey uppercase tracking-wider">
                  reply quality
                </th>
                <th className="px-4 py-3 text-right text-xs text-ta-grey uppercase tracking-wider">
                  scene penetration
                </th>
                <th className="px-4 py-3 text-right text-xs text-ta-grey uppercase tracking-wider">
                  momentum
                </th>
                <th className="px-4 py-3 text-right text-xs text-ta-grey uppercase tracking-wider">
                  overall score
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ta-panel/30">
              {artistComparisons.map((artist) => (
                <tr key={artist.artistSlug} className="hover:bg-ta-panel/30 transition-colors">
                  <td className="px-4 py-3">
                    <Badge variant={artist.rank === 1 ? 'success' : 'default'} size="sm">
                      #{artist.rank}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-ta-white lowercase">{artist.artistName}</td>
                  <td className="px-4 py-3 text-right text-sm font-mono text-ta-white">
                    {(artist.replyQuality * 100).toFixed(0)}%
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-mono text-ta-white">
                    {(artist.scenePenetration * 100).toFixed(0)}%
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-mono text-ta-white">
                    {(artist.momentum * 100).toFixed(0)}%
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-mono text-ta-cyan">
                    {artist.overallScore.toFixed(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
