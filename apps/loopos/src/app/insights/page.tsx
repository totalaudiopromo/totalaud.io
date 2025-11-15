'use client'

import { PageHeader } from '@/components/PageHeader'
import { TrendingUp, Target, Clock, Zap } from 'lucide-react'

interface MetricCard {
  title: string
  value: string | number
  change?: string
  icon: React.ReactNode
  colour: string
}

export default function InsightsPage() {
  const metrics: MetricCard[] = [
    {
      title: 'Flow Score',
      value: 78,
      change: '+12%',
      icon: <Zap className="w-5 h-5" />,
      colour: 'text-yellow-500',
    },
    {
      title: 'Active Nodes',
      value: 12,
      change: '+3',
      icon: <Target className="w-5 h-5" />,
      colour: 'text-slate-cyan',
    },
    {
      title: 'Momentum',
      value: 'High',
      icon: <TrendingUp className="w-5 h-5" />,
      colour: 'text-green-500',
    },
    {
      title: 'Session Time',
      value: '2.5h',
      icon: <Clock className="w-5 h-5" />,
      colour: 'text-blue-500',
    },
  ]

  return (
    <div className="min-h-screen bg-matte-black">
      <PageHeader
        title="Flow Insights"
        description="Real-time campaign metrics and momentum tracking"
      />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric, i) => (
            <div
              key={i}
              className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colours"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={metric.colour}>{metric.icon}</span>
                {metric.change && (
                  <span className="text-xs text-green-500 font-medium">{metric.change}</span>
                )}
              </div>
              <p className="text-2xl font-bold text-white mb-1">{metric.value}</p>
              <p className="text-xs text-gray-500">{metric.title}</p>
            </div>
          ))}
        </div>

        {/* Flow Chart Placeholder */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Flow Score Over Time</h2>
          <div className="h-64 bg-gray-900 rounded-lg flex items-center justify-center">
            <p className="text-gray-600">Chart visualization would go here</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {[
              { action: 'Completed node', detail: 'Research Target Stations', time: '2h ago' },
              { action: 'Added journal entry', detail: 'Feeling focused today', time: '3h ago' },
              { action: 'Started momentum session', detail: 'Flow score: 75', time: '4h ago' },
            ].map((activity, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0"
              >
                <div>
                  <p className="text-sm text-white">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.detail}</p>
                </div>
                <span className="text-xs text-gray-600">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
