'use client'

import { TrendingUp, AlertTriangle, Lightbulb, ListChecks } from 'lucide-react'
import type { JournalEntry } from '@/types'
import { useMomentumStore } from '@/stores/momentum'

interface JournalInsightsProps {
  entry: JournalEntry
}

export function JournalInsights({ entry }: JournalInsightsProps) {
  const { momentum } = useMomentumStore()

  return (
    <div className="space-y-4">
      {/* Momentum */}
      <div className="p-4 bg-[var(--border)] border border-[var(--border-subtle)] rounded">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-slate-cyan" />
          <h3 className="font-semibold">Today's Momentum</h3>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Current</span>
            <span className="font-bold text-xl">{entry.momentum || momentum.current}%</span>
          </div>

          <div className="w-full bg-matte-black rounded-full h-3">
            <div
              className="bg-slate-cyan h-3 rounded-full transition-all duration-500"
              style={{ width: `${entry.momentum || momentum.current}%` }}
            />
          </div>

          <p className="text-xs text-slate-500">
            Trend: <span className="capitalize">{momentum.trend}</span>
          </p>
        </div>
      </div>

      {/* AI Summary */}
      {entry.aiSummary && (
        <div className="p-4 bg-slate-cyan/5 border border-slate-cyan/20 rounded">
          <h3 className="font-semibold mb-2 text-slate-cyan">AI Summary</h3>
          <p className="text-sm text-slate-300 leading-relaxed">{entry.aiSummary}</p>
        </div>
      )}

      {/* Blockers */}
      {entry.blockers && entry.blockers.length > 0 && (
        <div className="p-4 bg-red-500/5 border border-red-500/20 rounded">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h3 className="font-semibold text-red-400">Blockers</h3>
          </div>
          <ul className="space-y-2">
            {entry.blockers.map((blocker, i) => (
              <li key={i} className="text-sm text-red-300 flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>{blocker}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Emerging Themes */}
      {entry.themes && entry.themes.length > 0 && (
        <div className="p-4 bg-[var(--border)] border border-[var(--border-subtle)] rounded">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold">Emerging Themes</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {entry.themes.map((theme, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tomorrow's Actions */}
      {entry.tomorrowActions && entry.tomorrowActions.length > 0 && (
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded">
          <div className="flex items-center gap-2 mb-3">
            <ListChecks className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-emerald-400">Tomorrow's 5 Actions</h3>
          </div>
          <ul className="space-y-2">
            {entry.tomorrowActions.map((action, i) => (
              <li key={i} className="text-sm text-emerald-300 flex items-start gap-2">
                <span className="text-emerald-500 mt-1">{i + 1}.</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Linked Nodes */}
      {entry.linkedNodes && entry.linkedNodes.length > 0 && (
        <div className="p-4 bg-[var(--border)] border border-[var(--border-subtle)] rounded">
          <h3 className="font-semibold mb-3">Linked Nodes ({entry.linkedNodes.length})</h3>
          <div className="space-y-2">
            {entry.linkedNodes.map((nodeId) => (
              <div
                key={nodeId}
                className="px-3 py-2 bg-matte-black rounded text-sm font-mono text-slate-400"
              >
                {nodeId.slice(0, 8)}...
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
