'use client'

import { motion } from 'framer-motion'
import {
  Zap,
  Scale,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
} from 'lucide-react'
import type { LoopInsight } from '@/insights/LoopInsightsEngine'

interface LoopInsightsProps {
  insights: LoopInsight[]
  isLoading?: boolean
}

const INSIGHT_CONFIG: Record<
  LoopInsight['type'],
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  momentum: { icon: Zap, color: 'text-accent' },
  balance: { icon: Scale, color: 'text-purple-500' },
  friction: { icon: AlertTriangle, color: 'text-orange-500' },
  opportunity: { icon: Lightbulb, color: 'text-yellow-500' },
  warning: { icon: AlertTriangle, color: 'text-red-500' },
}

export function LoopInsights({ insights, isLoading = false }: LoopInsightsProps) {
  return (
    <div className="rounded-lg border border-foreground/10 bg-background/50 p-6">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-accent" />
        <h3 className="text-lg font-semibold">Loop Insights</h3>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : insights.length === 0 ? (
        <p className="text-sm text-foreground/50">
          No insights available. Add nodes and notes to see AI-powered insights.
        </p>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, index) => {
            const config = INSIGHT_CONFIG[insight.type] || INSIGHT_CONFIG.opportunity
            const Icon = config?.icon || Lightbulb

            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-lg border p-4 ${
                  insight.priority === 'high'
                    ? 'border-red-500/30 bg-red-500/5'
                    : insight.priority === 'medium'
                      ? 'border-yellow-500/30 bg-yellow-500/5'
                      : 'border-foreground/10 bg-foreground/5'
                }`}
              >
                <div className="mb-2 flex items-start gap-2">
                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${config.color}`} />
                  <div className="flex-1">
                    <h4 className="font-medium">{insight.title}</h4>
                  </div>
                  {insight.priority === 'high' && (
                    <span className="shrink-0 rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-500">
                      HIGH
                    </span>
                  )}
                </div>

                <p className="text-sm text-foreground/70">{insight.message}</p>

                {insight.actionable && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-accent">
                    <Lightbulb className="h-3 w-3" />
                    Actionable
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
