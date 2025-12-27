'use client'

import { Card } from '../ui/Card'
import { motion } from 'framer-motion'
import { MegaphoneIcon, UserGroupIcon, SignalIcon, ChartBarIcon } from '@heroicons/react/24/outline'

interface SnapshotCardProps {
  data: {
    activeCampaigns: number
    totalContacts: number
    coverageEvents: number
    avgReplyRate: number
  }
}

export function SnapshotCard({ data }: SnapshotCardProps) {
  const metrics = [
    {
      label: 'Active Campaigns',
      value: data.activeCampaigns,
      icon: MegaphoneIcon,
      format: (v: number) => v.toString(),
      gradient: 'from-purple-500/20 to-blue-500/5',
    },
    {
      label: 'Total Contacts',
      value: data.totalContacts,
      icon: UserGroupIcon,
      format: (v: number) => v.toLocaleString(),
      gradient: 'from-emerald-500/20 to-teal-500/5',
    },
    {
      label: 'Coverage Events',
      value: data.coverageEvents,
      icon: SignalIcon,
      format: (v: number) => v.toLocaleString(),
      gradient: 'from-orange-500/20 to-red-500/5',
    },
    {
      label: 'Avg Reply Rate',
      value: data.avgReplyRate * 100,
      icon: ChartBarIcon,
      format: (v: number) => `${v.toFixed(1)}%`,
      gradient: 'from-ta-cyan/20 to-blue-500/5',
    },
  ]

  return (
    <Card className="p-0 overflow-hidden bg-gradient-to-br from-[#161A1D] to-[#0F1113] border border-white/5">
      <div className="p-6 border-b border-white/5 bg-white/[0.02]">
        <h3 className="text-lg font-medium text-ta-white tracking-tight">Snapshot</h3>
      </div>

      <div className="grid grid-cols-2">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            className={`
              relative p-6 group cursor-default transition-all duration-300
              border-b border-r border-white/5
              ${i % 2 === 1 ? 'border-r-0' : ''}
              ${i >= 2 ? 'border-b-0' : ''}
              hover:bg-white/[0.02]
            `}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            {/* Hover Glow */}
            <div
              className={`
              absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
              bg-gradient-to-br ${metric.gradient} blur-xl
            `}
            />

            <div className="relative z-10 flex flex-col h-full justify-between gap-4">
              <div className="flex items-start justify-between">
                <p className="text-xs font-medium text-ta-grey/60 uppercase tracking-widest">
                  {metric.label}
                </p>
                <metric.icon className="w-4 h-4 text-ta-grey/40 group-hover:text-ta-cyan transition-colors duration-300" />
              </div>

              <motion.p
                className="text-3xl font-mono text-ta-white font-light tracking-tighter"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
              >
                {metric.format(metric.value)}
              </motion.p>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}
