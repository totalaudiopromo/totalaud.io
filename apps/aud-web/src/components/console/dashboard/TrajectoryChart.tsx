'use client'

import { Card } from '../ui/Card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface TrajectoryChartProps {
  data: Array<{
    day: number
    coverageEvents: number
    replyRate: number
  }>
}

export function TrajectoryChart({ data }: TrajectoryChartProps) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-tap-white lowercase mb-4">90-day trajectory</h3>
      {data.length === 0 ? (
        <p className="text-sm text-tap-grey lowercase">no trajectory data available</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#161A1D" />
            <XAxis
              dataKey="day"
              stroke="#9CA3AF"
              style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
            />
            <YAxis stroke="#9CA3AF" style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#161A1D',
                border: '1px solid #161A1D',
                borderRadius: '8px',
                color: '#E9EDEF',
              }}
            />
            <Line
              type="monotone"
              dataKey="coverageEvents"
              stroke="#3AA9BE"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="replyRate"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
