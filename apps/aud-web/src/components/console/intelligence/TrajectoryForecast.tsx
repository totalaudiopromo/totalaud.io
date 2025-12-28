'use client'

import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'

interface TrajectoryForecastProps {
  forecast: Record<string, any>
  opportunityWindows: Array<{
    start: string
    end: string
    reason: string
  }>
  riskIndicators: string[]
  confidence: number
}

export function TrajectoryForecast({
  forecast,
  opportunityWindows,
  riskIndicators,
  confidence,
}: TrajectoryForecastProps) {
  const forecastData = Object.entries(forecast).map(([day, metrics]: [string, any]) => ({
    day: parseInt(day.replace('day_', '')),
    ...metrics,
  }))

  return (
    <div className="space-y-6">
      {/* Forecast Chart */}
      <Card>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-ta-white lowercase">90-day forecast</h3>
          <Badge variant="info">{(confidence * 100).toFixed(0)}% confidence</Badge>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#161A1D" />
            <XAxis
              dataKey="day"
              stroke="#9CA3AF"
              style={{ fontSize: '12px', fontFamily: 'var(--font-geist-mono), monospace' }}
            />
            <YAxis
              stroke="#9CA3AF"
              style={{ fontSize: '12px', fontFamily: 'var(--font-geist-mono), monospace' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#161A1D',
                border: '1px solid #161A1D',
                borderRadius: '8px',
                color: '#E9EDEF',
              }}
            />
            <Area
              type="monotone"
              dataKey="coverageEvents"
              stroke="#3AA9BE"
              fill="#3AA9BE"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="replyRate"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Opportunity Windows */}
      <Card>
        <h3 className="text-lg font-semibold text-ta-white lowercase mb-4">opportunity windows</h3>
        <div className="space-y-3">
          {opportunityWindows.map((window, i) => (
            <div key={i} className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs text-green-400 font-mono">
                  {window.start} → {window.end}
                </p>
              </div>
              <p className="text-sm text-ta-white lowercase">{window.reason}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Risk Indicators */}
      {riskIndicators.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-ta-white lowercase mb-4">risk indicators</h3>
          <ul className="space-y-2">
            {riskIndicators.map((risk, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ta-white">
                <span className="text-red-400">!</span>
                <span className="lowercase">{risk}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
