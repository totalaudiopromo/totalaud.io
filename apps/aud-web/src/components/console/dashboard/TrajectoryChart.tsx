'use client'

import { Card } from '../ui/Card'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ArrowTrendingUpIcon } from '@heroicons/react/24/outline'

interface TrajectoryChartProps {
  data: Array<{
    day: number
    coverageEvents: number
    replyRate: number
  }>
}

export function TrajectoryChart({ data }: TrajectoryChartProps) {
  return (
    <Card className="bg-[#161A1D] border border-white/5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ArrowTrendingUpIcon className="w-5 h-5 text-ta-cyan" />
          <h3 className="text-lg font-medium text-ta-white tracking-tight">Campaign Trajectory</h3>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-ta-cyan shadow-[0_0_8px_rgba(58,169,190,0.5)]" />
            <span className="text-ta-grey">Coverage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-ta-grey">Replies</span>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center border border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
          <p className="text-sm text-ta-grey">Not enough data to project trajectory yet.</p>
        </div>
      ) : (
        <div className="h-[300px] w-full -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCoverage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3AA9BE" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3AA9BE" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorReply" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                stroke="#6B7280"
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-geist-mono), monospace',
                  textTransform: 'uppercase',
                }}
                tickFormatter={(v) => `+${v} Days`}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#6B7280"
                style={{ fontSize: '10px', fontFamily: 'var(--font-geist-mono), monospace' }}
                tickLine={false}
                axisLine={false}
                dx={-10}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#161A1D]/90 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-xl">
                        <p className="text-xs font-mono text-ta-grey mb-2 uppercase">Day {label}</p>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-ta-white flex items-center justify-between gap-4">
                            <span className="text-ta-cyan">Coverage</span>
                            <span>{payload[0].value}</span>
                          </p>
                          <p className="text-sm font-medium text-ta-white flex items-center justify-between gap-4">
                            <span className="text-emerald-500">Reply Rate</span>
                            <span>{Number(payload[1].value).toFixed(2)}%</span>
                          </p>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="coverageEvents"
                stroke="#3AA9BE"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCoverage)"
              />
              <Area
                type="monotone"
                dataKey="replyRate"
                stroke="#10B981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorReply)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
